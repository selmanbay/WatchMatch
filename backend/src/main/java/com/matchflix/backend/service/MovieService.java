package com.matchflix.backend.service;
import com.matchflix.backend.dto.TmdbMovieDto;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.repository.MovieRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;
import com.matchflix.backend.model.Genre;
import com.matchflix.backend.repository.GenreRepository;
import com.matchflix.backend.dto.MovieDto;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final TmdbService tmdbService;
    private final GenreRepository genreRepository;
    private final GenreService genreService;

    public MovieService(MovieRepository movieRepository,

                        TmdbService tmdbService, GenreRepository genreRepository, GenreService genreService) {
        this.movieRepository = movieRepository;
        this.tmdbService = tmdbService;
        this.genreRepository = genreRepository;
        this.genreService = genreService;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id).orElse(null);
    }

    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    /** TMDB Movie Genre ID -> İsim eşlemesi */
    private static final Map<Long, String> TMDB_GENRE_MAP = Map.ofEntries(
            Map.entry(28L, "Action"),
            Map.entry(12L, "Adventure"),
            Map.entry(16L, "Animation"),
            Map.entry(35L, "Comedy"),
            Map.entry(80L, "Crime"),
            Map.entry(99L, "Documentary"),
            Map.entry(18L, "Drama"),
            Map.entry(10751L, "Family"),
            Map.entry(14L, "Fantasy"),
            Map.entry(36L, "History"),
            Map.entry(27L, "Horror"),
            Map.entry(10402L, "Music"),
            Map.entry(9648L, "Mystery"),
            Map.entry(10749L, "Romance"),
            Map.entry(878L, "Science Fiction"),
            Map.entry(10770L, "TV Movie"),
            Map.entry(53L, "Thriller"),
            Map.entry(10752L, "War"),
            Map.entry(37L, "Western")
    );

    /**
     * TMDB'den gelen genreId listesine göre Genre entity listesini döndürür.
     * - İsimden bulur, yoksa oluşturur.
     */
    @Transactional
    public List<Genre> resolveGenres(List<Long> tmdbGenreIds) {
        if (tmdbGenreIds == null || tmdbGenreIds.isEmpty()) {
            return new ArrayList<>();
        }

        // id'leri uniq yap
        List<Long> distinctIds = tmdbGenreIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        List<Genre> result = new ArrayList<>();

        for (Long gid : distinctIds) {
            String name = TMDB_GENRE_MAP.get(gid);
            if (name == null || name.isBlank()) {
                // Bilinmeyen ID'yi istersen atla:
                // continue;

                // ya da "Unknown-<id>" olarak oluştur:
                name = "Unknown-" + gid;
            }
            final String nameFinal = name;
            Genre genre = genreRepository.findByGenreNameIgnoreCase(name)
                    .orElseGet(() -> {
                        Genre g = new Genre();
                        g.setGenreName(nameFinal);
                        // opsiyonel alanların varsa setle (genreImage, favCount vs.)
                        return genreRepository.save(g);
                    });

            result.add(genre);
        }

        return result;
    }

    public Movie saveOrGetMovie(Movie movie) {
        return movieRepository.findByTmdbId(movie.getTmdbId())
                .orElseGet(() -> movieRepository.save(movie));
    }

    public Movie updateMovie(Long id, Movie updatedMovie) {
        return movieRepository.findById(id).map(movie -> {
            movie.setTitle(updatedMovie.getTitle());
            movie.setReleaseYear(updatedMovie.getReleaseYear());
            movie.setPosterUrl(updatedMovie.getPosterUrl());
            movie.setRating(updatedMovie.getRating());
            movie.setDescription(updatedMovie.getDescription());
            return movieRepository.save(movie);
        }).orElse(null);
    }
    private static String nvl(String s, String def) {
        return (s == null) ? def : s;
    }

    private int yearFromReleaseDate(String date) {
        if (date == null || date.length() < 4) return 0;
        try {
            return Integer.parseInt(date.substring(0, 4));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    public Movie importFromTmdb(Long tmdbId) {
        return movieRepository.findByTmdbId(tmdbId)
                .orElseGet(() -> {
                    System.out.println("Movie not found in DB: " + tmdbId);

                    var dto = tmdbService.fetchMovie(tmdbId);
                    if (dto == null) {
                        throw new IllegalArgumentException("TMDb'de film bulunamadı: " + tmdbId);
                    }

                    Movie m = new Movie();
                    // dto.id yoksa yine de parametreden setleyelim:
                    m.setTmdbId(dto.getId() != null ? dto.getId() : tmdbId);
                    m.setTitle(nvl(dto.getTitle(), "(TMDb " + tmdbId + ")"));
                    m.setReleaseYear(yearFromReleaseDate(dto.getReleaseDate()));
                    m.setPosterUrl(nvl(dto.getPosterPath(), ""));
                    m.setRating(dto.getVoteAverage());
                    m.setDescription(nvl(dto.getOverview(), ""));

                    List<Genre> genres = genreService.resolveGenres(dto.getGenreIds());
                    m.setGenres(genres);

                    // Yarış durumu ihtimaline karşı güvenli kayıt
                    try {
                        return movieRepository.save(m);   // <-- Movie döndür!
                    } catch (DataIntegrityViolationException e) {
                        // Bu sırada başka thread eklediyse tekrar bulup dön
                        return movieRepository.findByTmdbId(tmdbId).orElseThrow(() -> e);
                    }
                });
    }
    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }

}
