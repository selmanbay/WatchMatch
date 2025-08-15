package com.matchflix.backend.controller;

import com.matchflix.backend.dto.LoginRequest;
import com.matchflix.backend.dto.RegisterRequest;
import com.matchflix.backend.dto.UserDto;
import com.matchflix.backend.mapper.UserMapper;
import com.matchflix.backend.model.User;
import com.matchflix.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) { this.userService = userService; }

    // Kayıt: request DTO, response DTO
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest body) {
        try {
            User saved = userService.registerUserFromDto(body);
            UserDto dto = UserMapper.toDto(saved);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Kayıt başarısız: " + e.getMessage());
        }
    }

    // Giriş: request DTO, response DTO
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest req) {
        try {
            User u = userService.loginUser(req.getEmail(), req.getPassword());
            return ResponseEntity.ok(UserMapper.toDto(u));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Giriş başarısız: " + e.getMessage());
        }
    }

    // Country set: (JWT geldiğinde owner kontrolü yap)
    @PutMapping("/{userId}/country/{countryId}")
    public ResponseEntity<?> setCountry(@PathVariable Long userId, @PathVariable Long countryId) {
        try {
            User updated = userService.setCountry(userId, countryId);
            return ResponseEntity.ok(UserMapper.toDto(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Country set hatası: " + e.getMessage());
        }
    }

    // Kullanıcı getir: (JWT geldiğinde owner kontrolü yap)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(UserMapper::toDto)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
