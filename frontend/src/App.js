// src/App.js
import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import AuthForm from "./components/AuthForm";
import MovieGrid from "./components/MovieGrid";
import ProfilePage from "./pages/ProfilePage";
import {
    mainContentStyle,
    containerStyle,
    sectionHeaderStyle,
    sectionTitleStyle
} from "./styles/ui";

/* --- Yardımcılar --- */
function thumbFrom(item) {
    const p =
        item?.posterUrl ||
        item?.poster_path ||
        item?.posterPath ||
        item?.image ||
        item?.backdrop_path;
    if (!p) return null;
    if (/^https?:\/\//i.test(p) || String(p).startsWith("data:")) return p;
    if (String(p).startsWith("/")) return `https://image.tmdb.org/t/p/w92${p}`;
    return p;
}

// Arkaplanda yüksek çözünürlüklü görsel
function getBackdropImage(item) {
    const backdropPath =
        item?.backdrop_path ||
        item?.posterUrl ||
        item?.poster_path ||
        item?.posterPath ||
        item?.image;
    if (!backdropPath) return null;
    if (/^https?:\/\//i.test(backdropPath) || String(backdropPath).startsWith("data:")) return backdropPath;
    if (String(backdropPath).startsWith("/")) return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
    return backdropPath;
}

// TMDB controller farklı şekillerde cevap verebilir
function extractMovies(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.content)) return payload.content;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.movies)) return payload.movies;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
}

/* - Anasayfada göstereceğimiz kategoriler - */
const GENRES = [
    { id: 28, name: "Aksiyon" },
    { id: 12, name: "Macera" },
    { id: 14, name: "Fantastik" },
    { id: 27, name: "Korku" },
    { id: 35, name: "Komedi" },
    { id: 18, name: "Dram" },
    { id: 878, name: "Bilim Kurgu" },
    { id: 10749, name: "Romantik" }
];

function hasGenre(row, gid) {
    if (!row) return false;
    const ids =
        row.genre_ids ||
        row.genreIds ||
        (Array.isArray(row.genres)
            ? row.genres.map((g) => (typeof g === "number" ? g : g?.id)).filter(Boolean)
            : []);
    return Array.isArray(ids) && ids.includes(gid);
}

function uniqById(list) {
    const seen = new Set();
    const out = [];
    for (const item of list) {
        const key = item.id ?? item.tmdbId ?? `${item.title}-${item.release_date}`;
        if (!seen.has(key)) {
            seen.add(key);
            out.push(item);
        }
    }
    return out;
}

