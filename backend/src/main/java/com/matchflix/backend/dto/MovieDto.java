package com.matchflix.backend.dto;
import com.matchflix.backend.model.Genre;
import java.util.List;

public class MovieDto {
    private Long id;
    private Long tmdbId;
    private String title;
    private int releaseYear;
    private String posterUrl;
    private double rating;
    private String description;
    private List<GenreDto> genres;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getReleaseYear() { return releaseYear; }
    public void setReleaseYear(int releaseYear) { this.releaseYear = releaseYear; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

   public List<GenreDto> getGenres() { return genres; }
    public void setGenres(List<GenreDto> genres) { this.genres = genres; }
}
