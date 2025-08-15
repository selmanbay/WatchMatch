// src/main/java/com/matchflix/backend/service/MovieImportService.java
package com.matchflix.backend.service;

import com.matchflix.backend.model.Movie;
import com.matchflix.backend.repository.MovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MovieImportService {
    private final MovieRepository movieRepo;
    private final TmdbService tmdb;

    public MovieImportService(MovieRepository movieRepo, TmdbService tmdb) {
        this.movieRepo = movieRepo;
        this.tmdb = tmdb;
    }

    /** TMDb id ile filmi (yoksa oluşturup) döner ve HER ZAMAN features’ı upsert eder. */
    @Transactional
    public Movie ensureMovieAndFeaturesByTmdbId(Long tmdbId) {
        Movie movie = movieRepo.findByTmdbId(tmdbId).orElse(null);

        if (movie == null) {
            var dto = tmdb.fetchMovie(tmdbId);
            movie = new Movie();
            movie.setTmdbId(dto.getId());
            movie.setTitle(dto.getTitle());
            movie.setPosterUrl(dto.getPosterPath());
            movie.setRating(dto.getVoteAverage());
            movie.setDescription(dto.getOverview());
            movie.setReleaseYear(yearFrom(dto.getReleaseDate()));
            movie = movieRepo.save(movie);
        }

        // KRİTİK: features kaydı yoksa da varsa da upsert et (insert/update).
        tmdb.upsertFeatures(movie, tmdbId);
        return movie;
    }

    private int yearFrom(String d) {
        if (d == null || d.length() < 4) return 0;
        try { return Integer.parseInt(d.substring(0,4)); } catch (Exception e) { return 0; }
    }
}
