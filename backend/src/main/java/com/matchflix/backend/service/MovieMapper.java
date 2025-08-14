package com.matchflix.backend.service;

import com.matchflix.backend.model.Movie;
import org.springframework.stereotype.Component;

@Component
public class MovieMapper {

    // TMDb image base (w500 sık kullanılan boyut)
    private static final String IMG_BASE = "https://image.tmdb.org/t/p/w500";

    public Movie fromTmdb(MovieApiService.TmdbMovieDetails d) {
        Movie m = new Movie();
        m.setTmdbId(d.id);
        m.setTitle(defaultIfBlank(d.title, "(TMDb " + d.id + ")"));
        m.setDescription(defaultIfBlank(d.overview, ""));
        m.setPosterUrl(d.poster_path != null ? IMG_BASE + d.poster_path : "");
        m.setRating(d.vote_average != null ? d.vote_average : 0.0);
        m.setReleaseYear(parseYear(d.release_date));
        return m;
    }

    private Integer parseYear(String releaseDate) {
        if (releaseDate != null && releaseDate.length() >= 4) {
            try { return Integer.parseInt(releaseDate.substring(0, 4)); }
            catch (NumberFormatException ignore) {}
        }
        return 0;
    }

    private String defaultIfBlank(String s, String def) {
        return (s == null || s.isBlank()) ? def : s;
    }
}
