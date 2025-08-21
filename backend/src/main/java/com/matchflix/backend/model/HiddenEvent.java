package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hidden_events",
        indexes = {
                @Index(name="idx_he_user_time", columnList="user_id, created_at"),
                @Index(name="idx_he_user_movie", columnList="user_id, movie_id"),
                @Index(name="idx_he_tmdb", columnList="tmdb_id")
        })
public class HiddenEvent {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="movie_id")
    private Movie movie; // nullable

    @Column(name="tmdb_id")
    private Long tmdbId; // nullable

    @Column(name="interaction_type", length=40, nullable=false)
    private String interactionType;

    @Column(name="weight", nullable=false)
    private double weight;

    @Column(name="dwell_ms")
    private Integer dwellMs;

    @Column(name="session_id", length=64)
    private String sessionId;

    @Column(name="source", length=32)
    private String source;

    @Column(name="device", length=32)
    private String device;

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // getters/setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public Long getTmdbId() {
        return tmdbId;
    }

    public void setTmdbId(Long tmdbId) {
        this.tmdbId = tmdbId;
    }

    public String getInteractionType() {
        return interactionType;
    }

    public void setInteractionType(String interactionType) {
        this.interactionType = interactionType;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public Integer getDwellMs() {
        return dwellMs;
    }

    public void setDwellMs(Integer dwellMs) {
        this.dwellMs = dwellMs;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDevice() {
        return device;
    }

    public void setDevice(String device) {
        this.device = device;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

