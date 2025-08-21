package com.matchflix.backend.repository;

import com.matchflix.backend.model.Rate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RateRepository extends JpaRepository<Rate, Long> {

    Optional<Rate> findByUser_IdAndMovie_Id(Long userId, Long movieId);

    long countByMovie_Id(Long movieId);

    @Query("select avg(r.score) from Rate r where r.movie.id = :movieId")
    Double findAverageScoreByMovieId(Long movieId);

    void deleteByUser_IdAndMovie_Id(Long userId, Long movieId);
}
