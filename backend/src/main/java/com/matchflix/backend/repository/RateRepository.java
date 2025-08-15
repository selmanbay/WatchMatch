package com.matchflix.backend.repository;
import java.util.List;
import java.util.Optional;

import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.Rate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface RateRepository extends JpaRepository<Rate, Long> {
    Optional<Rate> findByUser_IdAndMovie_Id(Long userId, Long movieId);
    @Query("select r.movie.id from Rate r where r.user.id = :userId")
    List<Long> findRatedMovieIdsByUser(Long userId);

    // A & B ortak puanladıkları
    @Query("""
    select r1.movie.id
    from Rate r1 join Rate r2 on r1.movie.id = r2.movie.id
    where r1.user.id = :userA and r2.user.id = :userB
  """)
    List<Long> findCommonMovieIds(Long userA, Long userB);
}