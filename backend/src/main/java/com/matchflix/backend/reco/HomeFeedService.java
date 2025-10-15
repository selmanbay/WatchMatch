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
// HomeFeedService.java
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

        // --- KİŞİSEL: sadece user list seed’leri ---
        if (userId != null) {
            // Kullanıcının listelerinden 3-5 tmdbId çek
            var userSeeds = movieRepo.findSeedTmdbIdsByUser(userId, org.springframework.data.domain.PageRequest.of(0, 5));
            System.out.println("[home] userSeeds=" + userSeeds);

            if (!userSeeds.isEmpty()) {
                var forYou = recommendFromSeeds(userSeeds, perSection, dislikeSet);
                if (!forYou.isEmpty()) {
                    sections.add(new HomeSectionDto("for_you", "Senin için", forYou));
                }
            }

            // İstersen wishlist’ten de seedle (varsa farklılaşır)
            var wishSeeds = signals.buildWishlistSeeds(userId, 5);
            if (!wishSeeds.isEmpty()) {
                var fromWish = recommendFromSeeds(wishSeeds, perSection, dislikeSet);
                if (!fromWish.isEmpty()) {
                    sections.add(new HomeSectionDto("from_wishlist", "Wishlist’ine Benzerleri", fromWish));
                }
            }
        }

        // --- DEFAULT ---
        var popular = defaults.popular(perSection);
        if (!popular.isEmpty()) {
            sections.add(new HomeSectionDto("popular", "Trendler", uniqueExclude(popular, dislikeSet)));
        }
        var newReleases = defaults.newReleases(perSection);
        if (!newReleases.isEmpty()) {
            sections.add(new HomeSectionDto("new_releases", "Yeni & Popüler", uniqueExclude(newReleases, dislikeSet)));
        }

        if (sections.isEmpty()) sections.add(new HomeSectionDto("popular", "Trendler", popular));
        return new HomeFeedDto(sections);
    }

    private List<MovieDto> recommendFromSeeds(List<Long> tmdbSeeds, int limit, Set<Long> dislikeSet) {
        var raw = mochi.getRecommendationsWithSeeds(tmdbSeeds, Math.min(limit * 2, 20));
        if (raw == null || raw.isEmpty()) return List.of();

        var ids = raw.stream().map(MochinefClient.RecoItem::tmdb_id).filter(Objects::nonNull).toList();
        var byTmdb = movieRepo.findByTmdbIdIn(ids).stream()
                .collect(java.util.stream.Collectors.toMap(
                        Movie::getTmdbId, m -> m, (a, b) -> a, LinkedHashMap::new
                ));

        List<MovieDto> out = new ArrayList<>();
        for (var it : raw) {
            Long t = it.tmdb_id();
            if (t == null) continue;
            if (dislikeSet.contains(t)) continue;
            var m = byTmdb.get(t);
            if (m != null) {
                out.add(MovieMapper.toDto(m));
                if (out.size() >= limit) break;
            }
        }
        return out;
    }

    private List<MovieDto> uniqueExclude(List<MovieDto> src, Set<Long> dislikeSet) {
        LinkedHashSet<Long> seen = new LinkedHashSet<>();
        List<MovieDto> out = new ArrayList<>();
        for (var d : src) {
            Long t = d.getTmdbId();
            if (t != null && !dislikeSet.contains(t) && seen.add(t)) out.add(d);
        }
        return out;
    }
}
