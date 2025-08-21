package com.matchflix.backend.controller;

import com.matchflix.backend.dto.MovieRatingsDto;
import com.matchflix.backend.dto.RateDto;
import com.matchflix.backend.model.Rate;
import com.matchflix.backend.service.RateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "http://localhost:3000")
public class RateController {

    private final RateService service;

    public RateController(RateService service) {
        this.service = service;
    }

    /** Upsert: { userId, movieId, score } */
    @PostMapping
    public ResponseEntity<?> rate(@RequestBody RateReq req) {
        try {
            Rate saved = service.rate(req.userId, req.movieId, req.score);
            return ResponseEntity.ok(toDto(saved));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    /** Kullanıcının tekil puanı */
    @GetMapping("/user/{userId}/movie/{movieId}")
    public ResponseEntity<?> userRating(@PathVariable Long userId, @PathVariable Long movieId) {
        return service.getUserRating(userId, movieId)
                .<ResponseEntity<?>>map(r -> ResponseEntity.ok(toDto(r)))
                .orElse(ResponseEntity.ok().build()); // 200 + empty (yoksa)
    }

    /** Filmin ortalama & oy sayısı */
    @GetMapping("/movie/{movieId}/stats")
    public ResponseEntity<MovieRatingsDto> movieStats(@PathVariable Long movieId) {
        return ResponseEntity.ok(service.getMovieStats(movieId));
    }

    /** Kullanıcının puanını sil */
    @DeleteMapping
    public ResponseEntity<?> delete(@RequestParam Long userId, @RequestParam Long movieId) {
        service.deleteUserRating(userId, movieId);
        return ResponseEntity.noContent().build();
    }

    private static RateDto toDto(Rate r) {
        return new RateDto(r.getId(), r.getUser().getId(), r.getMovie().getId(), r.getScore());
    }

    /** Basit istek modeli */
    public static class RateReq {
        public Long userId;
        public Long movieId;
        public int score; // 0..10
    }
}