async function fetchGenreWithFallbacks(genreId, page, signal) {
    const candidates = [
        `http://localhost:8080/api/tmdb/genre/${genreId}?page=${page}`,
        `http://localhost:8080/api/tmdb/genre/${genreId}/popular?page=${page}`,
        `http://localhost:8080/api/tmdb/discover?with_genres=${genreId}&page=${page}`,
        `http://localhost:8080/api/tmdb/discover/${genreId}?page=${page}`,
        `http://localhost:8080/api/tmdb/genre/${genreId}/trending?page=${page}`,
        `http://localhost:8080/api/tmdb/genre/${genreId}/top-rated?page=${page}`,
        `http://localhost:8080/api/tmdb/genre/${genreId}/movies?page=${page}`,
        // son çare: popular’ı çek ve client’ta filtrele
        `http://localhost:8080/api/tmdb/popular?page=${page}`
    ];

    for (let i = 0; i < candidates.length; i++) {
        try {
            const res = await fetch(candidates[i], { signal });
            if (!res.ok) continue;
            const data = await res.json();
            let arr = extractMovies(data);

            if (i === candidates.length - 1) {
                arr = arr.filter((m) => hasGenre(m, genreId));
            }

            if (Array.isArray(arr) && arr.length > 0) {
                return uniqById(arr);
            }
        } catch (e) {
            if (signal?.aborted) throw e;
        }
    }
    return [];
}

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState("home"); // "home" | "profile"

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    const [wishlist, setWishlist] = useState([]);
    const [watchedlist, setWatchedlist] = useState([]);

    const [tmdbMovies, setTmdbMovies] = useState([]);
    const [tmdbLoading, setTmdbLoading] = useState(false);

    // Son tıklanan film → hero arkaplanı
    const [lastClickedFilm, setLastClickedFilm] = useState(null);

    // --- Arama state ---
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // --- Öneri dropdown state ---
    const [suggestions, setSuggestions] = useState([]); // [{id,title,year,poster,source,kind,raw}]
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    // --- Kategori satırları ---
    const [genreSections, setGenreSections] = useState(
        GENRES.map((g) => ({ ...g, items: [], loading: false, error: null }))
    );

    const bootHandledRef = useRef(false);

    /* ---------------- History entegrasyonu ---------------- */
    useEffect(() => {
        try {
            window.history.replaceState(
                { view: "home" },
                "",
                window.location.pathname + window.location.search
            );
        } catch {}
    }, []);

    useEffect(() => {
        const onPop = (e) => {
            const v = e.state?.view;
            if (v === "profile") {
                setView("profile");
            } else {
                setView("home");
                setIsSearching(false);
                setSearchResults([]);
                setSearchQuery("");
            }
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    const goToProfile = () => {
        setView("profile");
        try {
            window.history.pushState({ view: "profile" }, "", "#profile");
        } catch {}
    };

    const goToHome = () => {
        if (window.history.state?.view === "profile" || view === "profile") {
            try {
                window.history.back();
                return;
            } catch {}
        }
        setIsSearching(false);
        setSearchResults([]);
        setSearchQuery("");
        setView("home");
        try {
            window.history.replaceState(
                { view: "home" },
                "",
                window.location.pathname + window.location.search
            );
        } catch {}
    };
    /* ----------------------------------------------------- */

    // Kalıcı oturum
    useEffect(() => {
        try {
            const raw = localStorage.getItem("wm_user");
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved) {
                    setUser(saved);
                    setView("home");
                }
            }
        } catch (e) {
            console.warn("Kayıtlı oturum okunamadı:", e);
        }
    }, []);

    // Kullanıcı id
    const userId = user?.id ?? user?.userId;

    // Movies + TMDB (kullanıcı gelince)
    useEffect(() => {
        if (user === null) return;

        setLoading(true);
        fetch("http://localhost:8080/api/movies")
            .then((res) => res.json())
            .then((data) => {
                setMovies(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                console.warn("❌ Filmler alınamadı!");
            });

        setTmdbLoading(true);
        fetch("http://localhost:8080/api/tmdb/popular")
            .then((res) => res.json())
            .then((data) => {
                const arr = extractMovies(data);
                setTmdbMovies(arr);
                setTmdbLoading(false);
            })
            .catch(() => {
                setTmdbLoading(false);
                console.warn("❌ TMDB popüler alınamadı!");
            });
    }, [user]);

    // Kategori satırlarını çek
    useEffect(() => {
        if (user === null) return;

        const controller = new AbortController();

        const loadGenre = async (genre, idx) => {
            const page = 1 + Math.floor(Math.random() * 6);

            setGenreSections((prev) =>
                prev.map((s, i) => (i === idx ? { ...s, loading: true, error: null } : s))
            );

            try {
                const items = await fetchGenreWithFallbacks(genre.id, page, controller.signal);
                setGenreSections((prev) =>
                    prev.map((s, i) =>
                        i === idx
                            ? { ...s, items: items.slice(0, 20), loading: false, error: null }
                            : s
                    )
                );
            } catch (e) {
                if (!controller.signal.aborted) {
                    setGenreSections((prev) =>
                        prev.map((s, i) =>
                            i === idx
                                ? {
                                    ...s,
                                    items: [],
                                    loading: false,
                                    error: "Bu kategoride içerik bulunamadı."
                                }
                                : s
                        )
                    );
                }
            }
        };

        GENRES.forEach((g, idx) => loadGenre(g, idx));

        return () => controller.abort();
    }, [user]);

    // Öneriler
    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) {
            setSuggestions([]);
            setSuggestionsLoading(false);
            setIsSearching(false);
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSuggestionsLoading(true);

        const ql = q.toLowerCase();
        const local = (movies || [])
            .filter((m) => (m?.title || "").toLowerCase().includes(ql))
            .slice(0, 5)
            .map((m) => ({
                id: m.id ?? m.movieId ?? m.tmdbId ?? m.title,
                title: m.title || "Film",
                year: m.releaseYear || "",
                poster: thumbFrom(m),
                source: "local",
                kind: "movie",
                raw: m
            }));

        const ac = new AbortController();
        const t = setTimeout(async () => {
            try {
                // TMDB film araması
                const resMovie = await fetch(
                    `http://localhost:8080/api/tmdb/search?query=${encodeURIComponent(q)}`,
                    { signal: ac.signal }
                );
                const dataMovie = resMovie.ok ? await resMovie.json() : null;
                const tmdbMovies = (dataMovie ? extractMovies(dataMovie) : [])
                    .slice(0, 6)
                    .map((r) => ({
                        id: r.id,
                        title: r.title || r.name || "Film",
                        year: (r.release_date || r.first_air_date || "").slice(0, 4),
                        poster: thumbFrom(r),
                        source: "tmdb",
                        kind: "movie",
                        raw: r
                    }));

                // TMDB kişi araması
                const personCandidates = [
                    `http://localhost:8080/api/tmdb/search/person?query=${encodeURIComponent(q)}`,
                    `http://localhost:8080/api/tmdb/person/search?query=${encodeURIComponent(q)}`
                ];
                let dataPerson = null;
                for (const u of personCandidates) {
                    try {
                        const r = await fetch(u, { signal: ac.signal });
                        if (r.ok) { dataPerson = await r.json(); break; }
                    } catch {}
                }
                const personsRaw = dataPerson ? extractMovies(dataPerson) : [];
                const tmdbPersons = personsRaw.slice(0, 6).map((p) => {
                    const dept = (p.known_for_department || "").toLowerCase();
                    const trDept = dept === "acting" ? "Oyuncu"
                        : dept === "directing" ? "Yönetmen"
                            : (p.known_for_department || "Kişi");
                    return {
                        id: p.id,
                        title: p.name,
                        year: trDept,
                        poster: p.profile_path ? `https://image.tmdb.org/t/p/w185${p.profile_path}` : null,
                        source: "tmdb",
                        kind: "person",
                        raw: p
                    };
                });

                setSuggestions([...local, ...tmdbMovies, ...tmdbPersons].slice(0, 12));
            } catch {
                setSuggestions(local);
            } finally {
                setSuggestionsLoading(false);
            }
        }, 300);

        return () => {
            ac.abort();
            clearTimeout(t);
        };
    }, [searchQuery, movies]);

    // --- Aramayı çalıştır (çoklu fallback + alertsiz) ---
    const runSearch = async (q) => {
        const query = (q ?? searchQuery ?? "").trim();
        if (!query) return;

        setIsSearching(true);
        setSearchLoading(true);

        // Backend’inde farklı isimli endpoint’ler olabilir → sırayla dene
        const qs = encodeURIComponent(query);
        const candidates = [
            // Standartlar
            `http://localhost:8080/api/tmdb/search?query=${qs}`,
            `http://localhost:8080/api/tmdb/search/movie?query=${qs}`,
            `http://localhost:8080/api/tmdb/movie/search?query=${qs}`,
            `http://localhost:8080/api/tmdb/search/multi?query=${qs}`,
            `http://localhost:8080/api/tmdb/multi/search?query=${qs}`,
            `http://localhost:8080/api/tmdb/searchAll?query=${qs}`,
            `http://localhost:8080/api/tmdb/movies/search?query=${qs}`,
            // Bazı controller’lar q paramı bekler
            `http://localhost:8080/api/tmdb/search?q=${qs}`,
            `http://localhost:8080/api/tmdb/movie/search?q=${qs}`,
            `http://localhost:8080/api/tmdb/search/multi?q=${qs}`,
            // SON ÇARE: popular çek → client’ta filtrele
            `http://localhost:8080/api/tmdb/popular`
        ];

        let used = null;
        let result = [];
        for (let i = 0; i < candidates.length; i++) {
            const url = candidates[i];
            try {
                const res = await fetch(url);
                if (!res.ok) continue;

                const data = await res.json();

                if (url.endsWith("/popular")) {
                    // popülerden client-side filtre
                    const all = extractMovies(data);
                    const ql = query.toLowerCase();
                    result = all.filter(
                        (m) =>
                            (m.title || m.name || "")
                                .toLowerCase()
                                .includes(ql)
                    );
                } else {
                    result = extractMovies(data);
                }

                if (Array.isArray(result)) {
                    used = url;
                    // Popüler fallback’te de boş olabilir; yine de kabul edelim (alert yok)
                    break;
                }
            } catch (e) {
                // denemeye devam
            }
        }

        if (!used) {
            console.warn("🔎 Arama için uygun endpoint bulunamadı / cevap boş geldi.");
            setSearchResults([]);
        } else {
            setSearchResults(result || []);
        }

        setSearchLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- Uygulama açılışında pending/URL q kontrolü ---
    useEffect(() => {
        if (bootHandledRef.current) return;
        bootHandledRef.current = true;

        try {
            // 1) Header'ın bıraktığı pending URL varsa ona git
            const pending = localStorage.getItem("wm_pending_search_url");
            if (pending) {
                localStorage.removeItem("wm_pending_search_url");
                window.location.assign(pending);
                return; // yönleniyoruz
            }
        } catch {}

        // 2) Sayfa URL'inde q varsa otomatik arama
        try {
            const url = new URL(window.location.href);
            let q = url.searchParams.get("q");

            if (!q) {
                // Hash modunda '#/search?q=...' gibi olabilir
                const hash = url.hash || "";
                const qIndex = hash.indexOf("?");
                if (qIndex !== -1) {
                    const sp = new URLSearchParams(hash.slice(qIndex + 1));
                    q = sp.get("q");
                }
            }

            if (q && q.trim()) {
                setView("home");
                setSearchQuery(q);
                // Aynı tikte aramayı tetikle
                setTimeout(() => runSearch(q), 0);
            }
        } catch {}
    }, []);

    // --- Kişiye göre arama ---
    const runSearchByPerson = async (personId, personName) => {
        if (!personId) return;
        setIsSearching(true);
        setSearchLoading(true);
        try {
            const candidates = [
                `http://localhost:8080/api/tmdb/person/${personId}/combined_credits`,
                `http://localhost:8080/api/tmdb/person/${personId}/movie_credits`,
                `http://localhost:8080/api/tmdb/person/${personId}/credits`,
            ];
            let data = null;
            for (const u of candidates) {
                try {
                    const r = await fetch(u);
                    if (r.ok) { data = await r.json(); break; }
                } catch {}
            }
            const cast = Array.isArray(data?.cast) ? data.cast : [];
            const crew = Array.isArray(data?.crew) ? data.crew : [];
            const directing = crew.filter(c => c.job === "Director" || c.department === "Directing");
            const all = [...cast, ...directing];

            const map = new Map();
            for (const it of all) {
                const id = it.id;
                if (!id) continue;
                if (!map.has(id)) map.set(id, it);
            }
            const list = Array.from(map.values());
            setSearchResults(list);
            if (personName) setSearchQuery(personName);
        } catch (e) {
            console.warn("❌ Kişi film bilgileri alınamadı!", e);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSearch = (qFromHeader) => {
        const query = (qFromHeader ?? searchQuery ?? "").trim();
        if (!query) return;

        const inProfile = view === "profile" || window.location.hash === "#profile";

        if (inProfile) {
            // 1) Profile'deysek önce Home görünümü
            setView("home");
            try {
                window.history.replaceState(
                    { view: "home" },
                    "",
                    window.location.pathname + window.location.search
                );
            } catch {}

            // 2) Aynı tikte aramayı çalıştır ve parent inputunu temizle
            setTimeout(() => {
                runSearch(query);
                setSearchQuery("");   // ✅ Enter’dan sonra input sıfırlansın
            }, 0);
            return;
        }

        // Home'daysak direkt ara ve sonra temizle
        runSearch(query);
        setSearchQuery("");       // ✅ Enter’dan sonra input sıfırlansın
    };


    const handlePickSuggestion = async (sugg) => {
        if (!sugg) return;

        const inProfile = view === "profile" || window.location.hash === "#profile";
        if (inProfile) {
            // Home'a al ve aynı tikte ilgili aramayı çalıştır
            setView("home");
            try {
                window.history.replaceState(
                    { view: "home" },
                    "",
                    window.location.pathname + window.location.search
                );
            } catch {}

            setTimeout(() => {
                if (sugg.kind === "person") {
                    runSearchByPerson(sugg.id, sugg.title);
                } else {
                    const q = sugg.title || "";
                    setSearchQuery(q);
                    runSearch(q);
                }
            }, 0);
            return;
        }

        if (sugg.kind === "person") {
            await runSearchByPerson(sugg.id, sugg.title);
            return;
        }
        const q = sugg.title || "";
        setSearchQuery(q);
        await runSearch(q);
    };

    // Kart tıklanınca hero görselini güncelle
    const handleMovieClick = (movie) => {
        setLastClickedFilm(movie);
    };

    // Çıkış
    const handleLogout = () => {
        try {
            localStorage.removeItem("wm_user");
        } catch {}
        setUser(null);
        setView("home");
        setIsSearching(false);
        setSearchResults([]);
        setSearchQuery("");
        setLastClickedFilm(null);
        try {
            window.history.replaceState(
                { view: "home" },
                "",
                window.location.pathname + window.location.search
            );
        } catch {}
    };

    // Login/Register
    if (user === null) {
        return (
            <AuthForm
                onSuccess={(u) => {
                    try {
                        localStorage.setItem("wm_user", JSON.stringify(u));
                    } catch {}
                    setUser(u);
                    setView("home");
                }}
            />
        );
    }

    // Profil sayfası
    if (view === "profile") {
        return (
            <>
                <Header
                    user={user}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onSearch={handleSearch}
                    onLogout={handleLogout}
                    onProfile={goToProfile}
                    onHome={goToHome}
                    suggestions={suggestions}
                    suggestionsLoading={suggestionsLoading}
                    onPickSuggestion={handlePickSuggestion}
                />
                <ProfilePage
                    user={user}
                    userId={user?.id ?? user?.userId}
                    wishlist={wishlist}
                    watchedlist={watchedlist}
                    onBack={goToHome}
                    onAddWishlist={(m) =>
                        setWishlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                    }
                    onAddWatched={(m) =>
                        setWatchedlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                    }
                />
            </>
        );
    }

    const heroBackgroundImage = lastClickedFilm ? getBackdropImage(lastClickedFilm) : null;
    const heroBgStyle = heroBackgroundImage
        ? {
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.7), rgba(0,0,0,.5)), url(${heroBackgroundImage})`,
            backgroundSize: "cover, cover",
            backgroundPosition: "center center, center center",
            backgroundRepeat: "no-repeat, no-repeat"
        }
        : {
            backgroundImage:
                "linear-gradient(135deg, rgba(0,0,0,.7), rgba(0,0,0,.5)), linear-gradient(135deg, #1a2332, #0f1419)",
            backgroundSize: "cover, cover",
            backgroundPosition: "center center, center center",
            backgroundRepeat: "no-repeat, no-repeat"
        };

    // Ana sayfa + Arama modu
    return (
        <div>
            <Header
                user={user}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onLogout={handleLogout}
                onProfile={goToProfile}
                onHome={goToHome}
                suggestions={suggestions}
                suggestionsLoading={suggestionsLoading}
                onPickSuggestion={handlePickSuggestion}
            />

            <main style={mainContentStyle}>
                {isSearching ? (
                    // SADECE ARAMA SONUÇLARI
                    <section>
                        <div style={sectionHeaderStyle}>
                            <h2 style={sectionTitleStyle}>🔍 Arama Sonuçları</h2>
                            {searchQuery && <div style={{ opacity: 0.8 }}>“{searchQuery}”</div>}
                        </div>
                        {searchLoading ? (
                            <p
                                style={{
                                    textAlign: "center",
                                    padding: "60px 20px",
                                    color: "rgba(255,255,255,0.6)",
                                    fontSize: "1.1rem"
                                }}
                            >
                                ⏳ Aranıyor...
                            </p>
                        ) : (
                            <MovieGrid
                                items={searchResults}
                                fromTmdb
                                onAddWishlist={(m) =>
                                    setWishlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                }
                                onAddWatched={(m) =>
                                    setWatchedlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                }
                                userId={userId}
                                emptyText="Sonuç bulunamadı"
                                onMovieClick={handleMovieClick}
                            />
                        )}
                    </section>
                ) : (
                    // NORMAL ANA SAYFA
                    <div style={containerStyle}>
                        {/* Hero */}
                        <section
                            style={{
                                position: "relative",
                                height: "50vh",
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "60px",
                                borderRadius: "15px",
                                overflow: "hidden",
                                ...heroBgStyle
                            }}
                        >
                            <div style={{ maxWidth: "600px", padding: "40px", zIndex: 2 }}>
                                <h1
                                    style={{
                                        fontSize: "3.5rem",
                                        fontWeight: "bold",
                                        marginBottom: "20px",
                                        background: "linear-gradient(45deg, #dc2626, #ff6b6b)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
                                    }}
                                >
                                    WatchMatch
                                </h1>
                                <p
                                    style={{
                                        fontSize: "1.2rem",
                                        color: "rgba(255, 255, 255, 0.9)",
                                        marginBottom: "30px",
                                        lineHeight: "1.6",
                                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                                    }}
                                >
                                    Film Review & Movie Database Application
                                </p>
                                {lastClickedFilm && (
                                    <div
                                        style={{
                                            fontSize: "0.9rem",
                                            color: "rgba(255, 255, 255, 0.7)",
                                            textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                                        }}
                                    >
                                        Son bakılan: {lastClickedFilm.title || lastClickedFilm.name}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* TMDB Popüler */}
                        <section>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>Popüler Filmler</h2>
                            </div>
                            {tmdbLoading ? (
                                <p
                                    style={{
                                        textAlign: "center",
                                        padding: "60px 20px",
                                        color: "rgba(255, 255, 255, 0.6)",
                                        fontSize: "1.1rem"
                                    }}
                                >
                                    ⏳ Yükleniyor...
                                </p>
                            ) : (
                                <MovieGrid
                                    items={tmdbMovies}
                                    fromTmdb
                                    onAddWishlist={(m) =>
                                        setWishlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                    }
                                    onAddWatched={(m) =>
                                        setWatchedlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                    }
                                    userId={userId}
                                    onMovieClick={handleMovieClick}
                                />
                            )}
                        </section>

                        {/* KATEGORİ SATIRLARI */}
                        {genreSections.map((sec) => (
                            <section key={sec.id}>
                                <div style={sectionHeaderStyle}>
                                    <h2 style={sectionTitleStyle}>{sec.name}</h2>
                                </div>
                                {sec.loading ? (
                                    <p
                                        style={{
                                            textAlign: "center",
                                            padding: "40px 20px",
                                            color: "rgba(255,255,255,0.6)"
                                        }}
                                    >
                                        ⏳ Yükleniyor...
                                    </p>
                                ) : sec.error ? (
                                    <p
                                        style={{
                                            textAlign: "center",
                                            padding: "20px",
                                            color: "rgba(255,255,255,0.7)"
                                        }}
                                    >
                                        {sec.error}
                                    </p>
                                ) : (
                                    <MovieGrid
                                        items={sec.items}
                                        fromTmdb
                                        onAddWishlist={(m) =>
                                            setWishlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                        }
                                        onAddWatched={(m) =>
                                            setWatchedlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                        }
                                        userId={userId}
                                        emptyText="Bu kategoride film bulunamadı"
                                        onMovieClick={handleMovieClick}
                                    />
                                )}
                            </section>
                        ))}

                        {/* Veritabanındaki filmler */}
                        <section>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>🎥 Film Listesi</h2>
                            </div>
                            {loading ? (
                                <p
                                    style={{
                                        textAlign: "center",
                                        padding: "60px 20px",
                                        color: "rgba(255,255,255,0.6)",
                                        fontSize: "1.1rem"
                                    }}
                                >
                                    ⏳ Yükleniyor...
                                </p>
                            ) : (
                                <MovieGrid
                                    items={movies}
                                    emptyText="Hiç film bulunamadı"
                                    onAddWishlist={(m) =>
                                        setWishlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                    }
                                    onAddWatched={(m) =>
                                        setWatchedlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                    }
                                    userId={userId}
                                    onMovieClick={handleMovieClick}
                                />
                            )}
                        </section>

                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
