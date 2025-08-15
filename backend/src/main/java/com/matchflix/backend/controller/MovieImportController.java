// src/main/java/com/matchflix/backend/controller/MovieImportController.java
package com.matchflix.backend.controller;
import java.util.Map;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.service.MovieImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "http://localhost:3000")
public class MovieImportController {
    private final MovieImportService importService;

    public MovieImportController(MovieImportService importService) {
        this.importService = importService;
    }

    // TMDb’den filmi DB’ye kaydet + FEATURES oluştur
    @PostMapping("/tmdb/{tmdbId}")
    public ResponseEntity<?> importByTmdb(@PathVariable Long tmdbId) {
        Movie m = importService.ensureMovieAndFeaturesByTmdbId(tmdbId);
        return ResponseEntity.ok(Map.of("id", m.getId(), "tmdb_id", m.getTmdbId(), "title", m.getTitle()));
    }
}
