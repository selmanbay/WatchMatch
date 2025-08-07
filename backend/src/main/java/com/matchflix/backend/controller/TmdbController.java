package com.matchflix.backend.controller;

import com.matchflix.backend.service.MovieApiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tmdb")
@CrossOrigin(origins = "http://localhost:3000")
public class TmdbController {

    private final MovieApiService movieApiService;

    public TmdbController(MovieApiService movieApiService) {
        this.movieApiService = movieApiService;
    }

    // ✅ Popüler filmleri getir
    @GetMapping("/popular")
    public String getPopularMovies() {
        return movieApiService.getPopularMovies();
    }

    // ✅ Arama yap
    @GetMapping("/search")
    public String searchMovies(@RequestParam String query) {
        return movieApiService.searchMovies(query);
    }
}

