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
        private Long id;             // TMDb movie id
        private String title;
        private String releaseDate;  // "YYYY-MM-DD"
        private String posterPath;   // "/abc.jpg"
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

    /** TMDb’den film detayını çek ve DTO döndür. */
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
            // /movie/{id} -> "genres":[{id,name}]
            if (root.has("genres")) {
                for (JsonNode g : root.get("genres")) {
                    if (g.has("id")) gids.add(g.get("id").asLong());
                }
            }
            // bazı list endpointlerinde "genre_ids":[1,2,...] gelebilir
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
     * movie_features.movie_id = movies.id (MapsId)
     */
    @Transactional
    public void upsertFeatures(Movie movie, Long tmdbId) {
        // append_to_response ile tek istek
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
                if ("Director".equals(crew.path("job").asText())) {
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
            for (JsonNode kw : root.path("keywords").path("keywords")) {
                keywords.add(kw.path("name").asText());
            }

            // Overview (detaydan)
            String overview = root.path("overview").asText(null);

            // JSON string’lere çevir
            String dirNamesJson = om.writeValueAsString(directorNames);
            String dirIdsJson   = om.writeValueAsString(directorIds);
            String actNamesJson = om.writeValueAsString(actorNames);
            String actIdsJson   = om.writeValueAsString(actorIds);
            String keywordsJson = om.writeValueAsString(keywords);

            // Upsert (MapsId: movie_id = movie.id)
            MovieFeatures mf = featuresRepo.findById(movie.getId()).orElseGet(() -> {
                MovieFeatures x = new MovieFeatures();
                x.setMovie(movie);   // PK’yi Movie’den alır
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

    /* ---- Opsiyonel: ham JSON lazım olursa ---- */

    public String getPopularMovies() {
        String url = String.format("%s/movie/popular?api_key=%s&language=en-US&page=1", baseUrl, apiKey);
        return rest.getForObject(url, String.class);
    }

    public String searchMovies(String query) {
        String url = String.format("%s/search/movie?api_key=%s&language=en-US&query=%s&page=1&include_adult=false",
                baseUrl, apiKey, encode(query));
        return rest.getForObject(url, String.class);
    }

    private String encode(String s) {
        try {
            return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return s;
        }
    }
}
