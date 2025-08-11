package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "genres")
public class Genre {
    @Id
    // TMDb genre id'lerini kullanacaksan @GeneratedValue KULLANMA.
    // Eğer kendi id'nizi üretmek isterseniz: @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "genre_image", nullable = false)
    private String genreImage;

    @Column(name = "genre_name", nullable = false)
    private String genreName;

    @Column(name = "fav_count", nullable = false)
    private Integer favCount;

    @ManyToMany(mappedBy = "genres", fetch = FetchType.LAZY)
    private List<Movie> movies = new ArrayList<>();

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGenreImage() { return genreImage; }
    public void setGenreImage(String genreImage) { this.genreImage = genreImage; }
    public String getGenreName() { return genreName; }
    public void setGenreName(String genreName) { this.genreName = genreName; }
    public Integer getFavCount() { return favCount; }
    public void setFavCount(Integer favCount) { this.favCount = favCount; }
    public List<Movie> getMovies() { return movies; }
    public void setMovies(List<Movie> movies) { this.movies = movies; }
}