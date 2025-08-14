package com.matchflix.backend.repository;

import com.matchflix.backend.model.MovieList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieListRepository extends JpaRepository<MovieList, Long> {
    List<MovieList> findByUser_Id(Long userId); // belli bir kullanıcının listeleri
    boolean existsByIdAndMovies_TmdbId(Long listId, Long tmdbId);
    @Query("select ml from MovieList ml left join fetch ml.movies where ml.id = :id")
    Optional<MovieList> findByIdWithMovies(@Param("id") Long id);
}
