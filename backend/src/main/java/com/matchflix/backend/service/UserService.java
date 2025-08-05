package com.matchflix.backend.service;

import com.matchflix.backend.model.User;
import com.matchflix.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {
        // email kontrolü
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email zaten kayıtlı!");
        }
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null || !user.getPassword().equals(password)) {
            throw new RuntimeException("Email veya şifre hatalı!");
        }
        return user;
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
