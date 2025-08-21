package com.matchflix.backend.model;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.matchflix.backend.helper.ListTypeResolver;
@Entity
@Table(
        name = "movie_list",
        indexes = @Index(name = "idx_movie_list_user", columnList = "user_id")
)
public class MovieList {

    public enum ListType { WATCHED, WISHLIST, OTHER,LIKE,DISLIKE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "list_name", nullable = false)
    private String listName; // Örn: Favorilerim

    @Column(name = "list_description", nullable = true)
    private String listDescription;

    @Column(name = "list_image", nullable = false)
    private String listImage;

    @Column(name = "list_rating", nullable = false)
    private String listRating;

    // SAHİPLİK (User -> MovieList 1:N). JSON döngüsünü kesmek için ignore.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private User user;

    // Liste <-> Film (M:N) → ara tablo: list_movies
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "list_movies",
            joinColumns = @JoinColumn(name = "list_id"),
            inverseJoinColumns = @JoinColumn(name = "movie_id")
    )
    private List<Movie> movies = new ArrayList<>();

    @Column(name = "is_is_showshow",nullable = false)
    private boolean show = true;

    public ListType getListType() {
        return listType;
    }

    public void setListType(ListType listType) {
        this.listType = listType;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "list_type", nullable = false)
    private ListType listType;

    // getters/setters
    public Long getId() { return id; }

    public String getListName() { return listName; }
    public void setListName(String listName) { this.listName = listName; }

    public String getListDescription() { return listDescription; }
    public void setListDescription(String listDescription) { this.listDescription = listDescription; }

    public String getListImage() { return listImage; }
    public void setListImage(String listImage) { this.listImage = listImage; }

    public String getListRating() { return listRating; }
    public void setListRating(String listRating) { this.listRating = listRating; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<Movie> getMovies() { return movies; }
    public void setMovies(List<Movie> movies) { this.movies = movies; }

    public boolean isShow() {
        return show;
    }

    public void setShow(boolean show) {
        this.show = show;
    }
}
