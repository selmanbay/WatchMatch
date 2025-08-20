package com.matchflix.backend.controller;

import com.matchflix.backend.dto.LoginRequest;
import com.matchflix.backend.dto.RegisterRequest;
import com.matchflix.backend.dto.UserDto;
import com.matchflix.backend.mapper.UserMapper;
import com.matchflix.backend.model.User;
import com.matchflix.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

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

    // Country set
    @PutMapping("/{userId}/country/{countryId}")
    public ResponseEntity<?> setCountry(@PathVariable Long userId, @PathVariable Long countryId) {
        try {
            User updated = userService.setCountry(userId, countryId);
            return ResponseEntity.ok(UserMapper.toDto(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Country set hatası: " + e.getMessage());
        }
    }

    // Kullanıcı getir
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(UserMapper::toDto)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ===================== AVATAR GÜNCELLEME ===================== */

    // 1) Sadece URL ver: { "avatarUrl": "https://..." }
    @PatchMapping(path = "/{userId}/avatar", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateAvatarUrl(
            @PathVariable Long userId,
            @RequestBody java.util.Map<String, String> body
    ) {
        try {
            String avatarUrl = body.get("avatarUrl");
            User updated = userService.updateAvatarUrl(userId, avatarUrl);
            return ResponseEntity.ok(UserMapper.toDto(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Avatar güncellenemedi: " + e.getMessage());
        }
    }

    // 2) Dosya upload (multipart/form-data, field adı: file)
    @PostMapping(path = "/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Dosya yüklenmedi.");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Sadece resim dosyaları kabul edilir.");
            }

            // uploads/avatars klasörüne kaydet
            Path uploadDir = Paths.get("uploads", "avatars");
            Files.createDirectories(uploadDir);

            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (ext == null || ext.isBlank()) ext = "jpg";
            String fileName = "u" + userId + "_" + System.currentTimeMillis() + "." + ext.toLowerCase();

            Path target = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // Statik servis edilen public URL (WebConfig'te /uploads/** tanımlı)
            String publicUrl = "/uploads/avatars/" + fileName;

            // Kullanıcının avatar alanını güncelle
            User updated = userService.updateAvatarUrl(userId, publicUrl);
            return ResponseEntity.ok(UserMapper.toDto(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Avatar upload başarısız: " + e.getMessage());
        }
    }
}
