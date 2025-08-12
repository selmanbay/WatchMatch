package com.matchflix.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_username", columnNames = "username")
        },
        indexes = {
                @Index(name = "idx_users_country", columnList = "country_id")
        }
)
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false) private String email;
    @Column(nullable = false) private String password;
    @Column(nullable = false) private String username;
    @Column(nullable = true) private String pp_link;
    @Column(name = "first_name", nullable = false) private String firstName;
    @Column(name = "last_name",  nullable = false) private String lastName;

    // Kullanıcının sahip olduğu listelerin id'leri (opsiyonel denormalizasyon)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_list_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "list_id", nullable = false)
    private Set<Long> ownListIds = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MovieList> movieLists = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Rate> ratings = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    @JsonIgnore
    private UserPreference preference;

    public String getPp_link() {
        return pp_link;
    }

    public void setPp_link(String pp_link) {
        this.pp_link = pp_link;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", foreignKey = @ForeignKey(name = "fk_users_country"))
    private Country country;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Set<Long> getOwnListIds() { return ownListIds; }
    public void setOwnListIds(Set<Long> ownListIds) { this.ownListIds = ownListIds; }

    public List<MovieList> getMovieLists() { return movieLists; }
    public void setMovieLists(List<MovieList> movieLists) { this.movieLists = movieLists; }

    public List<Rate> getRatings() { return ratings; }
    public void setRatings(List<Rate> ratings) { this.ratings = ratings; }

    public UserPreference getPreference() { return preference; }
    public void setPreference(UserPreference preference) { this.preference = preference; }

    public Country getCountry() { return country; }
    public void setCountry(Country country) { this.country = country; }
}
