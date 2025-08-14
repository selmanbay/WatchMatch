// com.matchflix.backend.dto.TmdbMovieDto
package com.matchflix.backend.dto;

import java.util.List;

public class TmdbMovieDto {
    private Long id;               // TMDB id
    private String title;
    private String releaseDate;    // "YYYY-MM-DD"
    private String posterPath;     // "/xxyyzz.jpg"
    private double voteAverage;
    private String overview;
    private List<Long> genreIds;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }
    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }
    public double getVoteAverage() { return voteAverage; }
    public void setVoteAverage(double voteAverage) { this.voteAverage = voteAverage; }
    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }
    public List<Long> getGenreIds() { return genreIds; }
    public void setGenreIds(List<Long> genreIds) { this.genreIds = genreIds; }
}
