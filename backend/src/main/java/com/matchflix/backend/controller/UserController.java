package com.matchflix.backend.controller;

import com.matchflix.backend.dto.UserDto;
import com.matchflix.backend.mapper.UserMapper;
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

    // Kayıt: request hâlâ User, response DTO
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User body) {
        try {
            User saved = userService.registerUser(body);
            UserDto dto = UserMapper.toDto(saved);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Kayıt başarısız: " + e.getMessage());
        }
    }

    // Giriş: request hâlâ User (email+password), response DTO
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        try {
            User u = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());
            return ResponseEntity.ok(UserMapper.toDto(u));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Giriş başarısız: " + e.getMessage());
        }
    }

    // Country set: response DTO
    @PutMapping("/{userId}/country/{countryId}")
    public ResponseEntity<?> setCountry(@PathVariable Long userId, @PathVariable Long countryId) {
        try {
            User updated = userService.setCountry(userId, countryId);
            return ResponseEntity.ok(UserMapper.toDto(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Country set hatası: " + e.getMessage());
        }
    }

    // Kullanıcı getir: response DTO
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(UserMapper::toDto)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
