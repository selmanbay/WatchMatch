package com.matchflix.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "general_movie_list")
public class GeneralMovieList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "general_list_id")
    private Long id;

    @Column(name = "genre_name", nullable = false)
    private String genreName;

    @Column(name = "genre_id")
    private Long genreId; // ileride: @ManyToOne Genre genre;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGenreName() { return genreName; }
    public void setGenreName(String genreName) { this.genreName = genreName; }
    public Long getGenreId() { return genreId; }
    public void setGenreId(Long genreId) { this.genreId = genreId; }
}