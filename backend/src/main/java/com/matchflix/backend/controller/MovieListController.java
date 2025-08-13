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
                               UserRepository userRepo, MovieListService movieListService) {
        this.movieListRepo = movieListRepo;
        this.movieRepo = movieRepo;
        this.userRepo = userRepo;
        this.movieListService = movieListService;
    }

    // ID ile tek liste
    @GetMapping("/{id}")
    public MovieList getMovieListById(@PathVariable Long id) {
        return movieListRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Liste bulunamadı"));
    }

    // Kullanıcının tüm listeleri
    @GetMapping("/user/{userId}")
    public List<MovieList> getListsOfUser(@PathVariable Long userId) {
        return movieListRepo.findByUser_Id(userId);
    }

    // YENİ LİSTE OLUŞTUR (ENTITY İLE)
    // Body'yi entity gibi gönderiyoruz: user sadece { "id": X } olsun,
    // movies ise [{ "id": 2 }, { "id": 5 }] şeklinde id'leri içersin.
    @PostMapping
    public ResponseEntity<?> addMovieList(@RequestBody MovieList body) {
        try {
            if (body.getUser() == null || body.getUser().getId() == null) {
                throw new IllegalArgumentException("user.id zorunlu");
            }

            // user ve filmleri "managed" entity'lere çevir
            User owner = userRepo.findById(body.getUser().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kullanıcı bulunamadı"));

            MovieList ml = new MovieList();
            ml.setUser(owner);
            ml.setListName(body.getListName());
            ml.setListDescription(body.getListDescription());
            ml.setListImage(body.getListImage());
            ml.setListRating(body.getListRating());

            if (body.getMovies() != null && !body.getMovies().isEmpty()) {
                // sadece id'ler önemlidir
                List<Long> ids = body.getMovies().stream()
                        .map(Movie::getId)
                        .filter(id -> id != null)
                        .toList();
                List<Movie> movies = movieRepo.findAllById(ids); // bulunamayan olursa eklenmez
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
    @PostMapping("/{listId}/movies/{movieId}")
    public ResponseEntity<?> addMovie(
            @PathVariable Long listId,
             @PathVariable Long movieId) {
        try {
            MovieList updated = movieListService.addMovieToList(listId, movieId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Listeye film eklenemedi: " + e.getMessage());
        }
    }

    @DeleteMapping("/{listId}/movies/{movieId}")
    public ResponseEntity<?> removeMovie(
            @PathVariable Long listId,
              @PathVariable Long movieId) {
        try {
            MovieList updated = movieListService.removeMovieFromList(listId, movieId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Film çıkarılamadı: " + e.getMessage());
        }
    }

    @GetMapping("/{listId}")
    public ResponseEntity<?> getList(@PathVariable Long listId) {
        try {
            return ResponseEntity.ok(movieListService.getListWithMovies(listId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Liste getirilemedi: " + e.getMessage());
        }
    }
}
