package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_genre_weights",
        indexes = {
                @Index(name = "idx_user_genre_user", columnList = "user_id", unique = true),
                @Index(name = "idx_user_genre_country", columnList = "country_id"),
                @Index(name = "idx_user_genre_updated", columnList = "updated_at")
        })
public class UserGenreWeights {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User FK: sadece id tutuyoruz
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    // Bazı kullanıcıların country’si olmayabilir -> NULL serbest
    @Column(name = "country_id")
    private Long countryId;

    // Örn: "3:2.0,5:0.5,12:1.7,"
    @Column(name = "weights_vector", columnDefinition = "TEXT")
    private String weightsVector;

    // ||v||, cosine için hızlandırma
    @Column(name = "vector_norm")
    private Double vectorNorm;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // --- GETTER / SETTER ---
    public Long getId() { return id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCountryId() { return countryId; }
    public void setCountryId(Long countryId) { this.countryId = countryId; }

    public String getWeightsVector() { return weightsVector; }
    public void setWeightsVector(String weightsVector) { this.weightsVector = weightsVector; }

    public Double getVectorNorm() { return vectorNorm; }
    public void setVectorNorm(Double vectorNorm) { this.vectorNorm = vectorNorm; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
