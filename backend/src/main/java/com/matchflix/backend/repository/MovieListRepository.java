package com.matchflix.backend.repository;

import com.matchflix.backend.model.MovieList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieListRepository extends JpaRepository<MovieList, Long> {
    List<MovieList> findByUser_Id(Long userId); // belli bir kullanıcının listeleri
    boolean existsByIdAndMovies_TmdbId(Long listId, Long tmdbId);
}
