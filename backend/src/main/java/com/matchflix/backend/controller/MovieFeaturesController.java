package com.matchflix.backend.controller;

import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieFeatures;
import com.matchflix.backend.repository.MovieFeaturesRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Basit CRUD + arama uçları.
 * React tarafı için 'movie' ilişkisini döndürmüyoruz; DTO ile sadece alanları çıkarıyoruz.
 */
@RestController
@RequestMapping("/api/movie-features")
@CrossOrigin(origins = {"http://localhost:3000"})
public class MovieFeaturesController {

    private final MovieFeaturesRepository repo;

    @PersistenceContext
    private EntityManager em;

    public MovieFeaturesController(MovieFeaturesRepository repo) {
        this.repo = repo;
    }

    /* ---------- DTO ---------- */
    public static class MovieFeaturesDTO {
        public Long movieId;
        public List<Long> directorIds;
        public List<String> directorNames;
        public List<Long> actorIds;
        public List<String> actorNames;
        public List<String> keywords;
        public String overview;
    }

    private static MovieFeaturesDTO toDto(MovieFeatures mf) {
        MovieFeaturesDTO d = new MovieFeaturesDTO();
        d.movieId = mf.getMovieId();
        d.directorIds = mf.getDirectorIds();
        d.directorNames = mf.getDirectorNames();
        d.actorIds = mf.getActorIds();
        d.actorNames = mf.getActorNames();
        d.keywords = mf.getKeywords();
        d.overview = mf.getOverview();
        return d;
    }

    private static void apply(MovieFeatures mf, MovieFeaturesDTO d) {
        if (d.directorIds   != null) mf.setDirectorIds(d.directorIds);
        if (d.directorNames != null) mf.setDirectorNames(d.directorNames);
        if (d.actorIds      != null) mf.setActorIds(d.actorIds);
        if (d.actorNames    != null) mf.setActorNames(d.actorNames);
        if (d.keywords      != null) mf.setKeywords(d.keywords);
        if (d.overview      != null) mf.setOverview(d.overview);
    }

    /* ---------- READ ---------- */

    @GetMapping("/{movieId}")
    public ResponseEntity<MovieFeaturesDTO> get(@PathVariable Long movieId) {
        return repo.findById(movieId)
                .map(mf -> ResponseEntity.ok(toDto(mf)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<MovieFeaturesDTO> search(@RequestParam(required = false) String q) {
        return repo.search(q == null || q.isBlank() ? null : q).stream().map(MovieFeaturesController::toDto).toList();
    }

    @GetMapping("/by-director")
    public List<MovieFeaturesDTO> byDirector(@RequestParam("name") String name) {
        return repo.findByDirectorName(name).stream().map(MovieFeaturesController::toDto).toList();
    }

    @GetMapping("/by-actor")
    public List<MovieFeaturesDTO> byActor(@RequestParam("name") String name) {
        return repo.findByActorName(name).stream().map(MovieFeaturesController::toDto).toList();
    }

    @GetMapping("/by-keyword")
    public List<MovieFeaturesDTO> byKeyword(@RequestParam("q") String kw) {
        return repo.findByKeyword(kw).stream().map(MovieFeaturesController::toDto).toList();
    }

    /* ---------- CREATE / UPSERT ---------- */

    /**
     * Var ise değiştirir (upsert), yoksa oluşturur.
     * Body’de movieId göndermek zorunda değilsin; path değişkeninden alınır.
     */
    @PostMapping("/{movieId}")
    @Transactional
    public ResponseEntity<MovieFeaturesDTO> upsert(
            @PathVariable Long movieId,
            @RequestBody MovieFeaturesDTO body
    ) {
        MovieFeatures mf = repo.findById(movieId).orElseGet(MovieFeatures::new);
        mf.setMovieId(movieId);
        // Movie ilişkisini bağla (MapsId)
        try {
            Movie ref = em.getReference(Movie.class, movieId);
            mf.setMovie(ref);
        } catch (Exception ignored) {}

        apply(mf, body);
        MovieFeatures saved = repo.save(mf);
        return ResponseEntity.ok(toDto(saved));
    }

    /* ---------- PUT (tam değiştir) ---------- */
    @PutMapping("/{movieId}")
    @Transactional
    public ResponseEntity<MovieFeaturesDTO> replace(
            @PathVariable Long movieId,
            @RequestBody MovieFeaturesDTO body
    ) {
        // upsert ile aynı davranışı verelim
        return upsert(movieId, body);
    }

    /* ---------- PATCH (kısmi) ---------- */
    @PatchMapping("/{movieId}")
    @Transactional
    public ResponseEntity<MovieFeaturesDTO> patch(
            @PathVariable Long movieId,
            @RequestBody MovieFeaturesDTO patch
    ) {
        MovieFeatures mf = repo.findById(movieId).orElse(null);
        if (mf == null) return ResponseEntity.notFound().build();
        apply(mf, patch);
        MovieFeatures saved = repo.save(mf);
        return ResponseEntity.ok(toDto(saved));
    }

    /* ---------- DELETE ---------- */
    @DeleteMapping("/{movieId}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long movieId) {
        if (!repo.existsById(movieId)) return ResponseEntity.notFound().build();
        repo.deleteById(movieId);
        return ResponseEntity.noContent().build();
    }
}
