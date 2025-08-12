package com.matchflix.backend.controller;

import com.matchflix.backend.model.User;
import com.matchflix.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 1) Kayıt: body doğrudan User (firstName/lastName zorunluysa JSON'da göndermeyi unutma)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User body) {
        try {
            User saved = userService.registerUser(body);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Kayıt başarısız: " + e.getMessage());
        }
    }

    // 2) (Opsiyonel) ülke bağlama – tercihen ayrı bir çağrı ile
    @PutMapping("/{userId}/country/{countryId}")
    public ResponseEntity<?> setCountry(@PathVariable Long userId, @PathVariable Long countryId) {
        try {
            userService.setCountry(userId, countryId); // UserService içinde bu metot olmalı
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ülke atanamadı: " + e.getMessage());
        }
    }

    // 3) Giriş
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        try {
            return ResponseEntity.ok(
                    userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Giriş başarısız: " + e.getMessage());
        }
    }

    // 4) Kullanıcı getir
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

