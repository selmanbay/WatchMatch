package com.matchflix.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "countries")
public class Country {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "country", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<User> users = new ArrayList<>();

    @Column(name = "country_name", nullable = false, length = 100)
    private String countryName;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public List<User> getUsers() { return users; }
    public void setUsers(List<User> users) { this.users = users; }

    public String getCountryName() { return countryName; }
    public void setCountryName(String countryName) { this.countryName = countryName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}
