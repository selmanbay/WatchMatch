package com.matchflix.backend.controller;

import com.matchflix.backend.dto.ScoredMovieDto;
import com.matchflix.backend.service.SimilarityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:3000")
public class RecommendationController {

    private final SimilarityService similarityService;

    public RecommendationController(SimilarityService similarityService) {
        this.similarityService = similarityService;
    }

    @GetMapping("/by-movie/{movieId}")
    public ResponseEntity<List<ScoredMovieDto>> byMovie(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "20") int limit) {

        return ResponseEntity.ok(similarityService.similarTo(movieId, limit));
    }
}
