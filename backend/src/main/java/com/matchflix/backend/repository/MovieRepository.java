package com.matchflix.backend.repository;

import com.matchflix.backend.model.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    // 1) Kullanıcının listelerinde OLMAYAN adaylar (paged)
    @Query("""
        select distinct m
        from Movie m
        where m.id not in (
            select m2.id
            from MovieList ml join ml.movies m2
            where ml.user.id = :userId
        )
    """)
    Page<Movie> findCandidatesNotInUserLists(@Param("userId") Long userId, Pageable pageable);

    // 2) Kullanıcının listelerindeki film id’leri
    @Query("""
        select distinct m.id
        from MovieList ml join ml.movies m
        where ml.user.id = :userId
    """)
    Set<Long> findUserMovieIds(@Param("userId") Long userId);

    // 3) Türlere göre adaylar
    @Query("""
        select distinct m
        from Movie m join m.genres g
        where g.id in :genreIds
    """)
    List<Movie> findCandidatesByAnyGenre(@Param("genreIds") Collection<Long> genreIds);

    Optional<Movie> findByTmdbId(Long tmdbId);

    @Query("""
        select m from Movie m
        left join fetch m.genres
        where m.id = :id
    """)
    Optional<Movie> findByIdWithGenres(@Param("id") Long id);
}
