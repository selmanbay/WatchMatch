// src/App.js - Final Production Version with Enhanced Design
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
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

/* ================= Enhanced Hero Poster Card ================= */
function HeroPosterCard({ movie, onClick, onSetBg }) {
    const ref = React.useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (0.5 - y) * 15;
        const rotateY = (x - 0.5) * 15;

        el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateZ(20px)`;
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        const el = ref.current;
        if (el) {
            el.style.transform =
                "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)";
        }
    }, []);

    return (
        <div
            ref={ref}
            role="button"
            tabIndex={0}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onClick?.(movie)}
            onKeyDown={(e) => e.key === "Enter" && onClick?.(movie)}
            className="hero-poster-card"
            title={`${getTitle(movie)} • Detayları Görüntüle`}
            style={{
                width: "65%",
                maxWidth: 420,
                aspectRatio: "2/3",
                borderRadius: 28,
                overflow: "hidden",
                position: "relative",
                cursor: "pointer",
                boxShadow: isHovered
                    ? "0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(255,255,255,0.1)"
                    : "0 32px 85px rgba(0,0,0,0.6)",
                border: `2px solid ${
                    isHovered ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)"
                }`,
                background: "rgba(0,0,0,0.3)",
                transform: "perspective(1200px)",
                transition:
                    "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                zIndex: 5,
            }}
        >
            <img
                src={getHighQualityPoster(movie) || thumbFrom(movie)}
                alt={getTitle(movie)}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                }}
                loading="lazy"
            />

            {/* Enhanced glossy effects */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `
            radial-gradient(120% 70% at 15% 5%, rgba(255,255,255,0.3), transparent 50%),
            radial-gradient(80% 50% at 85% 95%, rgba(255,255,255,0.15), transparent 40%)
          `,
                    pointerEvents: "none",
                    mixBlendMode: "overlay",
                    opacity: isHovered ? 1 : 0.7,
                    transition: "opacity 0.3s ease",
                }}
            />

            {/* Info overlay with enhanced styling */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "24px 20px 22px",
                    background: `
            linear-gradient(180deg, 
              rgba(0,0,0,0) 0%, 
              rgba(0,0,0,0.4) 20%, 
              rgba(0,0,0,0.75) 60%, 
              rgba(0,0,0,0.95) 100%
            )
          `,
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    zIndex: 6,
                    transform: isHovered ? "translateY(0)" : "translateY(8px)",
                    opacity: isHovered ? 1 : 0.9,
                    transition: "all 0.3s ease",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                    }}
                >
                    {getVote(movie) !== null && (
                        <span className="movie-badge movie-badge-rating">
              ⭐ {getVote(movie)}
            </span>
                    )}
                    {!!getYear(movie) && (
                        <span className="movie-badge movie-badge-year">
              {getYear(movie)}
            </span>
                    )}
                </div>

                <h3
                    style={{
                        margin: 0,
                        fontSize: "1.35rem",
                        fontWeight: 900,
                        lineHeight: 1.25,
                        textShadow: "0 3px 15px rgba(0,0,0,0.8)",
                        letterSpacing: "-0.02em",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {getTitle(movie)}
                </h3>

                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        transform: isHovered ? "translateY(0)" : "translateY(4px)",
                        opacity: isHovered ? 1 : 0.8,
                        transition: "all 0.3s ease 0.1s",
                    }}
                >
                </div>
            </div>
        </div>
    );
}

/* ================= Utility Functions ================= */
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
    const p =
        item?.posterUrl || item?.poster_path || item?.posterPath || item?.image;
    if (!p) return null;
    if (/^https?:\/\//i.test(p) || String(p).startsWith("data:")) return p;
    if (String(p).startsWith("/")) return `https://image.tmdb.org/t/p/w780${p}`;
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
        return `https://image.tmdb.org/t/p/original${backdropPath}`;
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

