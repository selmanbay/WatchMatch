package com.matchflix.backend.dto;

public class GenreDto {
    private Long id;
    private String genreName;

    public GenreDto() {}
    public GenreDto(Long id, String genreName) {
        this.id = id;
        this.genreName = genreName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGenreName() { return genreName; }
    public void setGenreName(String genreName) { this.genreName = genreName; }
}
