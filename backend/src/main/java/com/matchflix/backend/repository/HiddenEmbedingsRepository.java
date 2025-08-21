// src/main/java/com/matchflix/backend/repository/HiddenEmbedingsRepository.java
package com.matchflix.backend.repository;

import com.matchflix.backend.model.HiddenEmbedings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HiddenEmbedingsRepository extends JpaRepository<HiddenEmbedings, Long> {
    Page<HiddenEmbedings> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
