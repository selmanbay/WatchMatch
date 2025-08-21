package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "hidden_embeddings",
        indexes = {
                @Index(name = "idx_he_user_time",  columnList = "user_id, created_at"),
                @Index(name = "idx_he_user_movie", columnList = "user_id, movie_id")
        }
)
public class HiddenEmbedings { // ismi bilerek değiştirmedim: mevcut referanslar kırılmasın.

    public enum InteractionType { CLICK, VIEW }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Enumerated(EnumType.STRING)
    @Column(name = "interaction_type", nullable = false, length = 16)
    private InteractionType interactionType; // CLICK veya VIEW

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** --- lifecycle hooks --- */
    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    /** --- getters / setters --- */
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public InteractionType getInteractionType() { return interactionType; }
    public void setInteractionType(InteractionType interactionType) { this.interactionType = interactionType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
