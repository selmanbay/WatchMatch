package com.matchflix.backend.dto;

public class MovieRatingsDto {
    private Long movieId;
    private Double average; // null olabilir (oy yoksa)
    private long count;

    public MovieRatingsDto(Long movieId, Double average, long count) {
        this.movieId = movieId;
        this.average = average;
        this.count = count;
    }

    public Long getMovieId() { return movieId; }
    public Double getAverage() { return average; }
    public long getCount() { return count; }
}
