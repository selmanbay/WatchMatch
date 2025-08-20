package com.matchflix.backend.service;

import com.matchflix.backend.model.Genre;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieList;
import com.matchflix.backend.model.User;
import com.matchflix.backend.model.UserGenreWeights;
import com.matchflix.backend.repository.UserGenreWeightRepository;
import com.matchflix.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Match & vektör servisimiz (UPSERT fix'li).
 */
@Service
public class MatchService {

    private final UserGenreWeightRepository weightsRepo;
    private final UserRepository userRepository;

    public MatchService(UserGenreWeightRepository weightsRepo, UserRepository userRepository) {
        this.weightsRepo = weightsRepo;
        this.userRepository = userRepository;
    }

    /** 1) Kullanıcının genre vektörünü hesapla ve UPSERT et. */
    @Transactional
    public void refreshUserVector(Long userId) {
        // 1) User entity'yi yükle
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // 2) Tür ağırlıklarını topla
        Map<Long, Double> genreWeights = new HashMap<>();

        if (user.getMovieLists() != null) {
            for (MovieList list : user.getMovieLists()) {
                // ListType: WATCHED 1.0, WISHLIST 0.5, OTHER 0.2 (istersen 0.0 yap)
                double weightFactor = switch (list.getListType()) {
                    case WATCHED -> 1.0;
                    case WISHLIST -> 0.5;
                    default -> 0.2;
                };

                if (list.getMovies() == null) continue;

                for (Movie movie : list.getMovies()) {
                    if (movie.getGenres() == null) continue;
                    for (Genre genre : movie.getGenres()) {
                        genreWeights.merge(genre.getId(), weightFactor, Double::sum);
                    }
                }
            }
        }

        // 3) Vektörü serialize et (örn: "3:2.0,5:0.5,")
        String vector = serializeVector(genreWeights);

        // 4) UPSERT: user_id UNIQUE olduğu için önce bul, yoksa oluştur
        UserGenreWeights weightsRow = weightsRepo.findByUserId(userId)
                .orElseGet(() -> {
                    UserGenreWeights ugw = new UserGenreWeights();
                    ugw.setUserId(userId); // kritik!
                    return ugw;
                });

        Long countryId = user.getCountry() != null ? user.getCountry().getId() : null;
        weightsRow.setCountryId(countryId);
        weightsRow.setWeightsVector(vector);

        weightsRepo.save(weightsRow); // varsa UPDATE, yoksa INSERT
    }

    /** 2) Aynı ülkeden en yakın eşleşmeler (basit cosine) – userId ve limit alır. */
    @Transactional(readOnly = true)
    public List<Long> findMatchesByCountry(Long userId, int limit) {
        User me = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        UserGenreWeights meRow = weightsRepo.findByUserId(userId).orElse(null);
        if (meRow == null || meRow.getWeightsVector() == null) return List.of();

        Map<Long, Double> meVec = deserialize(meRow.getWeightsVector());

        var others = weightsRepo.findByCountryIdAndUserIdNot(
                me.getCountry() != null ? me.getCountry().getId() : null,
                userId,
                PageRequest.of(0, Math.max(limit, 1))
        );

        // hesapla + sırala
        List<Map.Entry<Long, Integer>> scores = new ArrayList<>();
        for (UserGenreWeights other : others) {
            Map<Long, Double> ov = deserialize(other.getWeightsVector());
            double sim = cosineSimilarity(meVec, ov);
            scores.add(Map.entry(other.getUserId(), (int)Math.round(sim * 100)));
        }
        scores.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));

        // sadece id listesini dön (istersen skorlu DTO dönebiliriz)
        List<Long> result = new ArrayList<>();
        for (var e : scores) result.add(e.getKey());
        return result;
    }

    // ---------------- yardımcılar ----------------

    private String serializeVector(Map<Long, Double> weights) {
        if (weights == null || weights.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        weights.forEach((id, w) -> sb.append(id).append(":").append(w).append(","));
        return sb.toString();
    }

    private Map<Long, Double> deserialize(String vector) {
        Map<Long, Double> map = new HashMap<>();
        if (vector == null || vector.isBlank()) return map;
        for (String p : vector.split(",")) {
            if (p.isBlank()) continue;
            String[] kv = p.split(":");
            if (kv.length != 2) continue;
            map.put(Long.parseLong(kv[0]), Double.parseDouble(kv[1]));
        }
        return map;
    }

    private double cosineSimilarity(Map<Long, Double> a, Map<Long, Double> b) {
        double dot = 0, na = 0, nb = 0;
        for (double v : a.values()) na += v*v;
        for (double v : b.values()) nb += v*v;
        for (var e : a.entrySet()) {
            Double bv = b.get(e.getKey());
            if (bv != null) dot += e.getValue() * bv;
        }
        if (na == 0 || nb == 0) return 0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }
}
