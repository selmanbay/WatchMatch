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

    /** Belirli userId için genre vektörünü refresh eder. */
    @PostMapping("/refresh/{userId}")
    public ResponseEntity<?> refreshUserVector(@PathVariable Long userId) {
        matchService.refreshUserVector(userId);
        return ResponseEntity.ok().body(
                java.util.Map.of("ok", true, "message", "User " + userId + " vector refreshed")
        );
    }

    /** Benzer kullanıcıları getir. ?limit=20&sameCountry=true */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getMatches(@PathVariable Long userId,
                                        @RequestParam(defaultValue = "20") int limit,
                                        @RequestParam(defaultValue = "true") boolean sameCountry) {
        var items = matchService.findMatches(userId, limit, sameCountry);
        return ResponseEntity.ok(items);
    }
}
