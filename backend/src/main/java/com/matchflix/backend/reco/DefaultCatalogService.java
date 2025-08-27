package com.matchflix.backend.reco;

import com.matchflix.backend.dto.MovieDto;
import com.matchflix.backend.mapper.MovieMapper;
import com.matchflix.backend.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DefaultCatalogService {

    private final MovieRepository movieRepo;

    public DefaultCatalogService(MovieRepository movieRepo) {
        this.movieRepo = movieRepo;
    }

    public List<MovieDto> popular(int limit) {
        return movieRepo.findTop50ByOrderByRatingDescIdDesc().stream()
                .limit(limit)
                .map(MovieMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> newReleases(int limit) {
        return movieRepo.findTop50ByOrderByReleaseYearDescIdDesc().stream()
                .limit(limit)
                .map(MovieMapper::toDto)
                .collect(Collectors.toList());
    }
}
