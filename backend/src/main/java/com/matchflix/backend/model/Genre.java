package com.matchflix.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "genre")
public class Genre {
    @Id
    // TMDb genre id'lerini kullanacaksan @GeneratedValue KOYMAYIN.
    // Eğer kendi id’nizi üretmek isterseniz: @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Action, Drama, ...

    @ManyToMany(mappedBy = "genres")
    private List<Movie> movies = new ArrayList<>();

    // getter/setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; } // TMDb id set edilecekse lazım
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<Movie> getMovies() { return movies; }
}
