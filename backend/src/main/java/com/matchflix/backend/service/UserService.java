package com.matchflix.backend.service;

import com.matchflix.backend.model.User;
import com.matchflix.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // PasswordEncoder'ı constructor üzerinden alıyoruz
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        // email kontrolü
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email zaten kayıtlı!");
        }
        // Şifreyi hashle
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User loginUser(String email, String rawPassword) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Email veya şifre hatalı!");
        }

        // Şifreyi kontrol et
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Email veya şifre hatalı!");
        }
        return user;
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}

