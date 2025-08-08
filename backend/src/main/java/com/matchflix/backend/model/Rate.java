package com.matchflix.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ratings")
@IdClass(RateId.class)
public class Rate {

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(nullable = false)
    private int score; // Exp: 7 point

    // Getters & Setters
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
}
