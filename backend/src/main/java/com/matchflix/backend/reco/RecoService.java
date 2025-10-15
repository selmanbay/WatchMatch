// src/main/java/com/matchflix/backend/reco/RecoService.java
package com.matchflix.backend.reco;

import com.matchflix.backend.dto.MovieDto;
import com.matchflix.backend.mapper.MovieMapper;
import com.matchflix.backend.ml.MochinefClient;
import com.matchflix.backend.ml.MochinefClient.RecoItem;
import com.matchflix.backend.ml.MochinefClient.MovieSearchResult;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecoService {

    private final MochinefClient mochi;
    private final TmdbResolverService resolver;
    private final MovieRepository movieRepo;

    @Value("${reco.userSalt:wm-dev-salt}")
    private String userSalt;

    public RecoService(MochinefClient mochi,
                       TmdbResolverService resolver,
                       MovieRepository movieRepo) {
        this.mochi = mochi;
        this.resolver = resolver;
        this.movieRepo = movieRepo;
    }

    /** Kişisel öneri akışı: KULLANICININ LİSTELERİNDEN seed → FastAPI */
    public List<MovieDto> personal(Long userId, int limit) {
        String userExtId = hashUser(userId);
        int fetch = Math.max(limit * 3, 60);

        // 1) Kullanıcının listelerinden 3-5 seed TMDb id çek
        List<Long> userSeeds = movieRepo.findSeedTmdbIdsByUser(userId, PageRequest.of(0, 5));

        // 2) Seed varsa seed'li çağrı; yoksa global fallback
        List<RecoItem> raw = !userSeeds.isEmpty()
                ? mochi.getRecommendationsWithSeeds(userSeeds, fetch)
                : mochi.getRecommendations(userExtId, fetch);

        if (raw == null || raw.isEmpty()) return List.of();

        // 3) TMDb id çöz (FastAPI zaten id=tmdb_id döndürüyor; yine de koruyalım)
        List<Long> tmdbIds = raw.stream()
                .map(this::ensureTmdbId)
                .flatMap(Optional::stream)
                .distinct()
                .limit(limit)
                .toList();

        if (tmdbIds.isEmpty()) return List.of();

        // 4) DB'den sırayla çek → DTO
        Map<Long, Movie> dbMap = movieRepo.findByTmdbIdIn(tmdbIds).stream()
                .collect(Collectors.toMap(
                        Movie::getTmdbId, m -> m, (a, b) -> a, LinkedHashMap::new
                ));

        return tmdbIds.stream()
                .map(dbMap::get)
                .filter(Objects::nonNull)
                .map(MovieMapper::toDto)
                .toList();
    }

    /** Arama (mochinef /movies/search passthrough) */
    public List<MovieSearchResult> searchByTitle(String query) {
        return mochi.searchMovieByTitle(query);
    }

    /** İki kullanıcı için matching öneri */
    public List<MovieDto> match(Long userA, Long userB, int limit) {
        var recA = mochi.getRecommendations(hashUser(userA), Math.max(limit * 3, 60));
        var recB = mochi.getRecommendations(hashUser(userB), Math.max(limit * 3, 60));

        Map<Long, Double> aMap = toTmdbScoreMap(recA);
        Map<Long, Double> bMap = toTmdbScoreMap(recB);

        Map<Long, Double> inter = aMap.keySet().stream()
                .filter(bMap::containsKey)
                .collect(Collectors.toMap(
                        k -> k,
                        k -> 0.6 * aMap.get(k) + 0.6 * bMap.get(k) + 0.2, // intersection boost
                        (x, y) -> x,
                        LinkedHashMap::new
                ));

        Map<Long, Double> union = new LinkedHashMap<>();

// önce tüm keyleri ekle
        aMap.keySet().forEach(k -> union.put(k, 0.0));
        bMap.keySet().forEach(k -> union.putIfAbsent(k, 0.0));

// inter’de olanları çıkar
        union.keySet().removeAll(inter.keySet());

// skorları hesapla
        union.replaceAll((k, v) -> {
            double sa = aMap.getOrDefault(k, 0.0);
            double sb = bMap.getOrDefault(k, 0.0);
            return 0.7 * Math.max(sa, sb) + 0.3 * ((sa + sb) / 2.0);
        });

// inter ve union'u ayrı ayrı sırala → key listeleri
        List<Long> interRanked = inter.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .toList();

        List<Long> unionRanked = union.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .toList();

// birleştir
        List<Long> ranked = new ArrayList<>(interRanked.size() + unionRanked.size());
        ranked.addAll(interRanked);
        ranked.addAll(unionRanked);

// limit uygula (yeni liste oluştur ki subList view olmasın)
        if (ranked.size() > limit) {
            ranked = new ArrayList<>(ranked.subList(0, limit));
        }

        Map<Long, Movie> dbMap = movieRepo.findByTmdbIdIn(ranked).stream()
                .collect(Collectors.toMap(
                        Movie::getTmdbId, m -> m, (a, b) -> a, LinkedHashMap::new
                ));

        return ranked.stream()
                .map(dbMap::get)
                .filter(Objects::nonNull)
                .map(MovieMapper::toDto)
                .toList();
    }

    /** Mochinef item'ından tmdb_id üret: varsa direkt al; yoksa TMDb search ile çöz */
    private Optional<Long> ensureTmdbId(RecoItem it) {
        if (it == null) return Optional.empty();
        if (it.tmdb_id() != null) return Optional.of(it.tmdb_id());
        return resolver.resolveToTmdbId(it.title(), it.year(), it.original_language());
    }

    /** Listeyi tmdb_id -> skor map'ine indirger (sıra korunur) */
    private Map<Long, Double> toTmdbScoreMap(List<RecoItem> items) {
        Map<Long, Double> map = new LinkedHashMap<>();
        if (items == null || items.isEmpty()) return map;
        for (RecoItem it : items) {
            if (it == null) continue;
            Long id = it.tmdb_id();
            if (id == null) {
                Optional<Long> maybe = ensureTmdbId(it);
                if (maybe.isEmpty()) continue;
                id = maybe.get();
            }
            map.putIfAbsent(id, it.score() != null ? it.score() : 0.5);
        }
        return map;
    }

    /** Kullanıcıyı gizlilik için hash'ler: sha256(salt:watchmatch:userId) */
    private String hashUser(Long uid) {
        try {
            String src = userSalt + ":watchmatch:" + uid;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] dig = md.digest(src.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder("sha256:");
            for (byte b : dig) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "wm:" + uid;
        }
    }
}
