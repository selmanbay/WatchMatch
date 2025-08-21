// src/main/java/com/matchflix/backend/controller/HiddenEmbedingsController.java
package com.matchflix.backend.controller;

import com.matchflix.backend.dto.HiddenEmbedingsDto;
import com.matchflix.backend.model.HiddenEmbedings;
import com.matchflix.backend.service.HiddenEmbedingsServices;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/hidden-embeddings")
@CrossOrigin(origins = "http://localhost:3000")
public class HiddenEmbedingsController {

    private final HiddenEmbedingsServices service;

    public HiddenEmbedingsController(HiddenEmbedingsServices service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> log(@RequestBody HiddenEmbeddingReq req) {
        HiddenEmbedings saved = service.log(
                req.userId, req.movieId,
                req.interactionType == null ? null : req.interactionType.toUpperCase(Locale.ROOT)
        );
        // Minimal yanıt
        return ResponseEntity.ok(new HiddenEmbedingsDto(
                saved.getId(),
                saved.getUser().getId(),
                saved.getMovie().getId(),
                saved.getInteractionType().name(),
                saved.getCreatedAt()
        ));
    }

    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<List<HiddenEmbedingsDto>> latestForUser(@PathVariable Long userId,
                                                                  @RequestParam(defaultValue = "50") int limit) {
        List<HiddenEmbedings> events = service.getLatestForUser(userId, Math.min(Math.max(limit, 1), 200));
        List<HiddenEmbedingsDto> dto = events.stream()
                .map(e -> new HiddenEmbedingsDto(
                        e.getId(),
                        e.getUser().getId(),    // sadece id çekiyoruz (proxy serialize olmaz)
                        e.getMovie().getId(),
                        e.getInteractionType().name(),
                        e.getCreatedAt()
                ))
                .toList();
        return ResponseEntity.ok(dto);
    }

    public static class HiddenEmbeddingReq {
        public Long userId;
        public Long movieId;
        public String interactionType; // "CLICK" | "VIEW"
    }
}
