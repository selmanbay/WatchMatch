// src/main/java/com/matchflix/backend/controller/MovieFeaturesController.java
package com.matchflix.backend.controller;

import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieFeatures;
import com.matchflix.backend.repository.MovieFeaturesRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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

    /* ---------- helpers ---------- */

    private static <T> List<T> nz(List<T> v) {
        return v == null ? Collections.emptyList() : v;
    }

    private static MovieFeaturesDTO toDto(MovieFeatures mf) {
        MovieFeaturesDTO d = new MovieFeaturesDTO();
        d.movieId       = mf.getId();                   // MapsId -> PK = movie_id
        d.directorIds   = nz(mf.getDirectorIds());
        d.directorNames = nz(mf.getDirectorNames());
        d.actorIds      = nz(mf.getActorIds());
        d.actorNames    = nz(mf.getActorNames());
        d.keywords      = nz(mf.getKeywords());
        d.overview      = mf.getOverview();
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
    @Transactional(readOnly = true)
    public ResponseEntity<MovieFeaturesDTO> get(@PathVariable Long movieId) {
        return repo.findById(movieId)
                .map(mf -> ResponseEntity.ok(toDto(mf)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @Transactional(readOnly = true)
    public List<MovieFeaturesDTO> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        String term = (q == null ? "" : q.trim());
        List<MovieFeatures> list = repo.search(term.isEmpty() ? null : term);

        // çok basit sayfalama (repo tarafında pageable yoksa)
        int from = Math.max(0, page * Math.max(size, 1));
        int to   = Math.min(list.size(), from + Math.max(size, 1));
        if (from >= to) return Collections.emptyList();

        return list.subList(from, to).stream().map(MovieFeaturesController::toDto).toList();
    }

    @GetMapping("/by-director")
    @Transactional(readOnly = true)
    public List<MovieFeaturesDTO> byDirector(@RequestParam("name") String name) {
        return repo.findByDirectorName(name).stream().map(MovieFeaturesController::toDto).toList();
    }

    @GetMapping("/by-actor")
    @Transactional(readOnly = true)
    public List<MovieFeaturesDTO> byActor(@RequestParam("name") String name) {
        return repo.findByActorName(name).stream().map(MovieFeaturesController::toDto).toList();
    }

    @GetMapping("/by-keyword")
    @Transactional(readOnly = true)
    public List<MovieFeaturesDTO> byKeyword(@RequestParam("q") String kw) {
        return repo.findByKeyword(kw).stream().map(MovieFeaturesController::toDto).toList();
    }

    /* ---------- CREATE / UPSERT ---------- */
    /**
     * Var ise günceller, yoksa oluşturur. Movie yoksa 404.
     */
    @PostMapping("/{movieId}")
    @Transactional
    public ResponseEntity<MovieFeaturesDTO> upsert(
            @PathVariable Long movieId,
            @RequestBody(required = false) MovieFeaturesDTO body
    ) {
        // Movie referansını doğrula
        Movie movie;
        try {
            movie = em.getReference(Movie.class, movieId);
            // getReference var ama DB’de yoksa erişimde EntityNotFoundException fırlar:
            movie.getId();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }

        MovieFeatures mf = repo.findById(movieId).orElseGet(MovieFeatures::new);
        mf.setId(movieId);
        mf.setMovie(movie);

        if (body != null) apply(mf, body);

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
        return upsert(movieId, body);
    }

    /* ---------- PATCH (kısmi) ---------- */
    @PatchMapping("/{movieId}")
    @Transactional
    public ResponseEntity<MovieFeaturesDTO> patch(
            @PathVariable Long movieId,
            @RequestBody MovieFeaturesDTO patch
    ) {
        Optional<MovieFeatures> opt = repo.findById(movieId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        MovieFeatures mf = opt.get();
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
