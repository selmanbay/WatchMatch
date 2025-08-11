package com.matchflix.backend.model;
import jakarta.persistence.*;
@Entity
@Table(name = "match_scores")
public class MatchScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
