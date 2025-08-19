package com.matchflix.backend.repository;

import com.matchflix.backend.model.MovieFeatures;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieFeaturesRepository extends JpaRepository<MovieFeatures, Long> {

    // Mevcut convenience method'un
    Optional<MovieFeatures> findByMovie_Id(Long movieId);

    // Gerekirse: id yoksa hata at
    default MovieFeatures require(Long id) {
        return findById(id).orElseThrow(() -> new IllegalArgumentException("MovieFeatures not found: " + id));
    }

    // Genel serbest metin araması: overview + director_names + actor_names + keywords (jsonb)
    @Query(value = """
        SELECT *
        FROM movie_features mf
        WHERE (:q IS NULL OR
               mf.overview ILIKE CONCAT('%', :q, '%')
               OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(mf.director_names) AS dn WHERE dn ILIKE CONCAT('%', :q, '%'))
               OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(mf.actor_names)    AS an WHERE an ILIKE CONCAT('%', :q, '%'))
               OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(mf.keywords)       AS kw WHERE kw ILIKE CONCAT('%', :q, '%'))
        )
        ORDER BY mf.movie_id
        """, nativeQuery = true)
    List<MovieFeatures> search(@Param("q") String q);

    // Yönetmen adına göre ara (jsonb)
    @Query(value = """
        SELECT * FROM movie_features mf
        WHERE EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(mf.director_names) AS dn
            WHERE dn ILIKE CONCAT('%', :name, '%')
        )
        ORDER BY mf.movie_id
        """, nativeQuery = true)
    List<MovieFeatures> findByDirectorName(@Param("name") String name);

    // Oyuncu adına göre ara (jsonb)
    @Query(value = """
        SELECT * FROM movie_features mf
        WHERE EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(mf.actor_names) AS an
            WHERE an ILIKE CONCAT('%', :name, '%')
        )
        ORDER BY mf.movie_id
        """, nativeQuery = true)
    List<MovieFeatures> findByActorName(@Param("name") String name);

    // Keyword'e göre ara (jsonb)
    @Query(value = """
        SELECT * FROM movie_features mf
        WHERE EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(mf.keywords) AS kw
            WHERE kw ILIKE CONCAT('%', :kw, '%')
        )
        ORDER BY mf.movie_id
        """, nativeQuery = true)
    List<MovieFeatures> findByKeyword(@Param("kw") String keyword);
}
