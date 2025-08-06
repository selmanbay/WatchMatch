package com.matchflix.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
}
