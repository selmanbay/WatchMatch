// src/main/java/com/matchflix/backend/service/MovieListService.java
package com.matchflix.backend.service;

import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieList;
import com.matchflix.backend.repository.MovieListRepository;
import com.matchflix.backend.repository.MovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class MovieListService {

    private final MovieListRepository listRepo;
    private final MovieRepository movieRepo;
    private final MovieService movieService; // TMDb import burada

    public MovieListService(MovieListRepository listRepo,
                            MovieRepository movieRepo,
                            MovieService movieService) {
        this.listRepo = listRepo;
        this.movieRepo = movieRepo;
        this.movieService = movieService;
    }

    /**
     * TMDb ID ile: varsa Movie'yi getir; yoksa TMDb'den import et;
     * listeye (idempotent) ekle ve filmleri fetch-join ile dolu döndür.
     */
    @Transactional
    public MovieList addByTmdbId(Long listId, Long tmdbId) {
        MovieList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));

        // 1) Film DB'de var mı? yoksa import et
        Movie movie = movieRepo.findByTmdbId(tmdbId)
                .orElseGet(() -> movieService.importFromTmdb(tmdbId));

        // 2) Zaten listede var mı?
        final Long targetId = movie.getId();
        boolean already = list.getMovies().stream()
                .anyMatch(m -> Objects.equals(m.getId(), targetId));

        if (!already) {
            list.getMovies().add(movie);
            listRepo.save(list); // join tablosuna yaz
        }

        // 3) Dönmeden önce filmleri fetch-join ile yükle
        return listRepo.findByIdWithMovies(listId)
                .orElseThrow(() -> new RuntimeException("Liste fetch-join ile bulunamadı: " + listId));
    }

    /** Var olan movieId'yi listeye ekler (idempotent) ve fetch-join ile döner. */
    @Transactional
    public MovieList addMovieToList(Long listId, Long movieId) {
        MovieList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));
        Movie movie = movieRepo.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Film bulunamadı: " + movieId));

        boolean already = list.getMovies().stream()
                .anyMatch(m -> Objects.equals(m.getId(), movie.getId()));

        if (!already) {
            list.getMovies().add(movie);
            listRepo.save(list);
        }

        return listRepo.findByIdWithMovies(listId)
                .orElseThrow(() -> new RuntimeException("Liste fetch-join ile bulunamadı: " + listId));
    }

    /** Listeden filmi çıkarır ve fetch-join ile döner. */
    @Transactional
    public MovieList removeMovieFromList(Long listId, Long movieId) {
        MovieList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));

        list.getMovies().removeIf(m -> Objects.equals(m.getId(), movieId));
        listRepo.save(list);

        return listRepo.findByIdWithMovies(listId)
                .orElseThrow(() -> new RuntimeException("Liste fetch-join ile bulunamadı: " + listId));
    }

    /** Liste + filmler (fetch-join). */
    @Transactional(readOnly = true)
    public MovieList getListWithMovies(Long listId) {
        return listRepo.findByIdWithMovies(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));
    }

    /* ===================== YENİ: Kapak URL güncelle ===================== */

    /**
     * Listenin kapak görselini günceller.
     * Entity alan adın farklıysa (image/cover/coverUrl) setteri buna göre değiştir.
     */
    @Transactional
    public MovieList updateCoverUrl(Long listId, String url) {
        MovieList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));
        list.setListImage(url); // <- alanın adı farklıysa burada değiştir
        return listRepo.save(list);
    }
}
