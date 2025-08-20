package com.matchflix.backend.dto;

import com.matchflix.backend.model.Movie;

public class ScoredMovieDto {
    public Long id;
    public Long tmdbId;
    public String title;
    public double score;
    public double sGenres, sActors, sDirectors, sKeywords;

    public ScoredMovieDto(Movie m, double score, double sG, double sA, double sD, double sK) {
        this.id = m.getId();
        this.tmdbId = m.getTmdbId();
        this.title = m.getTitle();
        this.score = score;
        this.sGenres = sG; this.sActors = sA; this.sDirectors = sD; this.sKeywords = sK;
    }
}
