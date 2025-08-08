package com.matchflix.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cinsiyet: male / female / other
    @Column(nullable = false)
    private String sex;

    // Ülke ismi şimdilik String, sonra Country entity ile değiştiririz
    private String country;

    // Tercih edilen dil (TR, EN, FR gibi)
    private String language;

    @OneToOne
    @JoinColumn(name = "user", unique = true)
    private User user;


    // -------- Getters & Setters --------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
