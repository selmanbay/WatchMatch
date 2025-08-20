// src/main/java/com/matchflix/backend/service/TmdbService.java
package com.matchflix.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieFeatures;
import com.matchflix.backend.repository.MovieFeaturesRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class TmdbService {

    private final RestTemplate rest;
    private final ObjectMapper om;
    private final MovieFeaturesRepository featuresRepo;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.base-url:https://api.themoviedb.org/3}")
    private String baseUrl;

    public TmdbService(RestTemplateBuilder builder,
                       ObjectMapper objectMapper,
                       MovieFeaturesRepository featuresRepo) {
        this.rest = builder.build();
        this.om = objectMapper;
        this.featuresRepo = featuresRepo;
    }

    /** Basit DTO — import servisinde kullanacaksın. */
    public static class TmdbMovieDto {
        private Long id;
        private String title;
        private String releaseDate;
        private String posterPath;
        private double voteAverage;
        private String overview;
        private List<Long> genreIds;

        // getters/setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getReleaseDate() { return releaseDate; }
        public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }
        public String getPosterPath() { return posterPath; }
        public void setPosterPath(String posterPath) { this.posterPath = posterPath; }
        public double getVoteAverage() { return voteAverage; }
        public void setVoteAverage(double voteAverage) { this.voteAverage = voteAverage; }
        public String getOverview() { return overview; }
        public void setOverview(String overview) { this.overview = overview; }
        public List<Long> getGenreIds() { return genreIds; }
        public void setGenreIds(List<Long> genreIds) { this.genreIds = genreIds; }
    }

    /** Tek film detayını çeker */
    public TmdbMovieDto fetchMovie(Long tmdbId) {
        String url = String.format("%s/movie/%d?api_key=%s&language=en-US", baseUrl, tmdbId, apiKey);
        ResponseEntity<String> resp = rest.getForEntity(url, String.class);
        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("TMDb error (details): " + resp.getStatusCode());
        }

        try {
            JsonNode root = om.readTree(resp.getBody());
            TmdbMovieDto dto = new TmdbMovieDto();
            dto.setId(root.path("id").asLong());
            dto.setTitle(root.path("title").asText(null));
            dto.setReleaseDate(root.path("release_date").asText(null));
            dto.setPosterPath(root.path("poster_path").asText(null));
            dto.setVoteAverage(root.path("vote_average").asDouble());
            dto.setOverview(root.path("overview").asText(null));

            List<Long> gids = new ArrayList<>();
            if (root.has("genres")) {
                for (JsonNode g : root.get("genres")) {
                    if (g.has("id")) gids.add(g.get("id").asLong());
                }
            }
            if (root.has("genre_ids")) {
                for (JsonNode n : root.get("genre_ids")) {
                    gids.add(n.asLong());
                }
            }
            dto.setGenreIds(gids);
            return dto;
        } catch (Exception e) {
            throw new IllegalStateException("TMDb parse failed (details)", e);
        }
    }

    /**
     * credits + keywords + overview tek seferde çekip features upsert eder.
     */
    @Transactional
    public void upsertFeatures(Movie movie, Long tmdbId) {
        String url = String.format(
                "%s/movie/%d?api_key=%s&language=en-US&append_to_response=credits,keywords",
                baseUrl, tmdbId, apiKey
        );
        ResponseEntity<String> resp = rest.getForEntity(url, String.class);
        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("TMDb error (features): " + resp.getStatusCode());
        }

        try {
            JsonNode root = om.readTree(resp.getBody());

            // Directors
            List<String> directorNames = new ArrayList<>();
            List<Long> directorIds = new ArrayList<>();
            for (JsonNode crew : root.path("credits").path("crew")) {
                if ("Director".equalsIgnoreCase(crew.path("job").asText())) {
                    directorNames.add(crew.path("name").asText());
                    directorIds.add(crew.path("id").asLong());
                }
            }

            // Top cast (ilk 10)
            List<String> actorNames = new ArrayList<>();
            List<Long> actorIds = new ArrayList<>();
            int cap = 0;
            for (JsonNode cast : root.path("credits").path("cast")) {
                actorNames.add(cast.path("name").asText());
                actorIds.add(cast.path("id").asLong());
                if (++cap >= 10) break;
            }

            // Keywords
            List<String> keywords = new ArrayList<>();
            JsonNode kwNode = root.path("keywords").path("keywords");
            if (kwNode.isMissingNode()) kwNode = root.path("keywords").path("results");
            if (kwNode.isArray()) {
                for (JsonNode kw : kwNode) {
                    keywords.add(kw.path("name").asText());
                }
            }

            String overview = root.path("overview").asText(null);

            // JSON string olarak sakla
            String dirNamesJson = om.writeValueAsString(directorNames);
            String dirIdsJson   = om.writeValueAsString(directorIds);
            String actNamesJson = om.writeValueAsString(actorNames);
            String actIdsJson   = om.writeValueAsString(actorIds);
            String keywordsJson = om.writeValueAsString(keywords);

            MovieFeatures mf = featuresRepo.findById(movie.getId()).orElseGet(() -> {
                MovieFeatures x = new MovieFeatures();
                x.setMovie(movie);
                return x;
            });

            mf.setDirectorNames(directorNames);
            mf.setDirectorIds(directorIds);
            mf.setActorNames(actorNames);
            mf.setActorIds(actorIds);
            mf.setKeywords(keywords);
            mf.setOverview(overview);

            featuresRepo.save(mf);

        } catch (Exception e) {
            throw new IllegalStateException("TMDb parse failed (features)", e);
        }
    }

    /* ---- Popular & Search ---- */

    public String getPopularMovies() {
        String url = String.format("%s/movie/popular?api_key=%s&language=en-US&page=1", baseUrl, apiKey);
        return rest.getForObject(url, String.class);
    }

    public String searchMovies(String query) {
        String url = String.format(
                "%s/search/movie?api_key=%s&language=en-US&query=%s&page=1&include_adult=false",
                baseUrl, apiKey, encode(query));
        return rest.getForObject(url, String.class);
    }

    private String encode(String s) {
        try {
            return URLEncoder.encode(s, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return s;
        }
    }
}
