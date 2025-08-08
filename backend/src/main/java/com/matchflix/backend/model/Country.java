package com.matchflix.backend.model;
import jakarta.persistence.*;
@Entity
@Table(name = "country")
public class Country {

@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
