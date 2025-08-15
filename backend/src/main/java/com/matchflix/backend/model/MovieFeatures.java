package com.matchflix.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "movie_features")
public class MovieFeatures {

    @Id
    @Column(name = "movie_id")
    private Long movieId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "movie_id", referencedColumnName = "id")
    private Movie movie;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "director_ids", columnDefinition = "jsonb")
    private List<Long> directorIds;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "director_names", columnDefinition = "jsonb")
    private List<String> directorNames;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "actor_ids", columnDefinition = "jsonb")
    private List<Long> actorIds;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "actor_names", columnDefinition = "jsonb")
    private List<String> actorNames;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "keywords", columnDefinition = "jsonb")
    private List<String> keywords;

    @Column(name = "overview", columnDefinition = "text")
    private String overview;

    // getters/setters
    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }
    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }
    public List<Long> getDirectorIds() { return directorIds; }
    public void setDirectorIds(List<Long> directorIds) { this.directorIds = directorIds; }
    public List<String> getDirectorNames() { return directorNames; }
    public void setDirectorNames(List<String> directorNames) { this.directorNames = directorNames; }
    public List<Long> getActorIds() { return actorIds; }
    public void setActorIds(List<Long> actorIds) { this.actorIds = actorIds; }
    public List<String> getActorNames() { return actorNames; }
    public void setActorNames(List<String> actorNames) { this.actorNames = actorNames; }
    public List<String> getKeywords() { return keywords; }
    public void setKeywords(List<String> keywords) { this.keywords = keywords; }
    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }
}
