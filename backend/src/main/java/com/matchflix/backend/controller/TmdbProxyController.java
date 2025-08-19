// src/main/java/com/matchflix/backend/controller/TmdbProxyController.java
package com.matchflix.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/tmdb")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // gerekiyorsa
public class TmdbProxyController {

    private final RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String apiKey;

    /** /api/tmdb/movie/{id}/credits -> TMDB credits */
    @GetMapping("/movie/{id}/credits")
    public ResponseEntity<Map<String, Object>> credits(@PathVariable long id,
                                                       @RequestParam(defaultValue = "tr-TR") String language) {
        URI uri = UriComponentsBuilder
                .fromUriString("https://api.themoviedb.org/3/movie/{id}/credits")
                .queryParam("api_key", apiKey)
                .queryParam("language", language)
                .buildAndExpand(id)
                .toUri();

        var resp = restTemplate.getForEntity(uri, Map.class);
        return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
    }

    /** /api/tmdb/movie/{id}?append_to_response=credits gibi çağrılar için genel proxy */
    @GetMapping("/movie/{id}")
    public ResponseEntity<Map<String, Object>> movieWithParams(@PathVariable long id,
                                                               @RequestParam Map<String, String> params) {

        // Base URI: path değişkenini yerleştir
        UriComponents base = UriComponentsBuilder
                .fromUriString("https://api.themoviedb.org/3/movie/{id}")
                .buildAndExpand(id);

        // Üzerine query paramları ekle
        UriComponentsBuilder qb = UriComponentsBuilder.fromUri(base.toUri());

        // İstekten gelen tüm paramlar
        params.forEach(qb::queryParam);

        // Zorunlu paramları yoksa ekle
        if (!params.containsKey("api_key")) {
            qb.queryParam("api_key", apiKey);
        }
        if (!params.containsKey("language")) {
            qb.queryParam("language", "tr-TR");
        }

        URI uri = qb.build(true).toUri(); // true = alreadyEncoded

        var resp = restTemplate.getForEntity(uri, Map.class);
        return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
    }
}
