package com.matchflix.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String genre;
    private int releaseYear;
    private String posterUrl;
    private double rating;
    private String description;

    // Boş constructor (JPA için gerekli)
    public Movie() {}

    // Parametreli constructor
    public Movie(String title, String genre, int releaseYear, String posterUrl, double rating, String description) {
        this.title = title;
        this.genre = genre;
        this.releaseYear = releaseYear;
        this.posterUrl = posterUrl;
        this.rating = rating;
        this.description = description;
    }

    // --------- GETTER & SETTER ---------
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public int getReleaseYear() {
        return releaseYear;
    }

    public void setReleaseYear(int releaseYear) {
        this.releaseYear = releaseYear;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
