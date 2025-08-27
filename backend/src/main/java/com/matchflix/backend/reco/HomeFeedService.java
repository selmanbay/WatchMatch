package com.matchflix.backend.reco;

import com.matchflix.backend.dto.MovieDto;
import com.matchflix.backend.dto.HomeFeedDto;
import com.matchflix.backend.dto.HomeSectionDto;
import com.matchflix.backend.mapper.MovieMapper;
import com.matchflix.backend.ml.MochinefClient;
import com.matchflix.backend.ml.MochinefClient.RecoItem;
import com.matchflix.backend.model.Movie;
import com.matchflix.backend.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class HomeFeedService {

    private final UserSignalsService signals;
    private final DefaultCatalogService defaults;
    private final MochinefClient mochi;
    private final MovieRepository movieRepo;

    public HomeFeedService(UserSignalsService signals,
                           DefaultCatalogService defaults,
                           MochinefClient mochi,
                           MovieRepository movieRepo) {
        this.signals = signals;
        this.defaults = defaults;
        this.mochi = mochi;
        this.movieRepo = movieRepo;
    }

    public HomeFeedDto buildHome(Long userId, int perSection) {
        List<HomeSectionDto> sections = new ArrayList<>();

        Set<Long> dislikeSet = (userId != null) ? signals.buildDislikeTmdbSet(userId) : Set.of();

        // 1) Kişisel bölümler
        if (userId != null) {
            List<Long> generalSeeds = signals.buildGeneralSeeds(userId, 5);
            if (!generalSeeds.isEmpty()) {
                List<MovieDto> forYou = recommendFromSeeds(generalSeeds, perSection, dislikeSet);
                if (!forYou.isEmpty()) {
                    sections.add(new HomeSectionDto("for_you", "Senin için", forYou));
                }
            }

            List<Long> wishSeeds = signals.buildWishlistSeeds(userId, 5);
            if (!wishSeeds.isEmpty()) {
                List<MovieDto> fromWish = recommendFromSeeds(wishSeeds, perSection, dislikeSet);
                if (!fromWish.isEmpty()) {
                    sections.add(new HomeSectionDto("from_wishlist", "Wishlist’ine Benzerleri", fromWish));
                }
            }
        }

        // 2) Default bölümler (her durumda)
        List<MovieDto> popular = defaults.popular(perSection);
        if (!popular.isEmpty()) {
            sections.add(new HomeSectionDto("popular", "Trendler", uniqueExclude(popular, dislikeSet)));
        }

        List<MovieDto> newReleases = defaults.newReleases(perSection);
        if (!newReleases.isEmpty()) {
            sections.add(new HomeSectionDto("new_releases", "Yeni & Popüler", uniqueExclude(newReleases, dislikeSet)));
        }

        // En az 1 bölüm garantisi
        if (sections.isEmpty()) {
            sections.add(new HomeSectionDto("popular", "Trendler", popular));
        }

        return new HomeFeedDto(sections);
    }

    private List<MovieDto> recommendFromSeeds(List<Long> tmdbSeeds, int limit, Set<Long> dislikeSet) {
        List<RecoItem> raw = mochi.getRecommendationsWithSeeds(tmdbSeeds, Math.min(limit * 2, 20));
        if (raw == null || raw.isEmpty()) return List.of();

        // TMDb id → Movie map
        Map<Long, Movie> byTmdb = movieRepo.findByTmdbIdIn(
                raw.stream().map(RecoItem::tmdb_id).filter(Objects::nonNull).toList()
        ).stream().collect(Collectors.toMap(
                Movie::getTmdbId, m -> m, (a, b) -> a, LinkedHashMap::new
        ));

        List<MovieDto> result = new ArrayList<>();
        for (RecoItem item : raw) {
            Long t = item.tmdb_id();
            if (t == null) continue;
            if (dislikeSet.contains(t)) continue; // DISLIKE filtrele
            Movie m = byTmdb.get(t);
            if (m != null) {
                result.add(MovieMapper.toDto(m));
                if (result.size() >= limit) break;
            }
        }
        return result;
    }

    private List<MovieDto> uniqueExclude(List<MovieDto> src, Set<Long> dislikeSet) {
        LinkedHashSet<Long> seen = new LinkedHashSet<>();
        List<MovieDto> out = new ArrayList<>();
        for (MovieDto d : src) {
            if (d.getTmdbId() != null && !dislikeSet.contains(d.getTmdbId()) && seen.add(d.getTmdbId())) {
                out.add(d);
            }
        }
        return out;
    }

}
