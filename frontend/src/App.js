// src/App.js
import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import AuthForm from "./components/AuthForm";
import MovieGrid from "./components/MovieGrid";
import ProfilePage from "./pages/ProfilePage";
import BestMatchCard from "./components/BestMatchCard";
import MatchUsersRail from "./components/MatchUsersRail";
import MovieDetailModal from "./components/MovieDetailModal";

import {
    mainContentStyle,
    containerStyle,
    sectionHeaderStyle,
    sectionTitleStyle,
} from "./styles/ui";

/* ================= Helpers ================= */
function thumbFrom(item) {
    const p =
        item?.posterUrl ||
        item?.poster_path ||
        item?.posterPath ||
        item?.image ||
        item?.backdrop_path;
    if (!p) return null;
    if (/^https?:\/\//i.test(p) || String(p).startsWith("data:")) return p;
    if (String(p).startsWith("/")) return `https://image.tmdb.org/t/p/w342${p}`;
    return p;
}
function getHighQualityPoster(item) {
    const p = item?.posterUrl || item?.poster_path || item?.posterPath || item?.image;
    if (!p) return null;
    if (/^https?:\/\//i.test(p) || String(p).startsWith("data:")) return p;
    if (String(p).startsWith("/")) return `https://image.tmdb.org/t/p/w500${p}`;
    return p;
}
function getBackdropImage(item) {
    const backdropPath =
        item?.backdrop_path ||
        item?.posterUrl ||
        item?.poster_path ||
        item?.posterPath ||
        item?.image;
    if (!backdropPath) return null;
    if (/^https?:\/\//i.test(backdropPath) || String(backdropPath).startsWith("data:"))
        return backdropPath;
    if (String(backdropPath).startsWith("/"))
        return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
    return backdropPath;
}
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
function getTitle(it) {
    return (it?.title || it?.name || "Film").trim();
}
function getYear(it) {
    const d = it?.release_date || it?.first_air_date || it?.releaseYear || "";
    return d ? String(d).slice(0, 4) : "";
}
function getVote(it) {
    const v = it?.vote_average ?? it?.rating ?? it?.voteAverage;
    return typeof v === "number" ? Math.round(v * 10) / 10 : null;
}

const API = process.env.REACT_APP_API_BASE || "http://localhost:8080";

/* ================= Component ================= */
function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState("home");

    // kişisel feed
    const [homeFeed, setHomeFeed] = useState({ sections: [] });
    const [feedLoading, setFeedLoading] = useState(false);

    // TMDB ek vitrinler
    const [tmdbPopular, setTmdbPopular] = useState([]);
    const [tmdbExtra, setTmdbExtra] = useState([]); // top rated / now playing / upcoming / trending
    const [tmdbLoading, setTmdbLoading] = useState(false);

    // hero slayt
    const [heroMovies, setHeroMovies] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [lastClickedFilm, setLastClickedFilm] = useState(null);
    const heroFromFeedRef = useRef(false);

    // arama
    const [searchQuery, setSearchQuery] = useState("");

    // dropdown öneriler
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    // listeler
    const [wishlist, setWishlist] = useState([]);
    const [watchedlist, setWatchedlist] = useState([]);

    // yalnızca HERO/ÖNERİ için modal (kartlar kendi modallarını açsın diye MovieGrid’e onClick vermiyoruz)
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailMovie, setDetailMovie] = useState(null);

    const matchRailRef = useRef(null);
    const bootHandledRef = useRef(false);

    /* -------------- History -------------- */
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
            if (v === "profile") setView("profile");
            else setView("home");
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
        setView("home");
        try {
            window.history.replaceState(
                { view: "home" },
                "",
                window.location.pathname + window.location.search
            );
        } catch {}
    };

    /* -------------- Session -------------- */
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
        } catch {}
    }, []);
    const userId = user?.id ?? user?.userId;

    /* -------------- Feed -------------- */
    const normalizeSections = (raw) => {
        const list = Array.isArray(raw?.sections) ? raw.sections : Array.isArray(raw) ? raw : [];
        const mapped = list
            .map((s, idx) => {
                const items = Array.isArray(s?.items) ? s.items : extractMovies(s);
                const title =
                    s?.title ||
                    s?.name ||
                    (s?.key ? s.key.replaceAll("_", " ").toUpperCase() : `Bölüm ${idx + 1}`);
                const key = s?.key || `sec_${idx}`;
                return { key, title, items: Array.isArray(items) ? items : [] };
            })
            .filter((s) => s.items.length > 0);
        return mapped;
    };

    const loadHomeFeed = async (uid) => {
        if (!uid) return;
        setFeedLoading(true);
        try {
            const res = await fetch(`${API}/api/reco/home?userId=${uid}&perSection=20`, {
                headers: { accept: "*/*" },
            });
            if (!res.ok) throw new Error(`status ${res.status}`);
            const data = await res.json();
            const sections = normalizeSections(data);
            setHomeFeed({ sections });

            // hero önceliği
            const pick =
                sections.find((s) => (s.key || "").includes("for_you")) ||
                sections.find((s) => (s.key || "").includes("from_wishlist")) ||
                sections.find((s) => (s.key || "").includes("popular")) ||
                sections.find((s) => (s.key || "").includes("new_releases")) ||
                sections[0];

            if (pick?.items?.length) {
                setHeroMovies(pick.items.slice(0, 12));
                setCurrentSlide(0);
                heroFromFeedRef.current = true;
            }
        } catch (e) {
            console.warn("Home feed hatası:", e);
            setHomeFeed({ sections: [] });
        } finally {
            setFeedLoading(false);
        }
    };

    /* -------------- TMDB ek vitrinler -------------- */
    const fetchFlexible = async (candidates) => {
        for (const u of candidates) {
            try {
                const r = await fetch(u);
                if (r.ok) {
                    const d = await r.json();
                    const arr = extractMovies(d);
                    if (Array.isArray(arr) && arr.length) return arr;
                }
            } catch {}
        }
        return [];
    };

    const loadTmdbVitrins = async () => {
        setTmdbLoading(true);
        try {
            // Popular
            const popular = await fetchFlexible([
                `${API}/api/tmdb/popular`,
                `${API}/api/tmdb/movie/popular`,
                `${API}/api/tmdb/movies/popular`,
            ]);
            setTmdbPopular(popular);

            // 4 ek bölüm
            const extrasDefs = [
                {
                    key: "top_rated",
                    title: "En Yüksek Puanlılar",
                    urls: [
                        `${API}/api/tmdb/top_rated`,
                        `${API}/api/tmdb/movie/top_rated`,
                        `${API}/api/tmdb/movies/top_rated`,
                    ],
                },
                {
                    key: "now_playing",
                    title: "Vizyondakiler",
                    urls: [
                        `${API}/api/tmdb/now_playing`,
                        `${API}/api/tmdb/movie/now_playing`,
                        `${API}/api/tmdb/movies/now_playing`,
                    ],
                },
                {
                    key: "upcoming",
                    title: "Yakında",
                    urls: [
                        `${API}/api/tmdb/upcoming`,
                        `${API}/api/tmdb/movie/upcoming`,
                        `${API}/api/tmdb/movies/upcoming`,
                    ],
                },
                {
                    key: "trending",
                    title: "Gündemdekiler",
                    urls: [
                        `${API}/api/tmdb/trending`,
                        `${API}/api/tmdb/trending/movie`,
                        `${API}/api/tmdb/trending/movies`,
                    ],
                },
            ];

            const extras = [];
            for (const def of extrasDefs) {
                const arr = await fetchFlexible(def.urls);
                if (arr.length) extras.push({ key: def.key, title: def.title, items: arr });
            }
            setTmdbExtra(extras);
            // hero: kişiselden gelmediyse popülerden doldur
            if (!heroFromFeedRef.current && !heroMovies.length && popular.length) {
                setHeroMovies(popular.slice(0, 12));
            }
        } finally {
            setTmdbLoading(false);
        }
    };

    /* -------------- Slayt oto-geçiş -------------- */
    useEffect(() => {
        if (!heroMovies.length) return;
        const id = setInterval(() => {
            setCurrentSlide((i) => (i + 1) % heroMovies.length);
        }, 4000);
        return () => clearInterval(id);
    }, [heroMovies.length]);

    /* -------------- İlk Yük -------------- */
    useEffect(() => {
        if (user === null) return;
        const uid = user?.id ?? user?.userId;
        if (uid) loadHomeFeed(uid);
        loadTmdbVitrins();
    }, [user]); // eslint-disable-line

    /* -------------- Search Suggestions -------------- */
    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) {
            setSuggestions([]);
            setSuggestionsLoading(false);
            return;
        }
        setSuggestionsLoading(true);

        const ac = new AbortController();
        const t = setTimeout(async () => {
            try {
                const resMovie = await fetch(
                    `${API}/api/tmdb/search?query=${encodeURIComponent(q)}`,
                    { signal: ac.signal }
                );
                const dataMovie = resMovie.ok ? await resMovie.json() : null;
                const tmdbMovies = (dataMovie ? extractMovies(dataMovie) : [])
                    .slice(0, 8)
                    .map((r) => ({
                        id: r.id,
                        title: r.title || r.name || "Film",
                        year: (r.release_date || r.first_air_date || "").slice(0, 4),
                        poster: thumbFrom(r),
                        source: "tmdb",
                        kind: "movie",
                        raw: r,
                    }));

                // kişi araması (opsiyonel)
                const personCandidates = [
                    `${API}/api/tmdb/search/person?query=${encodeURIComponent(q)}`,
                    `${API}/api/tmdb/person/search?query=${encodeURIComponent(q)}`,
                ];
                let dataPerson = null;
                for (const u of personCandidates) {
                    try {
                        const r = await fetch(u, { signal: ac.signal });
                        if (r.ok) {
                            dataPerson = await r.json();
                            break;
                        }
                    } catch {}
                }
                const personsRaw = dataPerson ? extractMovies(dataPerson) : [];
                const tmdbPersons = personsRaw.slice(0, 6).map((p) => {
                    const dept = (p.known_for_department || "").toLowerCase();
                    const trDept =
                        dept === "acting" ? "Oyuncu" :
                            dept === "directing" ? "Yönetmen" :
                                p.known_for_department || "Kişi";
                    return {
                        id: p.id,
                        title: p.name,
                        year: trDept,
                        poster: p.profile_path
                            ? `https://image.tmdb.org/t/p/w185${p.profile_path}`
                            : null,
                        source: "tmdb",
                        kind: "person",
                        raw: p,
                    };
                });

                setSuggestions([...tmdbMovies, ...tmdbPersons].slice(0, 12));
            } catch {
                setSuggestions([]);
            } finally {
                setSuggestionsLoading(false);
            }
        }, 250);

        return () => {
            ac.abort();
            clearTimeout(t);
        };
    }, [searchQuery]);

    /* -------------- Search Run: sadece hero/öneri için modal aç -------------- */
    const runSearch = async (q) => {
        const query = (q ?? searchQuery ?? "").trim();
        if (!query) return;

        try {
            const recoRes = await fetch(`${API}/api/reco/search?q=${encodeURIComponent(query)}`);
            if (recoRes.ok) {
                const recoData = await res.json();
                const recoResults = Array.isArray(recoData) ? recoData : [];
                if (recoResults.length > 0) {
                    openDetail(recoResults[0]);
                    return;
                }
            }
        } catch {}

        const qs = encodeURIComponent(query);
        const candidates = [
            `${API}/api/tmdb/search?query=${qs}`,
            `${API}/api/tmdb/search/movie?query=${qs}`,
            `${API}/api/tmdb/movie/search?query=${qs}`,
            `${API}/api/tmdb/search/multi?query=${qs}`,
            `${API}/api/tmdb/multi/search?query=${qs}`,
            `${API}/api/tmdb/searchAll?query=${qs}`,
            `${API}/api/tmdb/movies/search?query=${qs}`,
            `${API}/api/tmdb/search?q=${qs}`,
            `${API}/api/tmdb/movie/search?q=${qs}`,
            `${API}/api/tmdb/search/multi?q=${qs}`,
            `${API}/api/tmdb/popular`,
        ];

        for (const url of candidates) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const data = await res.json();
                let list = [];
                if (url.endsWith("/popular")) {
                    const all = extractMovies(data);
                    const ql = query.toLowerCase();
                    list = all.filter((m) =>
                        (m.title || m.name || "").toLowerCase().includes(ql)
                    );
                } else {
                    list = extractMovies(data);
                }
                if (Array.isArray(list) && list.length) {
                    openDetail(list[0]);
                    return;
                }
            } catch {}
        }
    };

    /* -------------- URL boot search -------------- */
    useEffect(() => {
        if (bootHandledRef.current) return;
        bootHandledRef.current = true;

        try {
            const pending = localStorage.getItem("wm_pending_search_url");
            if (pending) {
                localStorage.removeItem("wm_pending_search_url");
                window.location.assign(pending);
                return;
            }
        } catch {}

        try {
            const url = new URL(window.location.href);
            let q = url.searchParams.get("q");
            if (!q) {
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
                setTimeout(() => runSearch(q), 0);
            }
        } catch {}
    }, []); // eslint-disable-line

    /* -------------- UI handlers -------------- */
    const openDetail = (movie) => {
        if (!movie) return;
        setDetailMovie(movie);
        setDetailOpen(true);
    };

    const handleSearch = (qFromHeader) => {
        const query = (qFromHeader ?? searchQuery ?? "").trim();
        if (!query) return;
        const inProfile = view === "profile" || window.location.hash === "#profile";
        if (inProfile) {
            setView("home");
            try {
                window.history.replaceState(
                    { view: "home" },
                    "",
                    window.location.pathname + window.location.search
                );
            } catch {}
            setTimeout(() => {
                runSearch(query);
                setSearchQuery("");
            }, 0);
            return;
        }
        runSearch(query);
        setSearchQuery("");
    };

    const handlePickSuggestion = async (sugg) => {
        if (!sugg) return;
        const inProfile = view === "profile" || window.location.hash === "#profile";
        if (inProfile) {
            setView("home");
            try {
                window.history.replaceState(
                    { view: "home" },
                    "",
                    window.location.pathname + window.location.search
                );
            } catch {}
            setTimeout(() => openDetail(sugg.raw || sugg), 0);
            return;
        }
        openDetail(sugg.raw || sugg);
    };

    // slayt tıklama → senin modal (App-level)
    const handleSlideClick = (movie) => openDetail(movie);

    const refreshUserVector = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API}/api/match/refresh/${userId}`, { method: "POST" });
            if (res.ok) console.log("Kullanıcı vektörü yenilendi");
            matchRailRef.current?.refresh?.();
            loadHomeFeed(userId);
        } catch (e) {
            console.warn("Vektör yenileme hatası:", e);
        }
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem("wm_user");
        } catch {}
        setUser(null);
        setView("home");
        setLastClickedFilm(null);
        setHomeFeed({ sections: [] });
        setHeroMovies([]);
        try {
            window.history.replaceState(
                { view: "home" },
                "",
                window.location.pathname + window.location.search
            );
        } catch {}
    };

    /* -------------- Auth gates -------------- */
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
                    userId={userId}
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

    /* -------------- Hero BG -------------- */
    const bgCandidate = heroMovies[currentSlide] || lastClickedFilm || tmdbPopular[0] || null;
    const heroBackgroundImage = bgCandidate ? getBackdropImage(bgCandidate) : null;
    const heroBgStyle = heroBackgroundImage
        ? {
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url(${heroBackgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            transition: "background-image 1s ease-in-out",
        }
        : {
            background: "linear-gradient(135deg, #1a2332 0%, #0f1419 50%, #2d1b69 100%)",
        };

    /* -------------- Render -------------- */
    return (
        <div>
            {/* Local styles */}
            <style>{`
        @keyframes gradientShift {
          0% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(40deg); }
          100% { filter: hue-rotate(0deg); }
        }
        .wm-hero-dot{width:10px;height:10px;border-radius:999px;border:1px solid rgba(255,255,255,.6);opacity:.7;transition:transform .2s ease}
        .wm-hero-dot.active{background:#fff;opacity:1;transform:scale(1.1)}
        .wm-ghost-btn{padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer;backdrop-filter:blur(6px)}
        .wm-ghost-btn:hover{background:rgba(255,255,255,0.14)}
        .wm-slide-card:hover{transform:scale(1.03);box-shadow:0 28px 70px rgba(0,0,0,.55)}
      `}</style>

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
                <div style={containerStyle}>
                    {/* Hero */}
                    <section
                        style={{
                            position: "relative",
                            height: "75vh",
                            borderRadius: "20px",
                            overflow: "hidden",
                            marginBottom: "60px",
                            ...heroBgStyle,
                            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                        }}
                    >
                        {/* overlay */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                    "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%)",
                                zIndex: 1,
                            }}
                        />
                        {/* Sol */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "55%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                padding: "60px",
                                zIndex: 2,
                            }}
                        >
                            <div
                                style={{
                                    background: "rgba(0,0,0,0.1)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: "20px",
                                    padding: "40px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}
                            >
                                <h1
                                    style={{
                                        fontSize: "4rem",
                                        fontWeight: "bold",
                                        marginBottom: "20px",
                                        background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)",
                                        backgroundSize: "300% 300%",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        animation: "gradientShift 3s ease-in-out infinite",
                                        textShadow: "0 0 30px rgba(255,107,107,0.3)",
                                    }}
                                >
                                    WatchMatch
                                </h1>

                                <p
                                    style={{
                                        fontSize: "1.15rem",
                                        color: "rgba(255,255,255,0.9)",
                                        marginBottom: "24px",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Film Review &amp; Movie Database Application
                                </p>

                                <div style={{ display: "flex", gap: 12 }}>
                                    <button onClick={refreshUserVector} className="wm-ghost-btn">
                                        Vektörü Güncelle
                                    </button>
                                </div>

                                {/* Best match */}
                                <div style={{ marginTop: 18, maxWidth: 420 }}>
                                    <BestMatchCard userId={userId} sameCountryOnly={false} />
                                </div>
                            </div>
                        </div>

                        {/* Sağ – Slayt */}
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                width: "45%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "40px",
                                zIndex: 2,
                            }}
                        >
                            {heroMovies[currentSlide] && (
                                <div
                                    role="button"
                                    onClick={() => handleSlideClick(heroMovies[currentSlide])}
                                    title={`${getTitle(heroMovies[currentSlide])} • detay`}
                                    className="wm-slide-card"
                                    style={{
                                        width: "58%",
                                        minWidth: 260,
                                        aspectRatio: "2/3",
                                        borderRadius: 18,
                                        overflow: "hidden",
                                        position: "relative",
                                        cursor: "pointer",
                                        boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        background: "rgba(0,0,0,0.25)",
                                        transform: "translateZ(0)",
                                        transition: "transform .35s ease, box-shadow .35s ease",
                                    }}
                                >
                                    <img
                                        src={
                                            getHighQualityPoster(heroMovies[currentSlide]) ||
                                            thumbFrom(heroMovies[currentSlide])
                                        }
                                        alt={getTitle(heroMovies[currentSlide])}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />

                                    {/* bilgi overlay */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            padding: "16px 16px 14px",
                                            background:
                                                "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 35%, rgba(0,0,0,.85) 100%)",
                                            color: "#fff",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            {getVote(heroMovies[currentSlide]) !== null && (
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        padding: "4px 8px",
                                                        borderRadius: 999,
                                                        background: "rgba(255,255,255,.12)",
                                                        border: "1px solid rgba(255,255,255,.18)",
                                                        backdropFilter: "blur(6px)",
                                                    }}
                                                >
                          ★ {getVote(heroMovies[currentSlide])}
                        </span>
                                            )}
                                            {!!getYear(heroMovies[currentSlide]) && (
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        padding: "4px 8px",
                                                        borderRadius: 999,
                                                        background: "rgba(255,255,255,.12)",
                                                        border: "1px solid rgba(255,255,255,.18)",
                                                        backdropFilter: "blur(6px)",
                                                    }}
                                                >
                          {getYear(heroMovies[currentSlide])}
                        </span>
                                            )}
                                        </div>

                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: "1.15rem",
                                                fontWeight: 700,
                                                lineHeight: 1.25,
                                                textShadow: "0 2px 12px rgba(0,0,0,.7)",
                                            }}
                                        >
                                            {getTitle(heroMovies[currentSlide])}
                                        </h3>

                                        <div style={{ display: "flex", gap: 10 }}>
                                            <button
                                                className="wm-ghost-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSlideClick(heroMovies[currentSlide]);
                                                }}
                                            >
                                                Detayları Gör
                                            </button>
                                            <button
                                                className="wm-ghost-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLastClickedFilm(heroMovies[currentSlide]);
                                                }}
                                                title="Arkaplan yap"
                                            >
                                                Arkaplan Yap
                                            </button>
                                        </div>
                                    </div>

                                    {/* oklar */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentSlide((i) => (i === 0 ? heroMovies.length - 1 : i - 1));
                                        }}
                                        className="wm-ghost-btn"
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: -12,
                                            transform: "translateY(-50%)",
                                        }}
                                        aria-label="Önceki"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentSlide((i) => (i + 1) % heroMovies.length);
                                        }}
                                        className="wm-ghost-btn"
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            right: -12,
                                            transform: "translateY(-50%)",
                                        }}
                                        aria-label="Sonraki"
                                    >
                                        ›
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* dots */}
                        {heroMovies.length > 1 && (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 18,
                                    left: "55%",
                                    right: 40,
                                    display: "flex",
                                    gap: 6,
                                    justifyContent: "center",
                                    zIndex: 3,
                                }}
                            >
                                {heroMovies.map((m, idx) => (
                                    <div
                                        key={idx}
                                        className={`wm-hero-dot ${idx === currentSlide ? "active" : ""}`}
                                        onClick={() => setCurrentSlide(idx)}
                                        style={{ cursor: "pointer" }}
                                        title={getTitle(m)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                    {/* Eşleşmeler – kullanıcılar (hero’nun hemen altı) */}
                    <section id="matches" style={{ marginTop: 12 }}>
                        <div style={{ ...sectionHeaderStyle, marginBottom: 10 }}>
                            <h2 style={{ ...sectionTitleStyle, margin: 0 }}>Senin İçin Eşleşmeler</h2>
                        </div>

                        {/* Profesyonel görünüm: scrollbar gizle + sıkı boşluklar */}
                        <div className="wm-rail-polish">
                            <MatchUsersRail
                                userId={userId}
                                defaultLimit={20}
                                defaultSameCountry={true}
                                ref={matchRailRef}
                            />
                        </div>
                    </section>

                    {/* Backend Home Feed Bölümleri (kişisel) */}
                    {feedLoading ? (
                        <p
                            style={{
                                textAlign: "center",
                                padding: "60px 20px",
                                color: "rgba(255,255,255,0.6)",
                                fontSize: "1.05rem",
                            }}
                        >
                            ⏳ Sana özel içerikler yükleniyor...
                        </p>
                    ) : Array.isArray(homeFeed?.sections) && homeFeed.sections.length > 0 ? (
                        homeFeed.sections.map((sec) => (
                            <section key={sec.key || sec.title}>
                                <div style={sectionHeaderStyle}>
                                    <h2 style={sectionTitleStyle}>{sec.title}</h2>
                                </div>
                                <MovieGrid
                                    items={sec.items || []}
                                    userId={userId}
                                    onAddWishlist={(m) =>
                                        setWishlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                    }
                                    onAddWatched={(m) =>
                                        setWatchedlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                    }
                                    emptyText="Bu bölümde içerik bulunamadı"
                                    // ÖNEMLİ: onMovieClick YOK! Kartlar kendi modalını açsın.
                                />
                            </section>
                        ))
                    ) : null}

                    {/* TMDB Popüler (ek vitrin) */}
                    <section>
                        <div style={sectionHeaderStyle}>
                            <h2 style={sectionTitleStyle}>Popüler Filmler</h2>
                        </div>
                        <MovieGrid
                            items={tmdbPopular}
                            userId={userId}
                            onAddWishlist={(m) =>
                                setWishlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                            }
                            onAddWatched={(m) =>
                                setWatchedlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                            }
                            // onMovieClick YOK
                        />
                    </section>

                    {/* 4 ek vitrin: sayfa çabuk bitmesin */}
                    {tmdbExtra.map((sec) => (
                        <section key={sec.key}>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>{sec.title}</h2>
                            </div>
                            <MovieGrid
                                items={sec.items}
                                userId={userId}
                                onAddWishlist={(m) =>
                                    setWishlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                }
                                onAddWatched={(m) =>
                                    setWatchedlist((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]))
                                }
                            />
                        </section>
                    ))}
                </div>
            </main>

            {/* Movie Detail Modal — sadece HERO/ÖNERİ tıklamalarında */}
            <MovieDetailModal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                movie={detailMovie}
                fromTmdb={Boolean(detailMovie && (detailMovie.backdrop_path || detailMovie.poster_path))}
                userId={userId}
            />
        </div>
    );
}

export default App;
