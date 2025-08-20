// dto/TmdbMovieDto.java
package com.matchflix.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class TmdbMovieDto {
    public Long movieId;
    public List<Long> directorIds;
    public List<String> directorNames;
    public List<Long> actorIds;
    public List<String> actorNames;
    public List<String> keywords;
    public String overview;

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public List<Long> getDirectorIds() {
        return directorIds;
    }

    public void setDirectorIds(List<Long> directorIds) {
        this.directorIds = directorIds;
    }

    public List<String> getDirectorNames() {
        return directorNames;
    }

    public void setDirectorNames(List<String> directorNames) {
        this.directorNames = directorNames;
    }

    public List<Long> getActorIds() {
        return actorIds;
    }

    public void setActorIds(List<Long> actorIds) {
        this.actorIds = actorIds;
    }

    public List<String> getActorNames() {
        return actorNames;
    }

    public void setActorNames(List<String> actorNames) {
        this.actorNames = actorNames;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }

    public String getOverview() {
        return overview;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }
}
