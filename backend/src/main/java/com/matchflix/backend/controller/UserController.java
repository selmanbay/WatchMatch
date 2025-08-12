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

    // Giriş
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
    //Insert user into the country user list
    @PutMapping("/{userId}/country/{countryId}")
    public ResponseEntity<?> setCountry(@PathVariable Long userId, @PathVariable Long countryId) {
        try {
            User updated = userService.setCountry(userId, countryId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Country set hatası: " + e.getMessage());
        }
    }
    // Kullanıcı getir
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}

