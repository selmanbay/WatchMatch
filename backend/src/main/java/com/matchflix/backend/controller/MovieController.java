package com.matchflix.backend.controller;

import com.matchflix.backend.dto.MovieDto;
import com.matchflix.backend.mapper.MovieMapper;
import com.matchflix.backend.model.Genre;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.repository.GenreRepository;
import com.matchflix.backend.service.MovieService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "http://localhost:3000")
public class MovieController {

    private final MovieService movieService;
    private final GenreRepository genreRepo;

    public MovieController(MovieService movieService, GenreRepository genreRepo) {
        this.movieService = movieService;
        this.genreRepo = genreRepo;
    }

    // Swagger'ı sade tutmak için kullandığın req model
    public static class MovieCreateReq {
        public Long tmdbId;              // <-- ekle (tmdbId kullanıyorsan)
        public String title;
        public int releaseYear;
        public String posterUrl;
        public double rating;
        public String description;
        public List<Long> genreIds;
    }

    @GetMapping
    public ResponseEntity<List<MovieDto>> getAllMovies() {
        List<Movie> list = movieService.getAllMovies();
        return ResponseEntity.ok(list.stream().map(MovieMapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Long id) {
        Movie m = movieService.getMovieById(id);
        if (m == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Film bulunamadı: " + id);
        return ResponseEntity.ok(MovieMapper.toDto(m));
    }

    @PostMapping
    public ResponseEntity<?> addMovie(@RequestBody MovieCreateReq req) {
        try {
            Movie m = new Movie();
            m.setTmdbId(req.tmdbId);        // <-- tmdbId alanın entity'de olmalı
            m.setTitle(req.title);
            m.setReleaseYear(req.releaseYear);
            m.setPosterUrl(req.posterUrl);
            m.setRating(req.rating);
            m.setDescription(req.description);

            if (req.genreIds != null && !req.genreIds.isEmpty()) {
                List<Genre> genres = genreRepo.findAllById(req.genreIds);
                m.setGenres(genres);
            } else {
                m.setGenres(new ArrayList<>());
            }

            Movie saved = movieService.addMovie(m);
            return ResponseEntity.status(HttpStatus.CREATED).body(MovieMapper.toDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Film eklenemedi: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable Long id, @RequestBody MovieCreateReq req) {
        try {
            Movie existing = movieService.getMovieById(id);
            if (existing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Film bulunamadı: " + id);

            existing.setTmdbId(req.tmdbId);
            existing.setTitle(req.title);
            existing.setReleaseYear(req.releaseYear);
            existing.setPosterUrl(req.posterUrl);
            existing.setRating(req.rating);
            existing.setDescription(req.description);

            List<Genre> genres = (req.genreIds == null || req.genreIds.isEmpty())
                    ? new ArrayList<>()
                    : genreRepo.findAllById(req.genreIds);
            existing.setGenres(genres);

            Movie updated = movieService.updateMovie(id, existing);
            return ResponseEntity.ok(MovieMapper.toDto(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Film güncellenemedi: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException notFound) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(notFound.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Film silinemedi: " + e.getMessage());
        }
    }
}
