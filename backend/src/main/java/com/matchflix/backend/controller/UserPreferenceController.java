package com.matchflix.backend.controller;

import com.matchflix.backend.model.UserPreference;
import com.matchflix.backend.repository.UserPreferenceRepository;
import com.matchflix.backend.service.UserPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class UserPreferenceController {

    private final UserPreferenceService preferenceService;
    private final UserPreferenceRepository prefRepo;

    public UserPreferenceController(UserPreferenceService preferenceService,
                                    UserPreferenceRepository prefRepo) {
        this.preferenceService = preferenceService;
        this.prefRepo = prefRepo;
    }

    // Mevcut tercih (varsa) getir
    @GetMapping("/users/{userId}/preference")
    public ResponseEntity<?> getPreference(@PathVariable Long userId) {
        return prefRepo.findByUserId(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Tercih oluştur/güncelle (DTO yok; body: { "sex": "...", "language": "..." })
    @PostMapping("/users/{userId}/preference")
    public ResponseEntity<?> upsertPreference(@PathVariable Long userId,
                                              @RequestBody Map<String, String> body) {
        try {
            String sex = body.get("sex");
            String language = body.get("language");
            UserPreference saved = preferenceService.createOrUpdateForUser(userId, sex, language);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Preference kaydı başarısız: " + e.getMessage());
        }
    }
}
