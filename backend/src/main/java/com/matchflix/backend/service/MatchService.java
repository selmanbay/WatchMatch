package com.matchflix.backend.service;

import com.matchflix.backend.model.*;
import com.matchflix.backend.repository.UserGenreWeightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.matchflix.backend.repository.UserGenreWeightRepository;
import com.matchflix.backend.repository.UserRepository;
import java.util.*;

@Service
public class MatchService {

    private final UserGenreWeightRepository weightsRepo;
    private final UserRepository userRepository;

    public MatchService(UserGenreWeightRepository weightsRepo, UserRepository userRepository) {
        this.weightsRepo = weightsRepo;
        this.userRepository = userRepository;
    }

    // 1) Kullanıcının vektörünü güncelle
    @Transactional
    public void refreshUserVector(Long user) {
        Map<Long, Double> genreWeights = new HashMap<>();
        User userObject = new User();
        userObject = userRepository.findById(user).orElse(null);

        for (MovieList list : userObject.getMovieLists()) {
            double weightFactor = switch (list.getListType()) {
                case WATCHED -> 1.0;    // izlediklerim daha ağır bassın
                case WISHLIST -> 0.5;   // izlemek istediklerim
                default -> 0.2;         // diğer listeler
            };

            for (Movie movie : list.getMovies()) {
                for (Genre genre : movie.getGenres()) {
                    genreWeights.merge(genre.getId(), weightFactor, Double::sum);
                }
            }
        }

        // Vektörü serialize et
        String vector = serializeVector(genreWeights);

        // DB’ye kaydet
        UserGenreWeights weights = new UserGenreWeights();
        weights.setUserId(userObject.getId());
        weights.setCountryId(userObject.getCountry().getId());
        weights.setWeightsVector(vector);
        weightsRepo.save(weights);
    }

    // 2) Benzer kullanıcıları bul
    public List<Long> findMatchesByCountry(User user) {
        List<Long> matches = new ArrayList<>();

        // kendi vektörün
        UserGenreWeights me = weightsRepo.findById(user.getId()).orElse(null);
        if (me == null) return matches;

        // aynı ülkedeki diğerleri
        var others = weightsRepo.findByCountryIdAndUserIdNot(
                user.getCountry().getId(),
                user.getId(),
                org.springframework.data.domain.PageRequest.of(0, 50)
        );

        for (UserGenreWeights other : others) {
            double sim = cosineSimilarity(deserialize(me.getWeightsVector()),
                    deserialize(other.getWeightsVector()));
            if (sim > 0.5) { // eşik değeri
                matches.add(other.getUserId());
            }
        }

        return matches;
    }

    // -------------- yardımcılar ----------------

    private String serializeVector(Map<Long, Double> weights) {
        StringBuilder sb = new StringBuilder();
        weights.forEach((id, w) -> sb.append(id).append(":").append(w).append(","));
        return sb.toString();
    }

    private Map<Long, Double> deserialize(String vector) {
        Map<Long, Double> map = new HashMap<>();
        if (vector == null || vector.isBlank()) return map;
        String[] parts = vector.split(",");
        for (String p : parts) {
            if (p.isBlank()) continue;
            String[] kv = p.split(":");
            map.put(Long.parseLong(kv[0]), Double.parseDouble(kv[1]));
        }
        return map;
    }

    private double cosineSimilarity(Map<Long, Double> a, Map<Long, Double> b) {
        Set<Long> allKeys = new HashSet<>();
        allKeys.addAll(a.keySet());
        allKeys.addAll(b.keySet());

        double dot = 0, normA = 0, normB = 0;
        for (Long k : allKeys) {
            double va = a.getOrDefault(k, 0.0);
            double vb = b.getOrDefault(k, 0.0);
            dot += va * vb;
            normA += va * va;
            normB += vb * vb;
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
    }
}
