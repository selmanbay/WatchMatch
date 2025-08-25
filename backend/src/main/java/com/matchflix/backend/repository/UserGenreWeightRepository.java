package com.matchflix.backend.repository;

import com.matchflix.backend.model.UserGenreWeights;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserGenreWeightRepository extends JpaRepository<UserGenreWeights, Long> {

    Optional<UserGenreWeights> findByUserId(Long userId);

    // countryId null ise "IS NULL", değilse "=" çalışsın; kendimizi hariç tutalım
    @Query("""
           SELECT w FROM UserGenreWeights w
           WHERE w.userId <> :excludeUserId
             AND ( (:countryId IS NULL AND w.countryId IS NULL)
                   OR w.countryId = :countryId )
           """)
    Page<UserGenreWeights> findSameCountryOrBothNull(@Param("countryId") Long countryId,
                                                     @Param("excludeUserId") Long excludeUserId,
                                                     Pageable pageable);

    // Ülke filtresi olmadan tüm adaylar (isteğe bağlı kullanım)
    @Query("SELECT w FROM UserGenreWeights w WHERE w.userId <> :excludeUserId")
    Page<UserGenreWeights> findAllExcept(@Param("excludeUserId") Long excludeUserId, Pageable pageable);
}
