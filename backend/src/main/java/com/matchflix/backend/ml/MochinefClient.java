package com.matchflix.backend.ml;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.repository.MovieRepository;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MochinefClient {

    private final RestTemplate rt;
    private final MovieRepository movieRepository;

    @Value("${ml.baseUrl:http://localhost:8000}")
    private String base;

    public MochinefClient(RestTemplate rt, MovieRepository movieRepository) {
        this.rt = rt;
        this.movieRepository = movieRepository;
    }

    /* ===================== RECOMMEND ===================== */

    /** FastAPI /recommend dönüş satırı */
    public record PyRecoMovie(
            Long id,
            String title,
            Double similarity,
            String poster_path,
            Double vote_average,
            String release_date,
            List<String> genres
    ) {}

    /** Uygulama içinde kullandığımız tek tip öneri öğesi */
    public record RecoItem(
            Long tmdb_id,
            String title,
            Integer year,
            String original_language,
            Double score
    ) {}

    /** DB’den (3-5) seed seçip FastAPI’ye gönderir; düz liste döner → RecoItem'a map’ler */
    public List<RecoItem> getRecommendations(String userExtId, int limit) {
        String url = base + "/recommend";

        // DB'den TMDb id'leri → seed olarak 3-5 tane (FastAPI max 5)
        List<Long> seeds = movieRepository.findAll().stream()
                .map(Movie::getTmdbId)
                .filter(Objects::nonNull)
                .distinct()
                .limit(3) // istersen 5 yapabilirsin
                .toList();

        if (seeds.isEmpty()) return List.of();

        Map<String, Object> reqBody = Map.of(
                "movie_ids", seeds,
                "top_n", Math.min(limit, 20)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

        ResponseEntity<List<PyRecoMovie>> resp = rt.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<List<PyRecoMovie>>() {}
        );

        List<PyRecoMovie> py = resp.getBody();
        if (py == null || py.isEmpty()) return List.of();

        return py.stream()
                .map(m -> new RecoItem(
                        m.id(),                 // FastAPI 'id' ⇒ TMDb id gibi kullanıyoruz
                        m.title(),
                        parseYear(m.release_date()),
                        null,                   // FastAPI dil dönmüyor
                        m.similarity()
                ))
                .collect(Collectors.toList());
    }

    /** Dışarıdan verilen seed listesiyle öneri (max 5 id kuralı) */
    public List<RecoItem> getRecommendationsWithSeeds(List<Long> tmdbSeeds, int topN) {
        String url = base + "/recommend";
        if (tmdbSeeds == null || tmdbSeeds.isEmpty()) return List.of();

        List<Long> seeds = tmdbSeeds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .limit(5) // FastAPI constraint
                .toList();

        Map<String, Object> reqBody = Map.of(
                "movie_ids", seeds,
                "top_n", Math.min(topN, 20)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

        ResponseEntity<List<PyRecoMovie>> resp = rt.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<List<PyRecoMovie>>() {}
        );

        List<PyRecoMovie> py = resp.getBody();
        if (py == null || py.isEmpty()) return List.of();

        return py.stream()
                .map(m -> new RecoItem(
                        m.id(),
                        m.title(),
                        parseYear(m.release_date()),
                        null,
                        m.similarity()
                ))
                .toList();
    }

    private Integer parseYear(String date) {
        try {
            return (date != null && date.length() >= 4)
                    ? Integer.parseInt(date.substring(0, 4))
                    : null;
        } catch (Exception e) {
            return null;
        }
    }

    /* ===================== SEARCH ===================== */

    /** FastAPI /movies/search yanıt satırı */
    public record MovieSearchResult(
            Long id,
            String title,
            String release_date,
            String poster_path,
            Double vote_average,
            List<String> genres
    ) {}

    public List<MovieSearchResult> searchMovieByTitle(String title) {
        return searchMovieByTitle(title, 10);
    }

    public List<MovieSearchResult> searchMovieByTitle(String title, int limit) {
        String q = URLEncoder.encode(title == null ? "" : title.trim(), StandardCharsets.UTF_8);
        String url = String.format("%s/movies/search?query=%s&limit=%d", base, q, limit);

        try {
            ResponseEntity<MovieSearchResult[]> resp = rt.getForEntity(url, MovieSearchResult[].class);
            MovieSearchResult[] arr = resp.getBody();
            return (arr != null && arr.length > 0) ? List.of(arr) : List.of();
        } catch (HttpStatusCodeException ignore) {
            return List.of();
        }
    }
}
