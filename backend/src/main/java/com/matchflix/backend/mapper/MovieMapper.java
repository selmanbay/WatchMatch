package com.matchflix.backend.mapper;

import com.matchflix.backend.dto.GenreDto;
import com.matchflix.backend.dto.MovieDto;
import com.matchflix.backend.model.Genre;
import com.matchflix.backend.model.Movie;

import java.util.List;
import java.util.stream.Collectors;

public final class MovieMapper {
    private MovieMapper() {}

    public static MovieDto toDto(Movie m) {
        if (m == null) return null;
        MovieDto dto = new MovieDto();
        dto.setId(m.getId());
        dto.setTmdbId(m.getTmdbId());           // tmdbId alanın Movie entity'inde olmalı
        dto.setTitle(m.getTitle());
        dto.setReleaseYear(m.getReleaseYear());
        dto.setPosterUrl(m.getPosterUrl());
        dto.setRating(m.getRating());
        dto.setDescription(m.getDescription());

        List<GenreDto> genreDtos = (m.getGenres() == null) ? List.of()
                : m.getGenres().stream()
                .map(MovieMapper::toDto)
                .collect(Collectors.toList());
        dto.setGenres(genreDtos);
        return dto;
    }

    private static GenreDto toDto(Genre g) {
        if (g == null) return null;
        return new GenreDto(g.getId(), g.getGenreName());
    }
}
