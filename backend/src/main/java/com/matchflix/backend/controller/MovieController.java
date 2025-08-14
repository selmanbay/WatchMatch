package com.matchflix.backend.controller;
import com.matchflix.backend.model.MovieList;
import com.matchflix.backend.service.MovieListService;
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
    private final MovieListService movieListService;

    public MovieController(MovieService movieService, GenreRepository genreRepo, MovieListService movieListService) {
        this.movieService = movieService;
        this.genreRepo = genreRepo;
        this.movieListService = movieListService;
    }

    // ---- Request body swagger'da sade gözüksün diye ----
    public static class MovieCreateReq {
        public String title;
        public int releaseYear;
        public String posterUrl;
        public double rating;
        public String description;
        public List<Long> genreIds; // <--- sadece ID'ler
    }

    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Long id) {
        Movie m = movieService.getMovieById(id);
        return (m == null)
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).body("Film bulunamadı: " + id)
                : ResponseEntity.ok(m);
    }

    // ------ CREATE: body artık MovieCreateReq ------
    @PostMapping
    public ResponseEntity<?> addMovie(@RequestBody MovieCreateReq req) {
        try {
            Movie m = new Movie();
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
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Film eklenemedi: " + e.getMessage());
        }
    }

    // ------ UPDATE: yine MovieCreateReq ------
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable Long id, @RequestBody MovieCreateReq req) {
        try {
            Movie existing = movieService.getMovieById(id);
            if (existing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Film bulunamadı: " + id);

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
            return ResponseEntity.ok(updated);
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

    @PostMapping("/{listId}/tmdb/{tmdbId}")
    public ResponseEntity<MovieList> addByTmdbId(
            @PathVariable Long listId,
            @PathVariable Long tmdbId
    ) {
        MovieList updated = movieListService.addByTmdbId(listId, tmdbId);
        return ResponseEntity.ok(updated);
    }
}
