package com.matchflix.backend.service;

import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieList;
import com.matchflix.backend.repository.MovieListRepository;
import com.matchflix.backend.repository.MovieRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class MovieListService {

    private final MovieListRepository listRepo;
    private final MovieRepository movieRepo;
    private final MovieApiService movieApi;   // TMDb istemcisi
    private final MovieMapper movieMapper;    // TMDb → Movie mapper

    public MovieListService(MovieListRepository listRepo,
                            MovieRepository movieRepo,
                            MovieApiService movieApi,
                            MovieMapper movieMapper) {
        this.listRepo = listRepo;
        this.movieRepo = movieRepo;
        this.movieApi = movieApi;
        this.movieMapper = movieMapper;
    }

    /**
     * TMDb ID ile: varsa Movie'yi getir; yoksa TMDb'den detay çekip oluştur;
     * sonra listeye (idempotent) ekle ve güncel listeyi döndür.
     */
    @Transactional
    public MovieList addByTmdbId(Long listId, Long tmdbId) {
        MovieList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));

        // DB'de film var mı?
        Movie movie = movieRepo.findByTmdbId(tmdbId).orElse(null);

        // Yoksa TMDb'den doldur
        if (movie == null) {
            MovieApiService.TmdbMovieDetails d = movieApi.getMovieDetails(tmdbId, "tr-TR");

            if (d == null || d.id == null) {
                // Fallback: NOT NULL kolonlar için güvenli varsayılanlar
                movie = new Movie();
                movie.setTmdbId(tmdbId);
                movie.setTitle("(TMDb " + tmdbId + ")");
                movie.setDescription("");
                movie.setPosterUrl("");
                movie.setRating(0.0);
                movie.setReleaseYear(0);
            } else {
                movie = movieMapper.fromTmdb(d);
            }

            // Yarış durumlarına karşı güvenli kayıt
            try {
                movie = movieRepo.save(movie);
            } catch (DataIntegrityViolationException e) {
                movie = movieRepo.findByTmdbId(tmdbId).orElseThrow(() -> e);
            }
        }

        // Listede zaten var mı? (effectively final id kullan)
        final Long targetId = movie.getId();
        boolean already = list.getMovies()
                .stream()
                .anyMatch(m -> Objects.equals(m.getId(), targetId));

        if (!already) {
            list.getMovies().add(movie);
            list = listRepo.save(list);
        }
        return list;
    }

    /**
     * Var olan movieId'yi listeye ekler (idempotent).
     */
    @Transactional
    public MovieList addMovieToList(Long listId, Long movieId) {
        MovieList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));
        Movie movie = movieRepo.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Film bulunamadı: " + movieId));

        boolean already = list.getMovies()
                .stream()
                .anyMatch(m -> Objects.equals(m.getId(), movie.getId()));

        if (!already) {
            list.getMovies().add(movie);
            list = listRepo.save(list);
        }
        return list;
    }

    /**
     * Listeden filmi çıkarır.
     */
    @Transactional
    public MovieList removeMovieFromList(Long listId, Long movieId) {
        MovieList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));
        list.getMovies().removeIf(m -> Objects.equals(m.getId(), movieId));
        return listRepo.save(list);
    }

    /**
     * Listeyi (filmleriyle) getirir.
     * Not: İlişki lazy ise JSON'da boş gelebilir; ihtiyaca göre @EntityGraph'lı
     * findWithMoviesById(...) repository metodu ekleyebilirsin.
     */
    @Transactional(readOnly = true)
    public MovieList getListWithMovies(Long listId) {
        return listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));
    }
}
