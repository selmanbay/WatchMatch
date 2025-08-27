package com.matchflix.backend.reco;

import com.matchflix.backend.dto.MovieDto;
import com.matchflix.backend.mapper.MovieMapper;               // statik util sınıfın
import com.matchflix.backend.ml.MochinefClient;
import com.matchflix.backend.ml.MochinefClient.RecoItem;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class RecoService {

    private final MochinefClient mochi;
    private final TmdbResolverService resolver;
    private final MovieRepository movieRepo;

    @Value("${reco.userSalt}")
    private String userSalt;

    public RecoService(MochinefClient mochi,
                       TmdbResolverService resolver,
                       MovieRepository movieRepo) {
        this.mochi = mochi;
        this.resolver = resolver;
        this.movieRepo = movieRepo;
    }

    /** Kişisel öneri akışı */
    public List<MovieDto> personal(Long userId, int limit) {
        String userExtId = hashUser(userId);

        // Biraz fazla çekip (gerekirse) TMDb'ye resolve edeceğiz
        List<RecoItem> raw = mochi.getRecommendations(userExtId, Math.max(limit * 2, 40));

        List<Long> tmdbIds = raw.stream()
                .map(this::ensureTmdbId)
                .flatMap(Optional::stream)
                .distinct()
                .limit(limit)
                .toList();

        // DB'den çek, sırayı koru
        Map<Long, Movie> dbMap = movieRepo.findByTmdbIdIn(tmdbIds).stream()
                .collect(Collectors.toMap(
                        Movie::getTmdbId, m -> m, (a, b) -> a, LinkedHashMap::new
                ));

        return tmdbIds.stream()
                .map(dbMap::get)
                .filter(Objects::nonNull)
                .map(MovieMapper::toDto)  // statik util
                .toList();
    }

    public List<MochinefClient.MovieSearchResult> searchByTitle(String query) {
        return mochi.searchMovieByTitle(query);
    }

    /** İki kullanıcı için matching öneri akışı */
    public List<MovieDto> match(Long userA, Long userB, int limit) {
        var recA = mochi.getRecommendations(hashUser(userA), Math.max(limit * 3, 60));
        var recB = mochi.getRecommendations(hashUser(userB), Math.max(limit * 3, 60));

        Map<Long, Double> aMap = toTmdbScoreMap(recA);
        Map<Long, Double> bMap = toTmdbScoreMap(recB);

        // 1) Kesişim: ikisine birden önerilmiş olanlara bonus
        Map<Long, Double> inter = aMap.keySet().stream()
                .filter(bMap::containsKey)
                .collect(Collectors.toMap(
                        k -> k,
                        k -> 0.6 * aMap.get(k) + 0.6 * bMap.get(k) + 0.2, // intersection boost
                        (x, y) -> x,
                        LinkedHashMap::new
                ));

        // 2) Birleşim: kesişimde olmayanlar için ağırlıklı skor
        Map<Long, Double> union = new LinkedHashMap<>();
        Stream.concat(aMap.keySet().stream(), bMap.keySet().stream())
                .distinct()
                .filter(k -> !inter.containsKey(k))
                .forEach(k -> {
                    double sa = aMap.getOrDefault(k, 0.0);
                    double sb = bMap.getOrDefault(k, 0.0);
                    union.put(k, 0.7 * Math.max(sa, sb) + 0.3 * ((sa + sb) / 2.0));
                });

        // 3) Sırala, limit uygula
        List<Long> ranked = Stream.concat(inter.entrySet().stream(), union.entrySet().stream())
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .toList();

        Map<Long, Movie> dbMap = movieRepo.findByTmdbIdIn(ranked).stream()
                .collect(Collectors.toMap(
                        Movie::getTmdbId, m -> m, (a, b) -> a, LinkedHashMap::new
                ));

        return ranked.stream()
                .map(dbMap::get)
                .filter(Objects::nonNull)
                .map(MovieMapper::toDto) // statik util
                .toList();
    }

    /** Mochinef item'ından tmdb_id üret: varsa direkt al; yoksa TMDb search ile çöz */
    private Optional<Long> ensureTmdbId(RecoItem it) {
        if (it == null) return Optional.empty();
        if (it.tmdb_id() != null) return Optional.of(it.tmdb_id());
        return resolver.resolveToTmdbId(it.title(), it.year(), it.original_language());
    }

    /** Mochinef item listesini tmdb_id -> skor map'ine indirger (resolve içerir) */
    private Map<Long, Double> toTmdbScoreMap(List<RecoItem> items) {
        Map<Long, Double> map = new LinkedHashMap<>();
        if (items == null) return map;
        for (RecoItem it : items) {
            Optional<Long> maybe = ensureTmdbId(it);
            if (maybe.isPresent()) {
                Long id = maybe.get();
                map.putIfAbsent(id, it.score() != null ? it.score() : 0.5); // default skor
            }
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
            // Development fallback
            return "wm:" + uid;
        }
    }
}
