package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "movie_list")
public class MovieList {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String listName; // Örn: Favorilerim

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;       // bu liste kime ait?

    // Liste ↔ Film (M:M) → ara tablo: list_movies
    @ManyToMany
    @JoinTable(
            name = "list_movies",
            joinColumns = @JoinColumn(name = "list_id"),
            inverseJoinColumns = @JoinColumn(name = "movie_id")
    )
    private List<Movie> movies = new ArrayList<>();

    // getter/setter
    public Long getId() { return id; }
    public String getListName() { return listName; }
    public void setListName(String listName) { this.listName = listName; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<Movie> getMovies() { return movies; }
    public void setMovies(List<Movie> movies) { this.movies = movies; }
}
