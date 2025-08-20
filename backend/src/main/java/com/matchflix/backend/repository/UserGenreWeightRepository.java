package com.matchflix.backend.repository;

import com.matchflix.backend.model.UserGenreWeights;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserGenreWeightRepository extends JpaRepository<UserGenreWeights, Long> {
    Optional<UserGenreWeights> findByUserId(Long userId);
    // Aynı ülkeye ait diğer kullanıcıların özet vektörlerini getirir
    Page<UserGenreWeights> findByCountryIdAndUserIdNot(Long countryId, Long excludeUserId, Pageable pageable);
}
