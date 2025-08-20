package com.matchflix.backend.controller;

import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieList;
import com.matchflix.backend.model.User;
import com.matchflix.backend.repository.MovieListRepository;
import com.matchflix.backend.repository.MovieRepository;
import com.matchflix.backend.repository.UserRepository;
import com.matchflix.backend.service.MovieImportService;
import com.matchflix.backend.service.MovieListService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movie-lists")
@CrossOrigin(origins = "http://localhost:3000")
public class MovieListController {

    private final MovieListRepository movieListRepo;
    private final MovieRepository movieRepo;
    private final UserRepository userRepo;
    private final MovieListService movieListService;
    private final MovieImportService movieImportService;

    public MovieListController(MovieListRepository movieListRepo,
                               MovieRepository movieRepo,
                               UserRepository userRepo,
                               MovieListService movieListService,
                               MovieImportService movieImportService) {
        this.movieListRepo = movieListRepo;
        this.movieRepo = movieRepo;
        this.userRepo = userRepo;
        this.movieListService = movieListService;
        this.movieImportService = movieImportService;
    }

    // Tek liste (filmleriyle birlikte)
    @GetMapping("/{listId}")
    public ResponseEntity<?> getList(@PathVariable Long listId) {
        try {
            return ResponseEntity.ok(movieListService.getListWithMovies(listId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Liste getirilemedi: " + e.getMessage());
        }
    }

    // Kullanıcının tüm listeleri
    @GetMapping("/user/{userId}")
    public List<MovieList> getListsOfUser(@PathVariable Long userId) {
        return movieListRepo.findByUser_Id(userId);
    }

    // Yeni liste oluştur
    @PostMapping
    public ResponseEntity<?> addMovieList(@RequestBody MovieList body) {
        try {
            if (body.getUser() == null || body.getUser().getId() == null) {
                throw new IllegalArgumentException("user.id zorunlu");
            }

            User owner = userRepo.findById(body.getUser().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kullanıcı bulunamadı"));

            MovieList ml = new MovieList();
            ml.setUser(owner);
            ml.setListName(body.getListName());
            ml.setListDescription(body.getListDescription());
            ml.setListImage(body.getListImage());
            ml.setListRating(body.getListRating());
            ml.setListType(MovieList.ListType.OTHER);

            if (body.getMovies() != null && !body.getMovies().isEmpty()) {
                List<Long> ids = body.getMovies().stream()
                        .map(Movie::getId)
                        .filter(id -> id != null)
                        .toList();
                List<Movie> movies = movieRepo.findAllById(ids);
                ml.setMovies(movies);
            }

            MovieList saved = movieListRepo.save(ml);
            return ResponseEntity.ok(saved);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Liste eklenemedi: " + e.getMessage());
        }
    }

    // Var olan movieId ile ekle
    @PostMapping("/{listId}/movies/{movieId}")
    public ResponseEntity<?> addMovie(@PathVariable Long listId, @PathVariable Long movieId) {
        try {
            MovieList updated = movieListService.addMovieToList(listId, movieId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Listeye film eklenemedi: " + e.getMessage());
        }
    }

    // Listeden film çıkar
    @DeleteMapping("/{listId}/movies/{movieId}")
    public ResponseEntity<?> removeMovie(@PathVariable Long listId, @PathVariable Long movieId) {
        try {
            MovieList updated = movieListService.removeMovieFromList(listId, movieId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Film çıkarılamadı: " + e.getMessage());
        }
    }

    // TMDb id ile ekle: Movie + features garanti, sonra listeye iliştir
    @PostMapping("/{listId}/tmdb/{tmdbId}")
    @Transactional
    public ResponseEntity<?> addByTmdbId(@PathVariable Long listId, @PathVariable Long tmdbId) {
        try {
            movieListRepo.findById(listId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Liste bulunamadı: " + listId));

            Movie movie = movieImportService.ensureMovieAndFeaturesByTmdbId(tmdbId);
            MovieList updated = movieListService.addMovieToList(listId, movie.getId());

            return ResponseEntity.ok(Map.of(
                    "list_id", updated.getId(),
                    "movie_id", movie.getId(),
                    "tmdb_id", movie.getTmdbId(),
                    "title", movie.getTitle()
            ));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("TMDb üzerinden ekleme başarısız: " + e.getMessage());
        }
    }

    /* =========================================================
       Liste güncelle (ad/açıklama/kapak URL)
       PUT /api/movie-lists/{listId}  body: { image: "https://..." }
       ========================================================= */
    @PutMapping("/{listId}")
    public ResponseEntity<?> updateList(@PathVariable Long listId,
                                        @RequestBody Map<String, Object> body) {
        try {
            MovieList ml = movieListRepo.findById(listId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Liste bulunamadı: " + listId));

            if (body.containsKey("listName") || body.containsKey("name")) {
                String name = String.valueOf(body.getOrDefault("listName", body.get("name")));
                if (name != null && !name.isBlank()) ml.setListName(name.trim());
            }
            if (body.containsKey("listDescription") || body.containsKey("description")) {
                String desc = String.valueOf(body.getOrDefault("listDescription", body.get("description")));
                ml.setListDescription(desc == null ? null : desc.trim());
            }
            if (body.containsKey("image") || body.containsKey("listImage") || body.containsKey("cover") || body.containsKey("coverUrl")) {
                Object raw = body.get("image");
                if (raw == null) raw = body.get("listImage");
                if (raw == null) raw = body.get("cover");
                if (raw == null) raw = body.get("coverUrl");
                String img = raw == null ? null : String.valueOf(raw).trim();
                ml.setListImage(img);
            }

            MovieList saved = movieListRepo.save(ml);
            return ResponseEntity.ok(saved);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Liste güncellenemedi: " + e.getMessage());
        }
    }

    /* =========================================================
       Kapak yükle (upload) — multipart/form-data (field: file)
       Dönüşte listImage = /uploads/covers/{dosya}
       ========================================================= */
    @PostMapping(path = "/{listId}/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadCover(@PathVariable Long listId,
                                         @RequestParam("file") MultipartFile file) {
        try {
            MovieList ml = movieListRepo.findById(listId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Liste bulunamadı: " + listId));

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Dosya yüklenmedi.");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Sadece resim dosyaları kabul edilir.");
            }

            Path uploadDir = Paths.get("uploads", "covers");
            Files.createDirectories(uploadDir);

            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (ext == null || ext.isBlank()) ext = "jpg";
            String fileName = "list" + listId + "_" + System.currentTimeMillis() + "." + ext.toLowerCase();

            Path target = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String publicUrl = "/uploads/covers/" + fileName;
            ml.setListImage(publicUrl);
            MovieList saved = movieListRepo.save(ml);

            return ResponseEntity.ok(saved);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Kapak upload başarısız: " + e.getMessage());
        }
    }
}
