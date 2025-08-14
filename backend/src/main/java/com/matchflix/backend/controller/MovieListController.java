package com.matchflix.backend.controller;

import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieList;
import com.matchflix.backend.model.User;
import com.matchflix.backend.repository.MovieListRepository;
import com.matchflix.backend.repository.MovieRepository;
import com.matchflix.backend.repository.UserRepository;
import com.matchflix.backend.service.MovieListService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/movie-lists")
@CrossOrigin(origins = "http://localhost:3000")
public class MovieListController {

    private final MovieListRepository movieListRepo;
    private final MovieRepository movieRepo;
    private final UserRepository userRepo;
    private final MovieListService movieListService;

    public MovieListController(MovieListRepository movieListRepo,
                               MovieRepository movieRepo,
                               UserRepository userRepo,
                               MovieListService movieListService) {
        this.movieListRepo = movieListRepo;
        this.movieRepo = movieRepo;
        this.userRepo = userRepo;
        this.movieListService = movieListService;
    }

    // Tek liste (filmleriyle birlikte servis üzerinden)
    @GetMapping("/{listId}")
    public ResponseEntity<?> getList(@PathVariable Long listId) {
        try {
            return ResponseEntity.ok(movieListService.getListWithMovies(listId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Liste getirilemedi: " + e.getMessage());
        }
    }

    // Kullanıcının tüm listeleri
    @GetMapping("/user/{userId}")
    public List<MovieList> getListsOfUser(@PathVariable Long userId) {
        return movieListRepo.findByUser_Id(userId);
    }

    // Yeni liste oluştur (entity tarzı body)
    @PostMapping
    public ResponseEntity<?> addMovieList(@RequestBody MovieList body) {
        try {
            if (body.getUser() == null || body.getUser().getId() == null) {
                throw new IllegalArgumentException("user.id zorunlu");
            }

            User owner = userRepo.findById(body.getUser().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kullanıcı bulunamadı"));

            MovieList ml = new MovieList();
            ml.setUser(owner);
            ml.setListName(body.getListName());
            ml.setListDescription(body.getListDescription());
            ml.setListImage(body.getListImage());
            ml.setListRating(body.getListRating());

            if (body.getMovies() != null && !body.getMovies().isEmpty()) {
                List<Long> ids = body.getMovies().stream()
                        .map(Movie::getId)
                        .filter(id -> id != null)
                        .toList();
                List<Movie> movies = movieRepo.findAllById(ids);
                ml.setMovies(movies);
            }

            MovieList saved = movieListRepo.save(ml);
            return ResponseEntity.ok(saved);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Liste eklenemedi: " + e.getMessage());
        }
    }

    // Var olan movieId ile ekle
    @PostMapping("/{listId}/movies/{movieId}")
    public ResponseEntity<?> addMovie(@PathVariable Long listId, @PathVariable Long movieId) {
        try {
            MovieList updated = movieListService.addMovieToList(listId, movieId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Listeye film eklenemedi: " + e.getMessage());
        }
    }

    // Listeden film çıkar
    @DeleteMapping("/{listId}/movies/{movieId}")
    public ResponseEntity<?> removeMovie(@PathVariable Long listId, @PathVariable Long movieId) {
        try {
            MovieList updated = movieListService.removeMovieFromList(listId, movieId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Film çıkarılamadı: " + e.getMessage());
        }
    }

    // TMDb ID ile: varsa getir, yoksa TMDb’den doldurup kaydet; sonra listeye ekle
    @PostMapping("/{listId}/tmdb/{tmdbId}")
    public ResponseEntity<?> addByTmdbId(@PathVariable Long listId, @PathVariable Long tmdbId) {
        try {
            MovieList updated = movieListService.addByTmdbId(listId, tmdbId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("TMDb üzerinden ekleme başarısız: " + e.getMessage());
        }
    }
}
