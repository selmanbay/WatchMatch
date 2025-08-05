package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name="users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String username;

    @ManyToMany
    @JoinTable(
            name = "user_watched_films",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "movie_id")
    )
    private List<Movie> watchedFilms;

    @ManyToMany
    @JoinTable(
            name = "user_wishlist_films",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "movie_id")
    )
    private List<Movie> wishlistFilms;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public List<Movie> getWatchedFilms() { return watchedFilms; }
    public void setWatchedFilms(List<Movie> watchedFilms) { this.watchedFilms = watchedFilms; }

    public List<Movie> getWishlistFilms() { return wishlistFilms; }
    public void setWishlistFilms(List<Movie> wishlistFilms) { this.wishlistFilms = wishlistFilms; }
}
