package com.matchflix.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "movie_main_stream",
        uniqueConstraints = @UniqueConstraint(name = "uk_main_stream_movie", columnNames = "movie_id"))
public class MovieMainStream {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(name = "order_index", nullable = false)
    private int orderIndex = 0;  // sıralama için

    @Column(nullable = false)
    private boolean active = true;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
