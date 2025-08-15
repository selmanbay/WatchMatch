package com.matchflix.backend.repository;
import java.util.Optional;
import com.matchflix.backend.model.MovieFeatures;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieFeaturesRepository extends JpaRepository<MovieFeatures, Long> {
    Optional<MovieFeatures> findByMovie_Id(Long movieId);
}
