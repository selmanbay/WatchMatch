package com.matchflix.backend.service;

import com.matchflix.backend.dto.ScoredMovieDto;
import com.matchflix.backend.model.Genre;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieFeatures;
import com.matchflix.backend.repository.MovieRepository;
import com.matchflix.backend.repository.MovieFeaturesRepository; // varsa
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SimilarityService {

    private final MovieRepository movieRepo;
    private final MovieFeaturesRepository featuresRepo;

    public SimilarityService(MovieRepository movieRepo, MovieFeaturesRepository featuresRepo) {
        this.movieRepo = movieRepo;
        this.featuresRepo = featuresRepo;
    }

    @Value("${match.weights.genre:0.55}")   private double wG;
    @Value("${match.weights.actor:0.25}")   private double wA;
    @Value("${match.weights.director:0.15}")private double wD;
    @Value("${match.weights.keyword:0.05}") private double wK;

    public List<ScoredMovieDto> similarTo(Long movieId, int limit) {
        Movie anchor = movieRepo.findByIdWithGenres(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Film yok: " + movieId));
        MovieFeatures f1 = featuresRepo.findById(movieId).orElse(null);

        Set<Long> g1  = anchor.getGenres().stream().map(Genre::getId).collect(Collectors.toSet());
        Set<Long> a1  = (f1 == null) ? Set.of() : toSet(f1.getActorIds());
        Set<Long> d1  = (f1 == null) ? Set.of() : toSet(f1.getDirectorIds());
        Set<String> k1= (f1 == null) ? Set.of() : toLowerSet(f1.getKeywords());

        // hızlı aday havuzu: en az 1 ortak tür
        List<Movie> candidates = g1.isEmpty()
                ? movieRepo.findAll() // tür yoksa tüm havuz (küçük DB’lerde sorun değil)
                : movieRepo.findCandidatesByAnyGenre(g1);

        List<ScoredMovieDto> scored = new ArrayList<>(candidates.size());
        for (Movie m2 : candidates) {
            if (Objects.equals(m2.getId(), movieId)) continue;

            MovieFeatures f2 = featuresRepo.findById(m2.getId()).orElse(null);
            Set<Long> g2  = m2.getGenres().stream().map(Genre::getId).collect(Collectors.toSet());
            Set<Long> a2  = (f2 == null) ? Set.of() : toSet(f2.getActorIds());
            Set<Long> d2  = (f2 == null) ? Set.of() : toSet(f2.getDirectorIds());
            Set<String> k2= (f2 == null) ? Set.of() : toLowerSet(f2.getKeywords());

            double sG = jaccard(g1, g2);
            double sA = jaccard(a1, a2);
            double sD = jaccard(d1, d2);
            double sK = jaccard(k1, k2);

            // mevcut olmayan sinyallerin ağırlıklarını dışarıda bırakarak normalize et
            double denom = 0.0;
            if (!g1.isEmpty() || !g2.isEmpty()) denom += wG;
            if (!a1.isEmpty() || !a2.isEmpty()) denom += wA;
            if (!d1.isEmpty() || !d2.isEmpty()) denom += wD;
            if (!k1.isEmpty() || !k2.isEmpty()) denom += wK;

            if (denom == 0) continue; // hiç sinyal yoksa atla
            double score = (wG*sG + wA*sA + wD*sD + wK*sK) / denom;

            scored.add(new ScoredMovieDto(m2, score, sG, sA, sD, sK));
        }

        return scored.stream()
                .sorted(Comparator.comparingDouble(s -> -s.score))
                .limit(Math.max(1, limit))
                .toList();
    }

    // ---------- helpers ----------
    private static <T> double jaccard(Set<T> a, Set<T> b) {
        if (a.isEmpty() && b.isEmpty()) return 0.0;
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        int inter = 0;
        for (T x : a) if (b.contains(x)) inter++;
        int union = a.size() + b.size() - inter;
        return union == 0 ? 0.0 : ((double) inter / union);
    }

    private static Set<Long> toSet(long[] arr) {
        if (arr == null || arr.length == 0) return Set.of();
        Set<Long> s = new HashSet<>(arr.length);
        for (long v : arr) s.add(v);
        return s;
    }
    private static Set<Long> toSet(List<Long> list) {
        return (list == null || list.isEmpty()) ? Set.of() : new HashSet<>(list);
    }
    private static Set<String> toLowerSet(List<String> list) {
        if (list == null || list.isEmpty()) return Set.of();
        return list.stream()
                .filter(Objects::nonNull)
                .map(x -> x.trim().toLowerCase(Locale.ROOT))
                .filter(x -> !x.isEmpty())
                .collect(Collectors.toSet());
    }
}
