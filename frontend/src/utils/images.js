// src/utils/images.js

const API_ORIGIN = (process.env.REACT_APP_API_ORIGIN || "http://localhost:8080").replace(/\/$/, "");
const TMDB_BASE  = "https://image.tmdb.org/t/p";
const DEFAULT_SIZE = "w500";

/**
 * Verilen poster yolunu tam URL'e çevirir.
 * - data:, http(s)://, // -> olduğu gibi
 * - /uploads/... veya /static/... -> backend origin ile birleştir
 * - /abc.jpg -> TMDB base + size
 * - uploads/abc.jpg -> backend origin + /uploads/abc.jpg
 */
export function normalizePosterPath(path, size = DEFAULT_SIZE) {
    if (!path || typeof path !== "string") return null;

    const p = path.trim();
    if (!p) return null;

    // data URL, https://, http:// veya protokol-siz //domain
    if (/^(data:|https?:\/\/|\/\/)/i.test(p)) return p;

    // Kökten başlayan yerel dosyalar (/uploads, /static, /files, /images ...)
    if (p.startsWith("/")) {
        if (/^\/(uploads?|static|files?|images?)\b/i.test(p)) {
            return `${API_ORIGIN}${p}`;
        }
        // Aksi halde TMDB poster_path varsay
        return `${TMDB_BASE}/${size}${p}`;
    }

    // Göreli yol (uploads/abc.jpg gibi) -> backend origin ile birleştir
    if (!p.includes("://")) {
        return `${API_ORIGIN}/${p.replace(/^\//, "")}`;
    }

    return p;
}

/**
 * Bir film/list öğesinden olası tüm poster alanlarını dener.
 * item.movie altını da tarar. İlk geçerli URL döner.
 */
export function pickPoster(item) {
    if (!item) return null;

    const m = item.movie || {};
    const candidates = [
        // sık kullanılan alanlar
        item.posterUrl, item.posterURL, item.poster,
        item.image, item.imageUrl, item.cover, item.coverUrl, item.backdropUrl,
        item.poster_path, item.posterPath, item.backdrop_path, item.profile_path, item.tmdbPosterPath,
        // nested movie
        m.posterUrl, m.posterURL, m.poster,
        m.image, m.imageUrl,
        m.poster_path, m.posterPath, m.backdrop_path, m.profile_path
    ].filter(Boolean);

    for (const c of candidates) {
        const v = normalizePosterPath(c);
        if (v) return v;
    }
    return null;
}
