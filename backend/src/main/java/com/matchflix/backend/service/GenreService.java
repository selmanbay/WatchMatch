package com.matchflix.backend.service;

import com.matchflix.backend.model.Genre;
import com.matchflix.backend.repository.GenreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GenreService {

    private final GenreRepository genreRepository;

    public GenreService(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    /** TMDB Movie Genre ID -> İsim eşlemesi */
    private static final Map<Long, String> TMDB_GENRE_MAP = Map.ofEntries(
            Map.entry(28L, "Action"), Map.entry(12L, "Adventure"), Map.entry(16L, "Animation"),
            Map.entry(35L, "Comedy"), Map.entry(80L, "Crime"), Map.entry(99L, "Documentary"),
            Map.entry(18L, "Drama"), Map.entry(10751L, "Family"), Map.entry(14L, "Fantasy"),
            Map.entry(36L, "History"), Map.entry(27L, "Horror"), Map.entry(10402L, "Music"),
            Map.entry(9648L, "Mystery"), Map.entry(10749L, "Romance"), Map.entry(878L, "Science Fiction"),
            Map.entry(10770L, "TV Movie"), Map.entry(53L, "Thriller"), Map.entry(10752L, "War"),
            Map.entry(37L, "Western")
    );

    @Transactional
    public List<Genre> resolveGenres(List<Long> tmdbGenreIds) {
        if (tmdbGenreIds == null || tmdbGenreIds.isEmpty()) return new ArrayList<>();

        List<Long> distinctIds = tmdbGenreIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        List<Genre> result = new ArrayList<>();
        for (Long gid : distinctIds) {
            String name = TMDB_GENRE_MAP.getOrDefault(gid, "Unknown-" + gid).trim();

            Genre g = genreRepository.findByGenreNameIgnoreCase(name)
                    .orElseGet(() -> {
                        Genre ng = new Genre();
                        ng.setGenreName(name);       // ID’yi set etmiyoruz
                        return genreRepository.save(ng);
                    });

            result.add(g);
        }
        return result;
    }
}
