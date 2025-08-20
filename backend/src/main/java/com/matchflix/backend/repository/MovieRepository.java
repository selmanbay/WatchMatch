package com.matchflix.backend.repository;

import com.matchflix.backend.model.Movie;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    @Query("""
      select distinct m from Movie m
      join m.genres g
      where g.id in :genreIds
    """)
    List<Movie> findCandidatesByAnyGenre(@Param("genreIds") Collection<Long> genreIds);

    java.util.Optional<Movie> findByTmdbId(Long tmdbId);

    // “fetch-join” ile genres’ı beraber almak istersen:
    @Query("""
      select m from Movie m
      left join fetch m.genres
      where m.id = :id
    """)
    java.util.Optional<Movie> findByIdWithGenres(@Param("id") Long id);
}
