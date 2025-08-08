package com.matchflix.backend.model;
import jakarta.persistence.*;

@Entity
@Table(name = "ratings")
public class Rate {

    private int score; //Exp: 7 point

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;


    // getter / setter...
}
