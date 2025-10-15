// src/main/java/com/matchflix/backend/controller/TmdbController.java
package com.matchflix.backend.controller;

import com.matchflix.backend.service.TmdbService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tmdb")
@CrossOrigin(origins = "http://localhost:3000")
public class TmdbController {

    private final TmdbService tmdbService;

    public TmdbController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    // ✅ Popüler
    @GetMapping("/popular")
    public String getPopularMovies(@RequestParam(defaultValue = "1") String page,
                                   @RequestParam(defaultValue = "tr-TR") String language) {
        return tmdbService.getPopularMovies(page, language);
    }

    // ✅ Arama
    @GetMapping("/search")
    public String searchMovies(@RequestParam String query,
                               @RequestParam(defaultValue = "1") String page,
                               @RequestParam(defaultValue = "tr-TR") String language) {
        return tmdbService.searchMovies(query, page, language);
    }

    // ✅ Top Rated
    @GetMapping("/top_rated")
    public String topRated(@RequestParam(defaultValue = "1") String page,
                           @RequestParam(defaultValue = "tr-TR") String language) {
        return tmdbService.getTopRated(page, language);
    }

    // ✅ Now Playing
    @GetMapping("/now_playing")
    public String nowPlaying(@RequestParam(defaultValue = "1") String page,
                             @RequestParam(defaultValue = "tr-TR") String language) {
        return tmdbService.getNowPlaying(page, language);
    }

    // ✅ Upcoming
    @GetMapping("/upcoming")
    public String upcoming(@RequestParam(defaultValue = "1") String page,
                           @RequestParam(defaultValue = "tr-TR") String language) {
        return tmdbService.getUpcoming(page, language);
    }

    // ✅ Trending (day|week)
    @GetMapping("/trending")
    public String trending(@RequestParam(defaultValue = "day") String window,
                           @RequestParam(defaultValue = "1") String page,
                           @RequestParam(defaultValue = "tr-TR") String language) {
        return tmdbService.getTrending(window, page, language);
    }

    // ✅ Discover (tüm query paramlarını TMDB’ye iletir)
    // Ör: /api/tmdb/discover?with_genres=28,35&sort_by=popularity.desc&page=2
    @GetMapping("/discover")
    public String discover(@RequestParam Map<String, String> params) {
        return tmdbService.discover(params);
    }

    // ✅ Tekil film detayı (append_to_response destekli)
    // Ör: /api/tmdb/movie/123?append_to_response=credits,keywords&language=tr-TR
    @GetMapping("/movie/{id}")
    public String movie(@PathVariable long id,
                        @RequestParam Map<String, String> params) {
        return tmdbService.getMovieRaw(id, params);
    }

    // ✅ Credits kısa yolu
    @GetMapping("/movie/{id}/credits")
    public String credits(@PathVariable long id,
                          @RequestParam(defaultValue = "tr-TR") String language) {
        return tmdbService.getCredits(id, language);
    }
}

