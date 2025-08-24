package com.matchflix.backend.service;

import com.matchflix.backend.model.*;
import com.matchflix.backend.repository.UserGenreWeightRepository;
import com.matchflix.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class MatchService {

    private final UserGenreWeightRepository weightsRepo;
    private final UserRepository userRepository;

    // Liste tiplerine ağırlıklar
    private static final double W_WATCHED  = 1.0;
    private static final double W_WISHLIST = 0.5;
    private static final double W_LIKE     = 0.7;
    private static final double W_DISLIKE  = -0.5;
    private static final double W_OTHER    = 0.2;

    public MatchService(UserGenreWeightRepository weightsRepo, UserRepository userRepository) {
        this.weightsRepo = weightsRepo;
        this.userRepository = userRepository;
    }

    /** 1) Kullanıcının genre vektörünü hesapla ve UPSERT et. */
    @Transactional
    public void refreshUserVector(Long userId) {
        // 1) User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // 2) Tür ağırlıkları
        Map<Long, Double> genreWeights = new HashMap<>();
        Set<Long> seenMovieIds = new HashSet<>(); // aynı filmi bir kez say

        if (user.getMovieLists() != null) {
            for (MovieList list : user.getMovieLists()) {
                double weightFactor = switch (list.getListType()) {
                    case WATCHED -> W_WATCHED;
                    case WISHLIST -> W_WISHLIST;
                    case LIKE -> W_LIKE;
                    case DISLIKE -> W_DISLIKE;
                    default -> W_OTHER;
                };

                if (list.getMovies() == null) continue;
                for (Movie movie : list.getMovies()) {
                    if (movie == null || movie.getId() == null) continue;
                    if (!seenMovieIds.add(movie.getId())) continue;

                    if (movie.getGenres() == null) continue;
                    for (Genre genre : movie.getGenres()) {
                        if (genre == null || genre.getId() == null) continue;
                        genreWeights.merge(genre.getId(), weightFactor, Double::sum);
                    }
                }
            }
        }

        // Negatif kalanları 0'a çek (cosine için)
        if (!genreWeights.isEmpty()) {
            for (Map.Entry<Long, Double> e : new ArrayList<>(genreWeights.entrySet())) {
                if (e.getValue() < 0) genreWeights.put(e.getKey(), 0.0);
            }
        }

        // 3) Serialize + norm
        String vector = serializeVector(genreWeights);
        double norm = l2(genreWeights);

        // 4) UPSERT
        UserGenreWeights row = weightsRepo.findByUserId(userId).orElseGet(() -> {
            UserGenreWeights ugw = new UserGenreWeights();
            ugw.setUserId(userId);
            return ugw;
        });

        row.setCountryId(user.getCountry() != null ? user.getCountry().getId() : null);
        row.setWeightsVector(vector);
        row.setVectorNorm(norm);
        row.setUpdatedAt(Instant.now());

        weightsRepo.save(row);
    }

    /** 2) Benzer kullanıcıları getir (cosine). */
    @Transactional(readOnly = true)
    public List<MatchItem> findMatches(Long userId, int limit, boolean sameCountryOnly) {
        if (limit <= 0) limit = 20;

        User me = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        UserGenreWeights meRow = weightsRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Önce vektörü hesapla (POST /api/match/refresh/" + userId + ")"));

        Map<Long, Double> vMe = deserialize(meRow.getWeightsVector());
        double nMe = meRow.getVectorNorm() != null ? meRow.getVectorNorm() : l2(vMe);
        if (nMe == 0) return List.of();

        var page = PageRequest.of(0, Math.max(limit * 3, limit));

        var candidates = sameCountryOnly
                ? weightsRepo.findSameCountryOrBothNull(me.getCountry() != null ? me.getCountry().getId() : null,
                userId, page)
                : weightsRepo.findAllExcept(userId, page);

        List<MatchItem> out = new ArrayList<>();
        for (UserGenreWeights other : candidates) {
            if (Objects.equals(other.getUserId(), userId)) continue;

            Map<Long, Double> vO = deserialize(other.getWeightsVector());
            double nO = other.getVectorNorm() != null ? other.getVectorNorm() : l2(vO);
            if (nO == 0) continue;

            double sim = dot(vMe, vO) / (nMe * nO);
            if (sim <= 0) continue;

            User u = userRepository.findById(other.getUserId()).orElse(null);
            if (u == null) continue;

            MatchItem mi = new MatchItem();
            mi.userId   = u.getId();
            mi.username = u.getUsername();
            mi.countryId = (u.getCountry() != null) ? u.getCountry().getId() : null;
            mi.avatarUrl = u.getPp_link();
            mi.score    = (int)Math.round(sim * 100); // 0..100
            out.add(mi);
        }

        out.sort((a, b) -> Integer.compare(b.score, a.score));
        if (out.size() > limit) out = out.subList(0, limit);
        return out;
    }

    // ------------ yardımcılar ------------
    private static String serializeVector(Map<Long, Double> weights) {
        if (weights == null || weights.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        weights.forEach((id, w) -> {
            if (Math.abs(w) > 1e-9) sb.append(id).append(':').append(w).append(',');
        });
        return sb.toString();
    }

    private static Map<Long, Double> deserialize(String vector) {
        Map<Long, Double> map = new HashMap<>();
        if (vector == null || vector.isBlank()) return map;
        for (String p : vector.split(",")) {
            if (p.isBlank()) continue;
            String[] kv = p.split(":");
            if (kv.length != 2) continue;
            try {
                map.put(Long.parseLong(kv[0].trim()), Double.parseDouble(kv[1].trim()));
            } catch (NumberFormatException ignored) { }
        }
        return map;
    }

    private static double l2(Map<Long, Double> v) {
        double s = 0;
        for (double x : v.values()) s += x*x;
        return Math.sqrt(s);
    }

    private static double dot(Map<Long, Double> a, Map<Long, Double> b) {
        // küçük map üzerinden dön
        if (a.size() > b.size()) { var t = a; a = b; b = t; }
        double d = 0;
        for (var e : a.entrySet()) {
            Double bv = b.get(e.getKey());
            if (bv != null) d += e.getValue() * bv;
        }
        return d;
    }

    // Dönen DTO
    public static class MatchItem {
        public Long userId;
        public String username;
        public Long countryId;
        public String avatarUrl;
        public int score;
    }
}
