package com.matchflix.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class MovieApiService {

    @Value("${tmdb.api.key}")
    private String apiKey;

    private final String baseUrl = "https://api.themoviedb.org/3";

    public TmdbMovieDetails getMovieDetails(long tmdbId, String language) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/movie/" + tmdbId)
                .queryParam("api_key", apiKey)
                .queryParam("language", language != null ? language : "tr-TR")
                .toUriString();

        RestTemplate rest = new RestTemplate();
        return rest.getForObject(url, TmdbMovieDetails.class); // 200 ise parse eder, 404 ise exception fırlatır
    }
    public String getPopularMovies() {
        String url = baseUrl + "/movie/popular?api_key=" + apiKey + "&language=tr-TR&page=1";
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, String.class);
    }

    // ✅ Yeni eklenen arama fonksiyonu
    public String searchMovies(String query) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/search/movie")
                .queryParam("api_key", apiKey)
                .queryParam("language", "tr-TR")
                .queryParam("query", query)
                .queryParam("page", "1")
                .toUriString();

        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, String.class);
    }

    public static class TmdbMovieDetails {
        public Long id;               // tmdbId
        public String title;
        public String overview;       // description
        public String release_date;   // "1999-03-31"
        public String poster_path;    // "/abc.jpg"
        public Double vote_average;   // rating
        // istersen genres, runtime vs. ekleyebilirsin
    }
}
