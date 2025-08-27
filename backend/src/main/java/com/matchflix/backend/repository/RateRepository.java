package com.matchflix.backend.repository;
import com.matchflix.backend.model.Rate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface RateRepository extends JpaRepository<Rate, Long> {

    @Query("""
        select r from Rate r
        where r.user.id = :userId
        order by r.score desc
    """)
    List<Rate> findAllByUserOrderScoreDesc(Long userId);

    // Skor eşiği ile:
    @Query("""
        select r from Rate r
        where r.user.id = :userId and r.score >= :minScore
        order by r.score desc
    """)
    List<Rate> findAllByUserAndMinScore(Long userId, double minScore);

    Optional<Rate> findByUser_IdAndMovie_Id(Long userId, Long movieId);

    long countByMovie_Id(Long movieId);

    @Query("select avg(r.score) from Rate r where r.movie.id = :movieId")
    Double findAverageScoreByMovieId(Long movieId);

    void deleteByUser_IdAndMovie_Id(Long userId, Long movieId);
}
