package com.matchflix.backend.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
public class TmdbApiClient {

    private final RestTemplate rt;

    @Value("${tmdb.api.key}")
    private String apiKey;

    public TmdbApiClient(RestTemplate rt) {
        this.rt = rt;
    }

    public List<TmdbMovie> searchMovies(String query, Integer year) {
        String base = "https://api.themoviedb.org/3/search/movie";
        String url = String.format("%s?api_key=%s&query=%s%s",
                base, apiKey, urlEncode(query),
                year != null ? "&year=" + year : "");
        TmdbSearchResponse resp = rt.getForObject(url, TmdbSearchResponse.class);
        return (resp != null && resp.results != null) ? resp.results : List.of();
    }

    private String urlEncode(String s) {
        try { return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8); }
        catch (Exception e) { return s; }
    }

    // ====== DTOs ======
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TmdbSearchResponse {
        @JsonProperty("results")
        public List<TmdbMovie> results;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TmdbMovie {
        public Long id;
        public String title;
        @JsonProperty("original_title")
        public String originalTitle;
        @JsonProperty("original_language")
        public String originalLanguage;
        @JsonProperty("release_date")
        public String releaseDate;
        @JsonProperty("vote_count")
        public Integer voteCount;
        @JsonProperty("popularity")
        public Double popularity;
    }
}
