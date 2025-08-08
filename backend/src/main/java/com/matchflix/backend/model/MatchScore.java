package com.matchflix.backend.model;
import jakarta.persistence.*;
@Entity
@Table(name = "")
public class MatchScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
