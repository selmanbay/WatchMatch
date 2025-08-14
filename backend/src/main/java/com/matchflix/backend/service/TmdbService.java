package com.matchflix.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

/**
 * Tek parça TMDB servisi.
 * Kullanım: tmdbService.fetchMovie(603L) -> DTO döner
 */
@Service
public class TmdbService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.base-url:https://api.themoviedb.org/3}")
    private String baseUrl;

    public TmdbService(RestTemplateBuilder builder, ObjectMapper objectMapper) {
        this.restTemplate = builder.build();
        this.objectMapper = objectMapper;
    }

    /** Bu DTO’yu ayrı bir dosyaya taşımak zorunda değilsin; burada kalsın. */
    public static class TmdbMovieDto {
        private Long id;               // TMDB movie id
        private String title;
        private String releaseDate;    // "YYYY-MM-DD"
        private String posterPath;     // "/abc.jpg"
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

    private int yearFromReleaseDate(String releaseDate) {
        if (releaseDate == null) return 0;
        String s = releaseDate.trim();
        if (s.length() < 4) return 0;
        try {
            return Integer.parseInt(s.substring(0, 4)); // "2023-05-01" -> 2023
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    /** TMDB’den film detayını çeker ve DTO döner. */
    public TmdbMovieDto fetchMovie(Long tmdbId) {
        String url = String.format("%s/movie/%d?api_key=%s&language=en-US",
                baseUrl, tmdbId, apiKey);

        ResponseEntity<String> resp = restTemplate.getForEntity(url, String.class);
        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("TMDB error: " + resp.getStatusCode());
        }

        try {
            JsonNode root = objectMapper.readTree(resp.getBody());
            TmdbMovieDto dto = new TmdbMovieDto();
            dto.setId(root.path("id").asLong());
            dto.setTitle(root.path("title").asText(null));
            dto.setReleaseDate(root.path("release_date").asText(null));
            dto.setPosterPath(root.path("poster_path").asText(null));
            dto.setVoteAverage(root.path("vote_average").asDouble());
            dto.setOverview(root.path("overview").asText(null));

            List<Long> gids = new ArrayList<>();
            // /movie/{id} cevabı: "genres":[{id,name}]
            if (root.has("genres")) {
                for (JsonNode g : root.get("genres")) {
                    if (g.has("id")) gids.add(g.get("id").asLong());
                }
            }
            // bazı endpointlerde "genre_ids":[1,2,...] gelebilir
            if (root.has("genre_ids")) {
                for (JsonNode n : root.get("genre_ids")) {
                    gids.add(n.asLong());
                }
            }
            dto.setGenreIds(gids);
            return dto;
        } catch (Exception e) {
            throw new IllegalStateException("TMDB parse failed", e);
        }
    }
}
