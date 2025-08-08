package com.matchflix.backend.model;
import jakarta.persistence.*;

@Entity
@Table(name = "UserPref")
public class UserPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String Sex;
    private String Country;
    private String Language;

}
