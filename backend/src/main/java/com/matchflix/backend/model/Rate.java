package com.matchflix.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ratings",
        uniqueConstraints = @UniqueConstraint(name = "uk_ratings_user_movie", columnNames = {"user_id", "movie_id"}))
public class Rate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(nullable = false)
    private int score; // 0..10 gibi

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
}