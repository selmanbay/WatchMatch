package com.matchflix.backend.service;

import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieList;
import com.matchflix.backend.repository.MovieListRepository;
import com.matchflix.backend.repository.MovieRepository;
import org.springframework.stereotype.Service;

@Service
public class MovieListService {

    private final MovieListRepository listRepo;
    private final MovieRepository movieRepo;

    public MovieListService(MovieListRepository listRepo, MovieRepository movieRepo) {
        this.listRepo = listRepo;
        this.movieRepo = movieRepo;
    }

    public MovieList addMovieToList(Long listId, Long movieId) {
        MovieList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));
        Movie movie = movieRepo.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Film bulunamadı: " + movieId));

        // zaten ekli mi?
        if (list.getMovies().stream().noneMatch(m -> m.getId().equals(movie.getId()))) {
            list.getMovies().add(movie);
            list = listRepo.save(list);
        }
        return list;
    }

    public MovieList removeMovieFromList(Long listId, Long movieId) {
        MovieList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));
        // sadece id karşılaştırarak kaldır
        list.getMovies().removeIf(m -> m.getId().equals(movieId));
        return listRepo.save(list);
    }

    public MovieList getListWithMovies(Long listId) {
        return listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("Liste bulunamadı: " + listId));
    }
}
