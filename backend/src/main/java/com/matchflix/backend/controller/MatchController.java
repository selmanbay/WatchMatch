package com.matchflix.backend.controller;

import com.matchflix.backend.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/match")
@CrossOrigin(origins = "http://localhost:3000") // frontend için izin
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    /**
     * Belirli userId için genre vektörünü refresh eder.
     * Swagger’dan: POST /api/match/refresh/{userId}
     */
    @PostMapping("/refresh/{userId}")
    public ResponseEntity<String> refreshUserVector(@PathVariable Long userId) {
        matchService.refreshUserVector(userId);
        return ResponseEntity.ok("✅ User " + userId + " genre vector refreshed");
    }
}
