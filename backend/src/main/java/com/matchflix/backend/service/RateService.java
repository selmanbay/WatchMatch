package com.matchflix.backend.service;
import com.matchflix.backend.dto.MovieRatingsDto;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.Rate;
import com.matchflix.backend.model.User;
import com.matchflix.backend.repository.MovieRepository;
import com.matchflix.backend.repository.RateRepository;
import com.matchflix.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class RateService {

    private static final int MIN_SCORE = 0;  // 1..10 istersen 1 yap
    private static final int MAX_SCORE = 10;

    private final RateRepository rateRepo;
    private final UserRepository userRepo;
    private final MovieRepository movieRepo;

    public RateService(RateRepository rateRepo, UserRepository userRepo, MovieRepository movieRepo) {
        this.rateRepo = rateRepo;
        this.userRepo = userRepo;
        this.movieRepo = movieRepo;
    }

    /** Upsert: varsa günceller, yoksa oluşturur. */
    @Transactional
    public Rate rate(Long userId, Long movieId, int score) {
        validate(userId, movieId, score);

        // Var mı? Güncelle
        Optional<Rate> existing = rateRepo.findByUser_IdAndMovie_Id(userId, movieId);
        if (existing.isPresent()) {
            Rate r = existing.get();
            r.setScore(score);
            return rateRepo.save(r);
        }

        // Yoksa oluştur
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı: " + userId));
        Movie movie = movieRepo.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Film bulunamadı: " + movieId));

        Rate r = new Rate();
        r.setUser(user);
        r.setMovie(movie);
        r.setScore(score);

        try {
            return rateRepo.save(r);
        } catch (DataIntegrityViolationException dup) {
            // Nadir yarışı: unique constraint çakışırsa tekrar güncelle
            Rate again = rateRepo.findByUser_IdAndMovie_Id(userId, movieId)
                    .orElseThrow(() -> dup);
            again.setScore(score);
            return rateRepo.save(again);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Rate> getUserRating(Long userId, Long movieId) {
        return rateRepo.findByUser_IdAndMovie_Id(userId, movieId);
    }

    @Transactional
    public void deleteUserRating(Long userId, Long movieId) {
        rateRepo.deleteByUser_IdAndMovie_Id(userId, movieId);
    }

    @Transactional(readOnly = true)
    public MovieRatingsDto getMovieStats(Long movieId) {
        Double avg = rateRepo.findAverageScoreByMovieId(movieId);
        long count = rateRepo.countByMovie_Id(movieId);
        return new MovieRatingsDto(movieId, avg, count);
    }

    private static void validate(Long userId, Long movieId, int score) {
        if (userId == null || movieId == null)
            throw new IllegalArgumentException("userId ve movieId zorunludur.");
        if (score < MIN_SCORE || score > MAX_SCORE)
            throw new IllegalArgumentException("score " + MIN_SCORE + ".." + MAX_SCORE + " aralığında olmalı.");
    }
}
