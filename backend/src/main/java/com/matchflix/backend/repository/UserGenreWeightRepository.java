package com.matchflix.backend.repository;

import com.matchflix.backend.model.UserGenreWeights;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserGenreWeightRepository extends JpaRepository<UserGenreWeights, Long> {

    // Aynı ülkeye ait diğer kullanıcıların özet vektörlerini getirir
    Page<UserGenreWeights> findByCountryIdAndUserIdNot(Long countryId, Long excludeUserId, Pageable pageable);
}
