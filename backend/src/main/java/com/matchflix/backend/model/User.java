package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;

    @Column(unique = true, nullable = false) private String email;
    @Column(nullable = false) private String password;
    @Column(nullable = false) private String username;

    @OneToMany(mappedBy = "user") // kullanıcının listeleri
    private List<MovieList> lists = new ArrayList<>();

    @OneToMany(mappedBy = "user") // kullanıcının verdiği puanlar
    private List<Rate> ratings = new ArrayList<>();

    // getter/setter
    public Long getUser_id() { return user_id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public List<MovieList> getLists() { return lists; }
    public List<Rate> getRatings() { return ratings; }
}
