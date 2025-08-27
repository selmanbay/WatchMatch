package com.matchflix.backend.reco;

import com.matchflix.backend.tmdb.TmdbApiClient;
import com.matchflix.backend.tmdb.TmdbApiClient.TmdbMovie;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class TmdbResolverService {

    private final TmdbApiClient tmdb;

    public TmdbResolverService(TmdbApiClient tmdb) {
        this.tmdb = tmdb;
    }

    public Optional<Long> resolveToTmdbId(String title, Integer year, String lang) {
        List<TmdbMovie> results = tmdb.searchMovies(title, year); // mümkünse generic döndür
        return results.stream()
                .sorted(Comparator.comparingDouble((TmdbMovie r) -> matchScore(r, title, year, lang)).reversed())
                .filter((TmdbMovie r) -> strongEnough(r, title, year, lang))
                .map(r -> r.id)
                .findFirst();
    }

    private boolean strongEnough(TmdbMovie r, String inTitle, Integer inYear, String inLang) {
        boolean titleOk = norm(r.title).equals(norm(inTitle)) || norm(r.originalTitle).equals(norm(inTitle));
        boolean yearOk  = (inYear == null) || (yearOf(r) == inYear);
        boolean langOk  = (inLang == null) || inLang.equalsIgnoreCase(nullSafe(r.originalLanguage));
        // Başlık tam eşleşirse tek başına yeter; değilse yıl+dil yardımcı olsun
        return titleOk || (yearOk && langOk);
    }

    private double matchScore(TmdbMovie r, String inTitle, Integer inYear, String inLang) {
        double s = 0.0;
        if (norm(r.title).equals(norm(inTitle)) || norm(r.originalTitle).equals(norm(inTitle))) s += 0.7;
        if (inYear != null && yearOf(r) == inYear) s += 0.2;
        if (inLang != null && inLang.equalsIgnoreCase(nullSafe(r.originalLanguage))) s += 0.1;
        s += Math.tanh(((nullSafe(r.voteCount) + 1) / 200.0)) * 0.1;   // oy sayısı bonusu
        s += Math.tanh(((nullSafe(r.popularity) + 1) / 50.0)) * 0.05; // popülerlik bonusu
        return s;
    }

    private String norm(String s) {
        if (s == null) return "";
        return s.toLowerCase().replaceAll("[^a-z0-9ğüşöçıİĞÜŞÖÇ]+", "");
    }

    private int yearOf(TmdbMovie r) {
        if (r.releaseDate == null || r.releaseDate.length() < 4) return -1;
        try { return Integer.parseInt(r.releaseDate.substring(0, 4)); } catch (Exception e) { return -1; }
    }

    private String nullSafe(String s){ return s == null ? "" : s; }
    private int nullSafe(Integer i){ return i == null ? 0 : i; }
    private double nullSafe(Double d){ return d == null ? 0.0 : d; }
}
