package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "genres")
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // <-- ÖNEMLİ: ID'yi DB üretecek
    private Long id;

    @Column(name = "genre_name", nullable = false, unique = true, length = 100)
    private String genreName;

    @Column(name = "genre_image",nullable = true)
    private String genreImage;

    @Column(name = "fav_count")
    private Integer favCount = 0;

    // getters/setters
    public Long getId() { return id; }
    public String getGenreName() { return genreName; }
    public void setGenreName(String genreName) { this.genreName = genreName; }
    public String getGenreImage() { return genreImage; }
    public void setGenreImage(String genreImage) { this.genreImage = genreImage; }
    public Integer getFavCount() { return favCount; }
    public void setFavCount(Integer favCount) { this.favCount = favCount; }
}