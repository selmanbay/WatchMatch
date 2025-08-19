package com.matchflix.backend.service;

import com.matchflix.backend.dto.RegisterRequest;
import com.matchflix.backend.model.User;
import com.matchflix.backend.model.Country;
import com.matchflix.backend.repository.CountryRepository;
import com.matchflix.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.matchflix.backend.repository.MovieListRepository;
import com.matchflix.backend.model.MovieList;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CountryRepository countryRepository;
    private final MovieListRepository movieListRepository;

    // ctor injection
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder, CountryRepository countryRepository, MovieListRepository movieListRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.countryRepository = countryRepository;
        this.movieListRepository = movieListRepository;
    }

    public User registerUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("Kullanıcı bilgisi boş olamaz.");
        }

        // Email normalize
        String email = safe(user.getEmail()).toLowerCase();
        if (email.isBlank()) {
            throw new IllegalArgumentException("Email zorunludur.");
        }

        // Benzersiz email kontrolü
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("Email zaten kayıtlı!");
        }

        // Şifre kontrol + hash
        String rawPassword = safe(user.getPassword());
        if (rawPassword.length() < 6) {
            throw new IllegalArgumentException("Şifre en az 6 karakter olmalı.");
        }
        String encoded = passwordEncoder.encode(rawPassword);

        // Ad/soyad DB'de NOT NULL ise boşsa placeholder at
        String firstName = safe(user.getFirstName());
        String lastName  = safe(user.getLastName());
        if (firstName.isBlank()) firstName = "-";
        if (lastName.isBlank())  lastName  = "-";

        // set et
        user.setEmail(email);
        user.setPassword(encoded);
        user.setFirstName(firstName);
        user.setLastName(lastName);


        MovieList watchlist = new MovieList();
        watchlist.setListName("My Watchlist");
        watchlist.setListDescription("İzlediklerim");
        watchlist.setListImage("default_watch.png");
        watchlist.setListRating("0");
        watchlist.setUser(user);
        watchlist.setListType(MovieList.ListType.WATCHED);
        movieListRepository.save(watchlist);

        // Wishlist
        MovieList wishlist = new MovieList();
        wishlist.setListName("My Wishlist");
        wishlist.setListDescription("İzlemek istediklerim");
        wishlist.setListImage("default_wish.png");
        wishlist.setListRating("0");
        wishlist.setUser(user);
        wishlist.setListType(MovieList.ListType.WISHLIST);
        movieListRepository.save(wishlist);

        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Kullanıcı kaydedilemedi: " + e.getMostSpecificCause().getMessage(), e);
        }
    }

    public User loginUser(String emailInput, String rawPassword) {
        String email = safe(emailInput).toLowerCase();
        if (email.isBlank() || safe(rawPassword).isBlank()) {
            throw new IllegalArgumentException("Email ve şifre zorunludur.");
        }

        User user = userRepository.findByEmail(email);
        if (user == null || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Email veya şifre hatalı!");
        }
        return user;
    }

    public User setCountry(Long userId, Long countryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new RuntimeException("Country not found: " + countryId));

        user.setCountry(country);
        userRepository.save(user);

        // JSON’da country null görünmesin diye fetch-join ile geri yükleyip dönüyoruz
        return userRepository.findByIdFetchCountry(user.getId()).orElse(user);
    }
    public User registerUserFromDto(RegisterRequest req) {
        if (req == null) throw new IllegalArgumentException("Kullanıcı bilgisi boş olamaz.");

        String email = safe(req.getEmail()).toLowerCase();
        if (email.isBlank()) throw new IllegalArgumentException("Email zorunludur.");
        if (userRepository.findByEmail(email) != null) throw new RuntimeException("Email zaten kayıtlı!");

        String rawPassword = safe(req.getPassword());
        if (rawPassword.length() < 6) throw new IllegalArgumentException("Şifre en az 6 karakter olmalı.");
        String encoded = passwordEncoder.encode(rawPassword);

        String username  = safe(req.getUsername());
        if (username.isBlank()) throw new IllegalArgumentException("Kullanıcı adı zorunludur.");

        String firstName = safe(req.getFirstName());
        String lastName  = safe(req.getLastName());
        if (firstName.isBlank()) firstName = "-";
        if (lastName.isBlank())  lastName  = "-";

        User user = new User();
        user.setEmail(email);
        user.setPassword(encoded);
        user.setUsername(username);
        user.setFirstName(firstName);
        user.setLastName(lastName);

        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Kullanıcı kaydedilemedi: " + e.getMostSpecificCause().getMessage(), e);
        }
    }
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    private static String safe(String s) {
        return s == null ? "" : s.trim();
    }
}
