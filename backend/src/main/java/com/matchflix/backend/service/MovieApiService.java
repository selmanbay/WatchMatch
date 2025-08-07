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
}
