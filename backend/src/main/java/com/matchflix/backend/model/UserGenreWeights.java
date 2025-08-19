package com.matchflix.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_genre_weights",
        indexes = {
                @Index(name = "idx_user_genre_country", columnList = "country_id"),
                @Index(name = "idx_user_genre_user", columnList = "user_id", unique = true)
        })
public class UserGenreWeights {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "country_id", nullable = false)
    private Long countryId;

    @Column(name = "weights_vector", columnDefinition = "TEXT")
    private String weightsVector;

    // --- GETTER / SETTER ---

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCountryId() {
        return countryId;
    }
    public void setCountryId(Long countryId) {
        this.countryId = countryId;
    }

    public String getWeightsVector() {
        return weightsVector;
    }
    public void setWeightsVector(String weightsVector) {
        this.weightsVector = weightsVector;
    }
}
