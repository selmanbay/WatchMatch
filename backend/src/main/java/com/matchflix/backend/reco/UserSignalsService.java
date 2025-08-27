package com.matchflix.backend.reco;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.model.MovieList;
import com.matchflix.backend.model.Rate;
import com.matchflix.backend.repository.MovieListRepository;
import com.matchflix.backend.repository.MovieRepository;
import com.matchflix.backend.repository.RateRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserSignalsService {

    private final RateRepository rateRepo;
    private final MovieListRepository listRepo;
    private final MovieRepository movieRepo;

    public UserSignalsService(RateRepository rateRepo,
                              MovieListRepository listRepo,
                              MovieRepository movieRepo) {
        this.rateRepo = rateRepo;
        this.listRepo = listRepo;
        this.movieRepo = movieRepo;
    }

    /** Genel seed: Ratings (yüksek skor), LIKE, WATCHED, WISHLIST sıralı karma (maxSeeds ≤ 5) */
    public List<Long> buildGeneralSeeds(Long userId, int maxSeeds) {
        LinkedHashSet<Long> seeds = new LinkedHashSet<>();

        // 1) Yüksek puanlar (>=8 gibi)
        for (Rate r : rateRepo.findAllByUserAndMinScore(userId, 8.0)) {
            Movie m = r.getMovie();
            if (m != null && m.getTmdbId() != null) {
                seeds.add(m.getTmdbId());
                if (seeds.size() >= maxSeeds) return new ArrayList<>(seeds);
            }
        }

        // 2) LIKE listesi
        for (Movie m : listRepo.findMoviesByUserAndType(userId, MovieList.ListType.LIKE)) {
            if (m.getTmdbId() != null) {
                seeds.add(m.getTmdbId());
                if (seeds.size() >= maxSeeds) return new ArrayList<>(seeds);
            }
        }

        // 3) WATCHED
        for (Movie m : listRepo.findMoviesByUserAndType(userId,  MovieList.ListType.WATCHED)) {
            if (m.getTmdbId() != null) {
                seeds.add(m.getTmdbId());
                if (seeds.size() >= maxSeeds) return new ArrayList<>(seeds);
            }
        }

        // 4) WISHLIST
        for (Movie m : listRepo.findMoviesByUserAndType(userId,  MovieList.ListType.WISHLIST)) {
            if (m.getTmdbId() != null) {
                seeds.add(m.getTmdbId());
                if (seeds.size() >= maxSeeds) return new ArrayList<>(seeds);
            }
        }

        // Hidden events (CLICK/VIEW) kullanılmıyor – isteğin üzere kaldırıldı.

        return new ArrayList<>(seeds);
    }

    /** WISHLIST özel seedleri (maxSeeds ≤ 5) */
    public List<Long> buildWishlistSeeds(Long userId, int maxSeeds) {
        LinkedHashSet<Long> seeds = new LinkedHashSet<>();
        for (Movie m : listRepo.findMoviesByUserAndType(userId,  MovieList.ListType.WISHLIST)) {
            if (m.getTmdbId() != null) {
                seeds.add(m.getTmdbId());
                if (seeds.size() >= maxSeeds) break;
            }
        }
        return new ArrayList<>(seeds);
    }

    /** DISLIKE set’i (önerilerden hariç tutulacak) */
    public Set<Long> buildDislikeTmdbSet(Long userId) {
        LinkedHashSet<Long> s = new LinkedHashSet<>();
        for (Movie m : listRepo.findMoviesByUserAndType(userId,  MovieList.ListType.DISLIKE)) {
            if (m.getTmdbId() != null) s.add(m.getTmdbId());
        }
        return s;
    }
}
