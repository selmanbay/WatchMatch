// src/main/java/com/matchflix/backend/model/MovieFeatures.java
package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "movie_features")
public class MovieFeatures {
    @Id
    @Column(name = "movie_id")
    private Long id; // PK = movies.id

    @MapsId
    @OneToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @Column(name = "director_names", columnDefinition = "text")
    @Convert(converter = com.matchflix.backend.utility.StringListJsonConverter.class)
    private List<String> directorNames;

    @Column(name = "director_ids", columnDefinition = "text")
    @Convert(converter = com.matchflix.backend.utility.LongListJsonConverter.class)
    private List<Long> directorIds;

    @Column(name = "actor_names", columnDefinition = "text")
    @Convert(converter = com.matchflix.backend.utility.StringListJsonConverter.class)
    private List<String> actorNames;

    @Column(name = "actor_ids", columnDefinition = "text")
    @Convert(converter = com.matchflix.backend.utility.LongListJsonConverter.class)
    private List<Long> actorIds;

    @Column(name = "keywords", columnDefinition = "text")
    @Convert(converter = com.matchflix.backend.utility.StringListJsonConverter.class)
    private List<String> keywords;

    @Column(name = "overview", columnDefinition = "text")
    private String overview;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }
    public List<String> getDirectorNames() { return directorNames; }
    public void setDirectorNames(List<String> directorNames) { this.directorNames = directorNames; }
    public List<Long> getDirectorIds() { return directorIds; }
    public void setDirectorIds(List<Long> directorIds) { this.directorIds = directorIds; }
    public List<String> getActorNames() { return actorNames; }
    public void setActorNames(List<String> actorNames) { this.actorNames = actorNames; }
    public List<Long> getActorIds() { return actorIds; }
    public void setActorIds(List<Long> actorIds) { this.actorIds = actorIds; }
    public List<String> getKeywords() { return keywords; }
    public void setKeywords(List<String> keywords) { this.keywords = keywords; }
    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }
}
