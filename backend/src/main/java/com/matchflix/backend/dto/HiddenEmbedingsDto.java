// src/main/java/com/matchflix/backend/dto/HiddenEmbeddingDto.java
package com.matchflix.backend.dto;

import java.time.LocalDateTime;

public class HiddenEmbedingsDto {
    private Long id;
    private Long userId;
    private Long movieId;
    private String interactionType;
    private LocalDateTime createdAt;

    public HiddenEmbedingsDto(Long id, Long userId, Long movieId, String interactionType, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.movieId = movieId;
        this.interactionType = interactionType;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getMovieId() { return movieId; }
    public String getInteractionType() { return interactionType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