/* ================= Main App Component ================= */
function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState("home");
    const [isLoading, setIsLoading] = useState(true);
    const [appMounted, setAppMounted] = useState(false);

    // Feed states
    const [homeFeed, setHomeFeed] = useState({ sections: [] });
    const [feedLoading, setFeedLoading] = useState(false);

    // TMDB content
    const [tmdbPopular, setTmdbPopular] = useState([]);
    const [tmdbExtra, setTmdbExtra] = useState([]);
    const [tmdbLoading, setTmdbLoading] = useState(false);

    // Hero carousel
    const [heroMovies, setHeroMovies] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [lastClickedFilm, setLastClickedFilm] = useState(null);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
    const heroFromFeedRef = useRef(false);
    const autoPlayRef = useRef(null);

    // ---- Search states (runSearch'tan ÖNCE) ----
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    /* ================= Search Functionality ================= */
    const runSearch = useCallback(
        async (query) => {
            // Gölgeleme hatasını önlemek için farklı isim
            const qStr = (query ?? searchQuery ?? "").trim();
            if (!qStr) return;

            try {
                const recoRes = await fetch(
                    `${API}/api/reco/search?q=${encodeURIComponent(qStr)}`
                );
                if (recoRes.ok) {
                    const recoData = await recoRes.json();
                    const recoResults = Array.isArray(recoData) ? recoData : [];
                    if (recoResults.length > 0) {
                        setDetailMovie(recoResults[0]);
                        setDetailOpen(true);
                        return;
                    }
                }
            } catch (error) {
                console.warn("Recommendation search failed:", error);
            }

            const qs = encodeURIComponent(qStr);
            const searchCandidates = [
                `${API}/api/tmdb/search?query=${qs}`,
                `${API}/api/tmdb/search/movie?query=${qs}`,
                `${API}/api/tmdb/movie/search?query=${qs}`,
                `${API}/api/tmdb/search/multi?query=${qs}`,
            ];

            for (const url of searchCandidates) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) continue;
                    const data = await res.json();
                    const results = extractMovies(data);
                    if (Array.isArray(results) && results.length > 0) {
                        setDetailMovie(results[0]);
                        setDetailOpen(true);
                        return;
                    }
                } catch (error) {
                    console.warn(`Search failed for ${url}:`, error);
                }
            }

            console.log("No search results found for:", qStr);
        },
        [searchQuery]
    );

    // User lists
    const [wishlist, setWishlist] = useState([]);
    const [watchedlist, setWatchedlist] = useState([]);

    // Modal state
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailMovie, setDetailMovie] = useState(null);
    // refs ve userId
    const matchRailRef = useRef(null);
    const bootHandledRef = useRef(false);
    const userId = user?.id ?? user?.userId;

    /* ================= Boot Search from URL ================= */
    useEffect(() => {
        if (bootHandledRef.current || !user) return;
        bootHandledRef.current = true;

        try {
            const pending = localStorage.getItem("wm_pending_search_url");
            if (pending) {
                localStorage.removeItem("wm_pending_search_url");
                window.location.assign(pending);
                return;
            }
        } catch (error) {
            console.error("Pending search URL error:", error);
        }

        try {
            const url = new URL(window.location.href);
            let query = url.searchParams.get("q");
            if (!query) {
                const hash = url.hash || "";
                const qIndex = hash.indexOf("?");
                if (qIndex !== -1) {
                    const searchParams = new URLSearchParams(hash.slice(qIndex + 1));
                    query = searchParams.get("q");
                }
            }
            if (query && query.trim()) {
                setView("home");
                setSearchQuery(query);
                setTimeout(() => runSearch(query), 500);
            }
        } catch (error) {
            console.error("URL search parsing error:", error);
        }
    }, [user, runSearch]);

    /* ================= Memoized Values ================= */
    const bgCandidate = useMemo(
        () => heroMovies[currentSlide] || lastClickedFilm || tmdbPopular[0] || null,
        [heroMovies, currentSlide, lastClickedFilm, tmdbPopular]
    );

    const heroBackgroundImage = useMemo(
        () => (bgCandidate ? getBackdropImage(bgCandidate) : null),
        [bgCandidate]
    );

    const heroBgStyle = useMemo(
        () =>
            heroBackgroundImage
                ? {
                    backgroundImage:
                        "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.85) 100%), url(" +
                        heroBackgroundImage +
                        ")",
                    backgroundSize: "cover",
                    backgroundPosition: "center 25%",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed",
                    transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }
                : {
                    background:
                        "linear-gradient(135deg, #0d1421 0%, #1a2850 25%, #3d2b7b 60%, #2d1b4e 85%, #1a1a2e 100%)",
                    backgroundSize: "400% 400%",
                    animation: "gradientMove 25s ease infinite",
                },
        [heroBackgroundImage]
    );

    /* ================= Event Handlers ================= */
    const handleSlideChange = useCallback(
        (direction) => {
            if (!heroMovies.length) return;

            setCurrentSlide((prev) => {
                if (direction === "next") return (prev + 1) % heroMovies.length;
                return prev === 0 ? heroMovies.length - 1 : prev - 1;
            });

            setAutoPlayEnabled(false);
            clearTimeout(autoPlayRef.current);
            autoPlayRef.current = setTimeout(() => setAutoPlayEnabled(true), 8000);
        },
        [heroMovies.length]
    );

    const handleSlideClick = useCallback((movie) => {
        setDetailMovie(movie);
        setDetailOpen(true);
    }, []);

    const handleSetBackground = useCallback((movie) => {
        setLastClickedFilm(movie);
    }, []);

    /* ================= Auto-play Effect ================= */
    useEffect(() => {
        if (!heroMovies.length || !autoPlayEnabled) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [heroMovies.length, autoPlayEnabled]);

    /* ================= Data Normalization ================= */
    const normalizeSections = useCallback((raw) => {
        const list = Array.isArray(raw?.sections)
            ? raw.sections
            : Array.isArray(raw)
                ? raw
                : [];
        return list
            .map((s, idx) => {
                const items = Array.isArray(s?.items) ? s.items : extractMovies(s);
                const title =
                    s?.title ||
                    s?.name ||
                    (s?.key
                        ? s.key.replaceAll("_", " ").toUpperCase()
                        : `Bölüm ${idx + 1}`);
                const key = s?.key || `sec_${idx}`;
                return { key, title, items: Array.isArray(items) ? items : [] };
            })
            .filter((s) => s.items.length > 0);
    }, []);

    /* ================= API Calls ================= */
    const loadHomeFeed = useCallback(
        async (uid) => {
            if (!uid) return;

            setFeedLoading(true);
            try {
                const res = await fetch(`${API}/api/reco/home?userId=${uid}&perSection=24&_=${Date.now()}`, {
                        headers: { accept: "*/*" },
                    }
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                const sections = normalizeSections(data);
                setHomeFeed({ sections });

                const heroSection =
                    sections.find((s) => s.key?.includes("for_you")) ||
                    sections.find((s) => s.key?.includes("from_wishlist")) ||
                    sections.find((s) => s.key?.includes("popular")) ||
                    sections.find((s) => s.key?.includes("new_releases")) ||
                    sections[0];

                if (heroSection?.items?.length && !heroFromFeedRef.current) {
                    setHeroMovies(heroSection.items.slice(0, 15));
                    setCurrentSlide(0);
                    heroFromFeedRef.current = true;
                }
            } catch (error) {
                console.error("Home feed error:", error);
                setHomeFeed({ sections: [] });
            } finally {
                setFeedLoading(false);
            }
        },
        [normalizeSections]
    );

    const fetchFlexible = useCallback(async (candidates) => {
        for (const url of candidates) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    const movies = extractMovies(data);
                    if (Array.isArray(movies) && movies.length) return movies;
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${url}:`, error);
            }
        }
        return [];
    }, []);

    const loadTmdbContent = useCallback(async () => {
        setTmdbLoading(true);
        try {
            const popular = await fetchFlexible([
                `${API}/api/tmdb/top_rated`,
                `${API}/api/tmdb/movie/top_rated`,
            ]);
            setTmdbPopular(popular);

            const extraSections = [
                {
                    key: "top_rated",
                    title: "🏆 En Yüksek Puanlılar",
                    urls: [`${API}/api/tmdb/top_rated`, `${API}/api/tmdb/movie/top_rated`],
                },
                {
                    key: "now_playing",
                    title: "🎬 Vizyondakiler",
                    urls: [`${API}/api/tmdb/now_playing`, `${API}/api/tmdb/movie/now_playing`],
                },
                {
                    key: "upcoming",
                    title: "🔮 Yakında",
                    urls: [`${API}/api/tmdb/upcoming`, `${API}/api/tmdb/movie/upcoming`],
                },
                {
                    key: "trending",
                    title: "🔥 Gündemde",
                    urls: [`${API}/api/tmdb/trending`, `${API}/api/tmdb/trending/movie`],
                },
            ];

            const extras = [];
            for (const section of extraSections) {
                const movies = await fetchFlexible(section.urls);
                if (movies.length) {
                    extras.push({ ...section, items: movies });
                }
            }
            setTmdbExtra(extras);

            if (!heroFromFeedRef.current && !heroMovies.length && popular.length) {
                setHeroMovies(popular.slice(0, 12));
            }
        } finally {
            setTmdbLoading(false);
        }
    }, [fetchFlexible, heroMovies.length]);

    const handleSearch = useCallback(
        (queryFromHeader) => {
            const query = (queryFromHeader ?? searchQuery ?? "").trim();
            if (!query) return;

            const inProfile =
                view === "profile" || window.location.hash === "#profile";
            if (inProfile) {
                setView("home");
                try {
                    window.history.replaceState(
                        { view: "home" },
                        "",
                        window.location.pathname + window.location.search
                    );
                } catch (error) {
                    console.error("History state error:", error);
                }
                setTimeout(() => {
                    runSearch(query);
                    setSearchQuery("");
                }, 100);
                return;
            }

            runSearch(query);
            setSearchQuery("");
        },
        [view, searchQuery, runSearch]
    );

    const handlePickSuggestion = useCallback(
        async (suggestion) => {
            if (!suggestion) return;

            const inProfile =
                view === "profile" || window.location.hash === "#profile";
            if (inProfile) {
                setView("home");
                try {
                    window.history.replaceState(
                        { view: "home" },
                        "",
                        window.location.pathname + window.location.search
                    );
                } catch (error) {
                    console.error("History state error:", error);
                }
                setTimeout(() => {
                    setDetailMovie(suggestion.raw || suggestion);
                    setDetailOpen(true);
                }, 100);
                return;
            }

            setDetailMovie(suggestion.raw || suggestion);
            setDetailOpen(true);
        },
        [view]
    );

    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) {
            setSuggestions([]);
            setSuggestionsLoading(false);
            return;
        }

        setSuggestionsLoading(true);
        const abortController = new AbortController();
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${API}/api/tmdb/search?query=${encodeURIComponent(q)}`,
                    { signal: abortController.signal }
                );

                if (response.ok) {
                    const data = await response.json();
                    const movies = extractMovies(data)
                        .slice(0, 10)
                        .map((movie) => ({
                            id: movie.id,
                            title: getTitle(movie),
                            year: getYear(movie),
                            poster: thumbFrom(movie),
                            source: "tmdb",
                            kind: "movie",
                            raw: movie,
                        }));
                    setSuggestions(movies);
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    setSuggestions([]);
                }
            } finally {
                setSuggestionsLoading(false);
            }
        }, 300);

        return () => {
            abortController.abort();
            clearTimeout(timeoutId);
        };
    }, [searchQuery]);

    /* ================= Initialization Effects ================= */
    useEffect(() => {
        const initializeApp = async () => {
            try {
                const userData = localStorage.getItem("wm_user");
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setView("home");
                }
            } catch (error) {
                console.error("Failed to load user data:", error);
            } finally {
                setIsLoading(false);
                // App mount animasyonu için
                setTimeout(() => setAppMounted(true), 100);
            }
        };

        initializeApp();
    }, []);

    useEffect(() => {
        function handleListChanged() {
            const uid = user?.id ?? user?.userId;
            if (!uid) return;
            // İsteğe bağlı: kullanıcı vektörünü de tazelemek istersen:
            // fetch(`${API}/api/match/refresh/${uid}`, { method: "POST" }).catch(()=>{});
            loadHomeFeed(uid);
        }
        window.addEventListener("wm:list-changed", handleListChanged);
        return () => window.removeEventListener("wm:list-changed", handleListChanged);
    }, [user, loadHomeFeed]);


    useEffect(() => {
        if (user === null || isLoading) return;

        const loadData = async () => {
            const uid = user?.id ?? user?.userId;
            await Promise.all([
                uid ? loadHomeFeed(uid) : Promise.resolve(),
                loadTmdbContent(),
            ]);
        };

        loadData();
    }, [user, isLoading, loadHomeFeed, loadTmdbContent]);

    /* ================= Auth Gates ================= */
    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-container">
                    <div className="loading-logo">
                        <div className="logo-icon">🎬</div>
                        <div className="loading-particles">
                            <div className="particle"></div>
                            <div className="particle"></div>
                            <div className="particle"></div>
                            <div className="particle"></div>
                            <div className="particle"></div>
                        </div>
                    </div>
                    <h2 className="loading-title">WatchMatch</h2>
                    <p className="loading-subtitle">Yapay zeka destekli film deneyimi hazırlanıyor...</p>
                    <div className="loading-progress">
                        <div className="progress-bar"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (user === null) {
        return (
            <AuthForm
                onSuccess={(userData) => {
                    try {
                        localStorage.setItem("wm_user", JSON.stringify(userData));
                    } catch (error) {
                        console.error("Failed to save user data:", error);
                    }
                    setUser(userData);
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
                    onLogout={() => {
                        try {
                            localStorage.removeItem("wm_user");
                        } catch (error) {
                            console.error("Failed to clear user data:", error);
                        }
                        setUser(null);
                        setView("home");
                    }}
                    onProfile={() => setView("profile")}
                    onHome={() => setView("home")}
                    suggestions={suggestions}
                    suggestionsLoading={suggestionsLoading}
                    onPickSuggestion={handlePickSuggestion}
                />
                <ProfilePage
                    user={user}
                    userId={userId}
                    wishlist={wishlist}
                    watchedlist={watchedlist}
                    onBack={() => setView("home")}
                    onAddWishlist={(movie) =>
                        setWishlist((prev) =>
                            prev.some((x) => x.id === movie.id) ? prev : [...prev, movie]
                        )
                    }
                    onAddWatched={(movie) =>
                        setWatchedlist((prev) =>
                            prev.some((x) => x.id === movie.id) ? prev : [...prev, movie]
                        )
                    }
                />
            </>
        );
    }

    /* ================= Main Render ================= */
    return (
        <div className={`app-container ${appMounted ? 'app-mounted' : ''}`}>
            {/* Enhanced CSS */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes gradientShift {
          0% { filter: hue-rotate(0deg) saturate(1); }
          25% { filter: hue-rotate(90deg) saturate(1.2); }
          50% { filter: hue-rotate(180deg) saturate(1); }
          75% { filter: hue-rotate(270deg) saturate(1.2); }
          100% { filter: hue-rotate(360deg) saturate(1); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes floatingParticles {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }

        @keyframes progressLoad {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0d1421 0%, #1a2850 25%, #3d2b7b 60%, #2d1b4e 85%, #1a1a2e 100%);
          color: white;
          overflow-x: hidden;
          opacity: 0;
          transition: opacity 0.8s ease-out;
        }

        .app-container.app-mounted {
          opacity: 1;
        }
        
        .loading-screen {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #0d1421 0%, #1a2850 25%, #3d2b7b 60%, #2d1b4e 85%, #1a1a2e 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .loading-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%);
          animation: gradientMove 20s ease infinite;
        }

        .loading-container {
          text-align: center;
          z-index: 2;
          position: relative;
        }

        .loading-logo {
          position: relative;
          margin-bottom: 32px;
        }

        .logo-icon {
          font-size: 4rem;
          margin-bottom: 24px;
          animation: pulse 2s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(78, 205, 196, 0.5));
        }

        .loading-particles {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #4ecdc4, #ff6b6b);
          border-radius: 50%;
          animation: floatingParticles 3s ease-in-out infinite;
        }

        .particle:nth-child(1) { top: 0; left: 50%; animation-delay: 0s; }
        .particle:nth-child(2) { top: 50%; right: 0; animation-delay: 0.6s; }
        .particle:nth-child(3) { bottom: 0; left: 50%; animation-delay: 1.2s; }
        .particle:nth-child(4) { top: 50%; left: 0; animation-delay: 1.8s; }
        .particle:nth-child(5) { top: 25%; right: 25%; animation-delay: 2.4s; }

        .loading-title {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #4ecdc4 0%, #ff6b6b 50%, #45b7d1 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease-in-out infinite;
          letter-spacing: -0.02em;
        }

        .loading-subtitle {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.7);
          margin-bottom: 32px;
          font-weight: 400;
          animation: fadeInScale 1s ease-out 0.5s both;
        }

        .loading-progress {
          width: 240px;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          animation: fadeInScale 1s ease-out 1s both;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4ecdc4, #ff6b6b, #45b7d1);
          background-size: 200% 100%;
          border-radius: 2px;
          animation: progressLoad 2s ease-out, gradientMove 2s linear infinite;
        }
        
        .hero-poster-card {
          transform-style: preserve-3d;
          will-change: transform;
        }
        
        .movie-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.2s ease;
        }
        
        .movie-badge-rating {
          background: rgba(255, 215, 0, 0.2);
          color: #ffd700;
          border-color: rgba(255, 215, 0, 0.3);
        }
        
        .movie-badge-year {
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.9);
        }
        
        .hero-action-btn {
          padding: 12px 18px;
          border-radius: 16px;
          border: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }
        
        .hero-action-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        
        .hero-action-btn:hover::before {
          transform: translateX(100%);
        }
        
        .hero-action-btn.primary {
          background: rgba(78, 205, 196, 0.2);
          color: #4ecdc4;
          border: 1px solid rgba(78, 205, 196, 0.4);
        }
        
        .hero-action-btn.primary:hover {
          background: rgba(78, 205, 196, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
        }
        
        .hero-action-btn.secondary {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.9);
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .hero-action-btn.secondary:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255,255,255,0.15);
        }
        
        .hero-nav-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(20px);
          color: white;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-nav-btn:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255,255,255,0.2);
        }
        
        .hero-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          padding: 16px;
        }
        
        .hero-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.6);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        
        .hero-dot.active {
          background: white;
          border-color: white;
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(255,255,255,0.5);
        }
        
        .hero-dot:not(.active):hover {
          border-color: rgba(255,255,255,0.8);
          transform: scale(1.1);
        }
        
        .hero-title {
          font-size: 4.5rem;
          font-weight: 900;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 30%, #45b7d1 60%, #96ceb4 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 8s ease-in-out infinite;
          letter-spacing: -0.02em;
          line-height: 0.9;
          text-shadow: 0 0 40px rgba(255,255,255,0.1);
        }
        
        .hero-glass-panel {
          background: rgba(0,0,0,0.25);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 48px 52px;
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 
            0 32px 80px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.1);
          animation: slideUp 0.8s ease-out;
        }
        
        .section-fade-in {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .section-fade-in:nth-child(1) { animation-delay: 0.1s; }
        .section-fade-in:nth-child(2) { animation-delay: 0.2s; }
        .section-fade-in:nth-child(3) { animation-delay: 0.3s; }
        .section-fade-in:nth-child(4) { animation-delay: 0.4s; }
        
        .enhanced-section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
          padding: 0 4px;
        }
        
        .enhanced-section-title {
          font-size: 2rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #ffffff 0%, #e0e6ed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.01em;
          position: relative;
        }

        .enhanced-section-title::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #4ecdc4, #ff6b6b);
          transition: width 0.3s ease;
        }

        .enhanced-section-header:hover .enhanced-section-title::after {
          width: 100%;
        }
        
        .section-divider {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          border-radius: 1px;
        }
        
        @media (max-width: 768px) {
          .hero-title { font-size: 3rem; }
          .hero-glass-panel { padding: 32px 24px; }
          .hero-poster-card { width: 80%; }
          .enhanced-section-title { font-size: 1.5rem; }
          .loading-title { font-size: 2rem; }
        }
        
        @media (max-width: 480px) {
          .hero-title { font-size: 2.5rem; }
          .hero-glass-panel { padding: 24px 20px; }
          .loading-title { font-size: 1.5rem; }
        }
      `}</style>

            <Header
                user={user}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onLogout={() => {
                    try {
                        localStorage.removeItem("wm_user");
                    } catch (error) {
                        console.error("Failed to clear user data:", error);
                    }
                    setUser(null);
                    setView("home");
                }}
                onProfile={() => setView("profile")}
                onHome={() => setView("home")}
                suggestions={suggestions}
                suggestionsLoading={suggestionsLoading}
                onPickSuggestion={handlePickSuggestion}
            />

            <main style={mainContentStyle}>
                <div style={containerStyle}>
                    {/* Enhanced Hero Section */}
                    <section
                        style={{
                            position: "relative",
                            height: "75vh",
                            minHeight: "600px",
                            borderRadius: "28px",
                            overflow: "hidden",
                            marginBottom: "72px",
                            ...heroBgStyle,
                            boxShadow:
                                "0 32px 80px rgba(0,0,0,0.4), 0 0 100px rgba(0,0,0,0.2)",
                        }}
                    >
                        {/* Enhanced ambient effects */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                pointerEvents: "none",
                                background:
                                    "radial-gradient(70% 50% at 25% 15%, rgba(78,205,196,0.15), transparent 60%), radial-gradient(60% 40% at 75% 85%, rgba(255,107,107,0.12), transparent 50%), radial-gradient(80% 60% at 50% 50%, rgba(69,183,209,0.08), transparent 70%)",
                                zIndex: 0,
                            }}
                        />

                        {/* Dynamic overlay */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                    "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.85) 100%)",
                                zIndex: 1,
                            }}
                        />

                        {/* Left content panel */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "58%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                padding: "64px",
                                zIndex: 2,
                            }}
                        >
                            <div className="hero-glass-panel">
                                <h1 className="hero-title">WatchMatch</h1>

                                <p
                                    style={{
                                        fontSize: "1.2rem",
                                        color: "rgba(255,255,255,0.95)",
                                        marginBottom: "32px",
                                        lineHeight: 1.6,
                                        fontWeight: 400,
                                    }}
                                >
                                    Yapay zeka destekli film öneri ve eşleştirme platformu
                                </p>

                                <div style={{ display: "flex", gap: 16, marginBottom: "32px" }}>
                                    <button
                                        onClick={() => {
                                            if (userId) {
                                                fetch(`${API}/api/match/refresh/${userId}`, {
                                                    method: "POST",
                                                })
                                                    .then((res) => {
                                                        if (res.ok) {
                                                            matchRailRef.current?.refresh?.();
                                                            loadHomeFeed(userId);
                                                        }
                                                    })
                                                    .catch(console.warn);
                                            }
                                        }}
                                        className="hero-action-btn primary"
                                    >
                                        <span>🚀</span>
                                        Profili Yenile
                                    </button>
                                </div>

                                <div style={{ maxWidth: "480px" }}>
                                    <BestMatchCard userId={userId} sameCountryOnly={false} />
                                </div>
                            </div>
                        </div>

                        {/* Right poster showcase */}
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                width: "42%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "48px",
                                zIndex: 4,
                            }}
                        >
                            {heroMovies[currentSlide] && (
                                <HeroPosterCard
                                    movie={heroMovies[currentSlide]}
                                    onClick={handleSlideClick}
                                    onSetBg={handleSetBackground}
                                />
                            )}
                        </div>

                        {/* Navigation arrows */}
                        {heroMovies.length > 1 && (
                            <>
                                <button
                                    onClick={() => handleSlideChange("prev")}
                                    className="hero-nav-btn"
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "16px",
                                        transform: "translateY(-50%)",
                                        zIndex: 7,
                                    }}
                                    aria-label="Önceki film"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={() => handleSlideChange("next")}
                                    className="hero-nav-btn"
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        right: "16px",
                                        transform: "translateY(-50%)",
                                        zIndex: 7,
                                    }}
                                    aria-label="Sonraki film"
                                >
                                    ›
                                </button>
                            </>
                        )}

                        {/* Enhanced dots indicator */}
                        {heroMovies.length > 1 && (
                            <div
                                className="hero-dots"
                                style={{
                                    position: "absolute",
                                    bottom: "24px",
                                    left: "58%",
                                    right: "48px",
                                    zIndex: 3,
                                }}
                            >
                                {heroMovies.slice(0, 8).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`hero-dot ${
                                            idx === currentSlide ? "active" : ""
                                        }`}
                                        onClick={() => setCurrentSlide(idx)}
                                        title={getTitle(heroMovies[idx])}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* User Matches Section */}
                    <section className="section-fade-in" style={{ marginBottom: "64px" }}>
                        <div className="enhanced-section-header">
                            <h2 className="enhanced-section-title">Senin İçin Eşleşmeler</h2>
                            <div className="section-divider"></div>
                        </div>
                        <MatchUsersRail
                            userId={userId}
                            defaultLimit={24}
                            defaultSameCountry={true}
                            ref={matchRailRef}
                        />
                    </section>

                    {/* Personal Feed Sections */}
                    {feedLoading ? (
                        <div style={{
                            textAlign: "center",
                            padding: "80px 24px",
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: "24px",
                            border: "1px solid rgba(255,255,255,0.05)",
                            backdropFilter: "blur(10px)"
                        }}>
                            <div className="loading-container">
                                <div className="loading-logo">
                                    <div className="logo-icon">🎬</div>
                                </div>
                                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.1rem", margin: 0 }}>
                                    Kişiselleştirilmiş içerikleriniz hazırlanıyor...
                                </p>
                            </div>
                        </div>
                    ) : (
                        homeFeed.sections.map((section, index) => (
                            <section
                                key={section.key}
                                className="section-fade-in"
                                style={{ marginBottom: "64px", animationDelay: `${0.1 + index * 0.1}s` }}
                            >
                                <div className="enhanced-section-header">
                                    <h2 className="enhanced-section-title">{section.title}</h2>
                                    <div className="section-divider"></div>
                                </div>

                                <MovieGrid
                                    items={section.items || []}
                                    userId={userId}
                                    onAddWishlist={(movie) => {
                                        setWishlist((prev) =>
                                            prev.some((x) => x.id === movie.id) ? prev : [...prev, movie]
                                        );
                                        if (userId) loadHomeFeed(userId);
                                    }}
                                    onAddWatched={(movie) => {
                                        setWatchedlist((prev) =>
                                            prev.some((x) => x.id === movie.id) ? prev : [...prev, movie]
                                        );
                                        if (userId) loadHomeFeed(userId);
                                    }}
                                />
                            </section>
                        ))
                    )}

                    {/* TMDB Popular Section */}
                    <section className="section-fade-in" style={{ marginBottom: "64px" }}>
                        <div className="enhanced-section-header">
                            <h2 className="enhanced-section-title">Popüler Filmler</h2>
                            <div className="section-divider"></div>
                        </div>

                        <MovieGrid
                            items={tmdbPopular}
                            userId={userId}
                            onAddWishlist={(movie) => {
                                setWishlist((prev) =>
                                    prev.some((x) => x.id === movie.id) ? prev : [...prev, movie]
                                );
                                if (userId) loadHomeFeed(userId);
                            }}
                            onAddWatched={(movie) => {
                                setWatchedlist((prev) =>
                                    prev.some((x) => x.id === movie.id) ? prev : [...prev, movie]
                                );
                                if (userId) loadHomeFeed(userId);
                            }}
                        />
                    </section>

                    {/* Additional TMDB Sections */}
                    {tmdbExtra.map((section, index) => (
                        <section
                            key={section.key}
                            className="section-fade-in"
                            style={{ marginBottom: "64px", animationDelay: `${0.3 + index * 0.1}s` }}
                        >
                            <div className="enhanced-section-header">
                                <h2 className="enhanced-section-title">{section.title}</h2>
                                <div className="section-divider"></div>
                            </div>

                            <MovieGrid
                                items={section.items}
                                userId={userId}
                                onAddWishlist={(movie) => {
                                    setWishlist((prev) =>
                                        prev.some((x) => x.id === movie.id) ? prev : [...prev, movie]
                                    );
                                    if (userId) loadHomeFeed(userId);
                                }}
                                onAddWatched={(movie) => {
                                    setWatchedlist((prev) =>
                                        prev.some((x) => x.id === movie.id) ? prev : [...prev, movie]
                                    );
                                    if (userId) loadHomeFeed(userId);
                                }}
                            />
                        </section>
                    ))}

                </div>
            </main>

            {/* Enhanced Movie Detail Modal */}
            <MovieDetailModal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                movie={detailMovie}
                fromTmdb={Boolean(
                    detailMovie?.backdrop_path || detailMovie?.poster_path
                )}
                userId={userId}
            />
        </div>
    );
}

export default App;