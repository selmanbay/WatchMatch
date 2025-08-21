package com.matchflix.backend.dto;

public class RateDto {
    private Long id;
    private Long userId;
    private Long movieId;
    private int score;

    public RateDto(Long id, Long userId, Long movieId, int score) {
        this.id = id;
        this.userId = userId;
        this.movieId = movieId;
        this.score = score;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getMovieId() { return movieId; }
    public int getScore() { return score; }
}
