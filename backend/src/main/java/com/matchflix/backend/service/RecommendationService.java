package com.matchflix.backend.service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.matchflix.backend.model.Genre;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.UserGenreWeights;
import com.matchflix.backend.repository.MovieRepository;
import com.matchflix.backend.repository.RateRepository;
import com.matchflix.backend.repository.UserGenreWeightRepository;
import com.matchflix.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserRepository userRepo;
    private final UserGenreWeightRepository ugwRepo;
    private final MovieRepository movieRepo;
    private final RateRepository rateRepo;

    public RecommendationService(UserRepository userRepo,
                                 UserGenreWeightRepository ugwRepo,
                                 MovieRepository movieRepo,
                                 RateRepository rateRepo) {
        this.userRepo = userRepo;
        this.ugwRepo = ugwRepo;
        this.movieRepo = movieRepo;
        this.rateRepo = rateRepo;
    }

    // ---------- 1) Kullanıcının listelerinde OLMAYAN en iyi N film ----------
    @Transactional(readOnly = true)
    public List<RecDto> recommendByGenres(Long userId, int limit) {
        // (a) user genre vektörü
        UserGenreWeights row = ugwRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Vector not found for user " + userId + " (match/refresh çalıştır)"));

        Map<Long, Double> u = deserialize(row.getWeightsVector());
        if (u.isEmpty()) return List.of();

        // (b) aday havuz: kullanıcının listelerinde olmayan filmler
        var page = movieRepo.findCandidatesNotInUserLists(userId, PageRequest.of(0, Math.max(1, limit * 5))); // geniş al, sonra skorla
        List<Movie> candidates = page.getContent();

        // (c) hepsini skorla (content-based: cosine(user, movieGenresOneHot))
        List<RecDto> scored = candidates.stream()
                .map(m -> new RecDto(m.getId(), m.getTitle(), scoreMovieByGenres(u, m)))
                .sorted(Comparator.comparingDouble(RecDto::score).reversed())
                .limit(limit)
                .toList();

        // (d) küçük bir popülerlik/puan katkısı eklemek istersen (opsiyonel):
        // mergePopularity(scored);

        return scored;
    }

    // ---------- 2) İstemcinin verdiği filmID listesine puan ver ----------
    @Transactional(readOnly = true)
    public List<ScoredId> scoreGivenCandidates(Long userId, List<Long> movieIds) {
        if (movieIds == null || movieIds.isEmpty()) return List.of();

        UserGenreWeights row = ugwRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Vector not found for user " + userId));

        Map<Long, Double> u = deserialize(row.getWeightsVector());
        if (u.isEmpty()) return List.of();

        // Kendi listesinde olanları istersen otomatik ele
        Set<Long> usersMovies = movieRepo.findUserMovieIds(userId);
        List<Movie> movies = movieRepo.findAllById(
                movieIds.stream().filter(id -> !usersMovies.contains(id)).toList()
        );

        List<ScoredId> out = new ArrayList<>();
        for (Movie m : movies) {
            out.add(new ScoredId(m.getId(), scoreMovieByGenres(u, m)));
        }
        out.sort(Comparator.comparingDouble(ScoredId::score).reversed());
        return out;
    }

    // ---------- helpers ----------
    private double scoreMovieByGenres(Map<Long, Double> userVec, Movie m) {
        if (m.getGenres() == null || m.getGenres().isEmpty()) return 0.0;

        // movie one-hot: her genre 1.0
        double dot = 0, nu = 0, nm = 0;

        for (double v : userVec.values()) nu += v * v;
        for (Genre g : m.getGenres()) nm += 1.0;              // one-hot norm^2 = genreCount
        double normDen = Math.sqrt(nu) * Math.sqrt(nm == 0 ? 1 : nm);

        for (Genre g : m.getGenres()) {
            Double uv = userVec.get(g.getId());
            if (uv != null) dot += uv * 1.0;
        }
        return normDen == 0 ? 0 : dot / normDen; // 0..1 arası
    }

    private Map<Long, Double> deserialize(String vector) {
        Map<Long, Double> map = new HashMap<>();
        if (vector == null || vector.isBlank()) return map;
        for (String p : vector.split(",")) {
            if (p.isBlank()) continue;
            String[] kv = p.split(":");
            if (kv.length != 2) continue;
            try {
                map.put(Long.parseLong(kv[0].trim()), Double.parseDouble(kv[1].trim()));
            } catch (NumberFormatException ignore) { }
        }
        return map;
    }

    // DTO'lar
    public record RecDto(Long movieId, String title, double score) { }
    public record ScoredId(Long movieId, double score) { }
}
