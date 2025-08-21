package com.matchflix.backend.service;

import com.matchflix.backend.model.HiddenEmbedings;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.User;
import com.matchflix.backend.repository.HiddenEmbedingsRepository;
import com.matchflix.backend.repository.MovieRepository;
import com.matchflix.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class HiddenEmbedingsServices {

    private final HiddenEmbedingsRepository repo;
    private final UserRepository userRepo;
    private final MovieRepository movieRepo;

    public HiddenEmbedingsServices(HiddenEmbedingsRepository repo,
                                  UserRepository userRepo,
                                  MovieRepository movieRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.movieRepo = movieRepo;
    }

    @Transactional
    public HiddenEmbedings log(Long userId, Long movieId, String interactionTypeRaw) {
        if (userId == null || movieId == null || interactionTypeRaw == null) {
            throw new IllegalArgumentException("userId, movieId ve interactionType zorunludur.");
        }

        String norm = interactionTypeRaw.trim().toUpperCase(Locale.ROOT);
        HiddenEmbedings.InteractionType type;
        try {
            type = HiddenEmbedings.InteractionType.valueOf(norm); // CLICK | VIEW
        } catch (Exception e) {
            throw new IllegalArgumentException("interactionType yalnızca CLICK veya VIEW olabilir.");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı: " + userId));
        Movie movie = movieRepo.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Film bulunamadı: " + movieId));

        HiddenEmbedings he = new HiddenEmbedings();
        he.setUser(user);
        he.setMovie(movie);
        he.setInteractionType(type);

        return repo.save(he);
    }

    @Transactional(readOnly = true)
    public List<HiddenEmbedings> getLatestForUser(Long userId, int limit) {
        int n = Math.max(1, Math.min(limit, 200)); // güvenli sınır
        return repo.findByUser_IdOrderByCreatedAtDesc(userId, PageRequest.of(0, n)).getContent();
    }
}
