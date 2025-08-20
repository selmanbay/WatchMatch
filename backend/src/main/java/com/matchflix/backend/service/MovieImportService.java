// src/main/java/com/matchflix/backend/service/MovieImportService.java
package com.matchflix.backend.service;
import com.matchflix.backend.service.GenreService;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.repository.MovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MovieImportService {
    private final MovieRepository movieRepo;
    private final TmdbService tmdb;
    private final GenreService genreService;

    public MovieImportService(MovieRepository movieRepo, TmdbService tmdb, GenreService genreService) {
        this.movieRepo = movieRepo;
        this.tmdb = tmdb;
        this.genreService = genreService;
    }

    /** TMDb id ile filmi (yoksa oluşturup) döner ve HER ZAMAN features’ı upsert eder. */
    @Transactional
    public Movie ensureMovieAndFeaturesByTmdbId(Long tmdbId) {
        // varsa al
        Movie movie = movieRepo.findByTmdbId(tmdbId).orElse(null);

        // yoksa TMDB'den getir + TÜRLERİ SET ET
        if (movie == null) {
            var dto = tmdb.fetchMovie(tmdbId);
            movie = new Movie();
            movie.setTmdbId(dto.getId());
            movie.setTitle(dto.getTitle());
            movie.setPosterUrl(dto.getPosterPath());
            movie.setRating(dto.getVoteAverage());
            movie.setDescription(dto.getOverview());
            movie.setReleaseYear(yearFrom(dto.getReleaseDate()));

            // KRİTİK: türleri resolve et ve save’den önce ilişkiyi set et
            var genres = genreService.resolveGenres(dto.getGenreIds());
            movie.setGenres(genres);

            movie = movieRepo.save(movie); // movie_genres insert’leri burada oluşur
        } else {
            // İstersen mevcut filmin türlerini TMDB’ye göre güncelle (opsiyonel ama faydalı)
            var dto = tmdb.fetchMovie(tmdbId);
            var genres = genreService.resolveGenres(dto.getGenreIds());
            movie.setGenres(genres);       // ilişkiyi güncelle
            movie = movieRepo.save(movie); // join tablosu senkronize edilir
        }

        // features upsert
        tmdb.upsertFeatures(movie, tmdbId);
        return movie;
    }

    private int yearFrom(String d) {
        if (d == null || d.length() < 4) return 0;
        try { return Integer.parseInt(d.substring(0,4)); } catch (Exception e) { return 0; }
    }
}
