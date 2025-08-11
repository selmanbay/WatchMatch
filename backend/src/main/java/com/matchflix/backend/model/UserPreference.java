package com.matchflix.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cinsiyet: male / female / other (ileride Enum önerilir)
    @Column(nullable = false)
    private String sex;


    // Tercih edilen dil (TR, EN, FR gibi)
    private String language;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore // döngüyü kır
    private User user;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
