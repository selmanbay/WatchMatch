// src/App.js
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import AuthForm from "./components/AuthForm";
import MovieGrid from "./components/MovieGrid";
import ProfilePage from "./pages/ProfilePage";
import {
    mainContentStyle, containerStyle, sectionHeaderStyle, sectionTitleStyle,
    formStyle, formRowStyle, formInputStyle, btnStyle
} from "./styles/ui";

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

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState("home"); // "home" | "profile"

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMovie, setNewMovie] = useState({
        title: "", genre: "", releaseYear: "", rating: "", description: "", posterUrl: ""
    });

    const [wishlist, setWishlist] = useState([]);
    const [watchedlist, setWatchedlist] = useState([]);

    const [tmdbMovies, setTmdbMovies] = useState([]);
    const [tmdbLoading, setTmdbLoading] = useState(false);

    // --- Arama state ---
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // --- Öneri dropdown state ---
    const [suggestions, setSuggestions] = useState([]); // [{id,title,year,poster,source,raw}]
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

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
            .then((data) => { setMovies(data); setLoading(false); })
            .catch(() => { setLoading(false); alert("❌ Filmler alınamadı!"); });

        setTmdbLoading(true);
        fetch("http://localhost:8080/api/tmdb/popular")
            .then((res) => res.json())
            .then((data) => { setTmdbMovies(data.results || []); setTmdbLoading(false); })
            .catch(() => { setTmdbLoading(false); alert("❌ TMDB filmleri alınamadı!"); });
    }, [user]);

    // Öneriler: yazdıkça hem local hem TMDB (debounce + abort)
    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) {
            setSuggestions([]);
            setSuggestionsLoading(false);
            // input temizlenmişse arama modundan çık
            setIsSearching(false);
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSuggestionsLoading(true);

        // Local eşleşmeler (ilk 5)
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
                raw: m
            }));

        const ac = new AbortController();
        const t = setTimeout(async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/api/tmdb/search?query=${encodeURIComponent(q)}`,
                    { signal: ac.signal }
                );
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                const tmdb = (data?.results || []).slice(0, 7).map((r) => ({
                    id: r.id,
                    title: r.title || r.name || "Film",
                    year: (r.release_date || r.first_air_date || "").slice(0, 4),
                    poster: thumbFrom(r),
                    source: "tmdb",
                    raw: r
                }));
                setSuggestions([...local, ...tmdb].slice(0, 10));
            } catch {
                setSuggestions(local);
            } finally {
                setSuggestionsLoading(false);
            }
        }, 300);

        return () => { ac.abort(); clearTimeout(t); };
    }, [searchQuery, movies]);

    // Aramayı çalıştır
    const runSearch = async (q) => {
        const query = (q ?? searchQuery ?? "").trim();
        if (!query) return;
        setIsSearching(true);
        setSearchLoading(true);
        try {
            const res = await fetch(
                `http://localhost:8080/api/tmdb/search?query=${encodeURIComponent(query)}`
            );
            const data = await res.json();
            setSearchResults(data.results || []);
        } catch {
            alert("❌ Arama başarısız oldu!");
        } finally {
            setSearchLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSearch = () => runSearch(searchQuery);

    const handlePickSuggestion = async (sugg) => {
        setSearchQuery(sugg.title || "");
        await runSearch(sugg.title || "");
    };

    // Film ekleme
    const handleAddMovie = (e) => {
        e.preventDefault();
        fetch("http://localhost:8080/api/movies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMovie)
        })
            .then((res) => res.json())
            .then((data) => {
                setMovies([...movies, data]);
                setNewMovie({ title: "", genre: "", releaseYear: "", rating: "", description: "", posterUrl: "" });
            })
            .catch(() => alert("❌ Film eklenemedi!"));
    };

    // Listeler (UI)
    const addToWishlist = (movie) => {
        if (!wishlist.some((m) => m.id === movie.id)) setWishlist([...wishlist, movie]);
    };
    const addToWatchedlist = (movie) => {
        if (!watchedlist.some((m) => m.id === movie.id)) setWatchedlist([...watchedlist, movie]);
    };

    // Çıkış
    const handleLogout = () => {
        try { localStorage.removeItem("wm_user"); } catch {}
        setUser(null);
        setView("home");
        setIsSearching(false);
        setSearchResults([]);
        setSearchQuery("");
    };

    // Login/Register
    if (user === null) {
        return (
            <AuthForm
                onSuccess={(u) => {
                    try { localStorage.setItem("wm_user", JSON.stringify(u)); } catch {}
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
                    onProfile={() => setView("profile")}
                    onHome={() => { setIsSearching(false); setSearchResults([]); setSearchQuery(""); setView("home"); }}
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
                    onAddWishlist={(m) => addToWishlist(m)}
                    onAddWatched={(m) => addToWatchedlist(m)}
                />
            </>
        );
    }

    // Ana sayfa + Arama modu
    return (
        <div>
            <Header
                user={user}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onLogout={handleLogout}
                onProfile={() => setView("profile")}
                onHome={() => { setIsSearching(false); setSearchResults([]); setSearchQuery(""); setView("home"); }}
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
                            <p style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.6)", fontSize: "1.1rem" }}>
                                ⏳ Aranıyor...
                            </p>
                        ) : (
                            <MovieGrid
                                items={searchResults}
                                fromTmdb
                                onAddWishlist={addToWishlist}
                                onAddWatched={addToWatchedlist}
                                userId={userId}
                                emptyText="Sonuç bulunamadı"
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
                                background:
                                    "linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), linear-gradient(135deg, #1a2332, #0f1419)"
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
                                        backgroundClip: "text"
                                    }}
                                >
                                    WatchMatch
                                </h1>
                                <p
                                    style={{
                                        fontSize: "1.2rem",
                                        color: "rgba(255, 255, 255, 0.8)",
                                        marginBottom: "30px",
                                        lineHeight: "1.6"
                                    }}
                                >
                                    Film Review & Movie Database Application
                                </p>
                            </div>
                        </section>

                        {/* TMDB Popüler */}
                        <section>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>🌍 TMDB Popüler Filmler</h2>
                            </div>
                            {tmdbLoading ? (
                                <p style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255, 255, 255, 0.6)", fontSize: "1.1rem" }}>
                                    ⏳ Yükleniyor...
                                </p>
                            ) : (
                                <MovieGrid
                                    items={tmdbMovies}
                                    fromTmdb
                                    onAddWishlist={addToWishlist}
                                    onAddWatched={addToWatchedlist}
                                    userId={userId}
                                />
                            )}
                        </section>

                        {/* DB Filmleri */}
                        <section>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>🎥 Film Listesi</h2>
                            </div>
                            {loading ? (
                                <p style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.6)", fontSize: "1.1rem" }}>
                                    ⏳ Yükleniyor...
                                </p>
                            ) : (
                                <MovieGrid
                                    items={movies}
                                    emptyText="Hiç film bulunamadı"
                                    onAddWishlist={addToWishlist}
                                    onAddWatched={addToWatchedlist}
                                    userId={userId}
                                />
                            )}
                        </section>

                        {/* İstek Listesi */}
                        <section>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>💡 İstek Listem</h2>
                            </div>
                            <MovieGrid
                                items={wishlist}
                                emptyText="Liste boş"
                                onAddWishlist={() => {}}
                                onAddWatched={() => {}}
                                userId={userId}
                            />
                        </section>

                        {/* İzlediklerim */}
                        <section>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>✅ İzlediklerim</h2>
                            </div>
                            <MovieGrid
                                items={watchedlist}
                                emptyText="Liste boş"
                                onAddWishlist={() => {}}
                                onAddWatched={() => {}}
                                userId={userId}
                            />
                        </section>

                        {/* Film Ekleme (debug) */}
                        <section style={formStyle}>
                            <h2 style={sectionTitleStyle}>➕ Yeni Film Ekle</h2>
                            <div>
                                <div style={formRowStyle}>
                                    <input
                                        type="text"
                                        placeholder="Başlık"
                                        value={newMovie.title}
                                        onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                                        style={formInputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tür"
                                        value={newMovie.genre}
                                        onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                                        style={formInputStyle}
                                    />
                                </div>
                                <div style={formRowStyle}>
                                    <input
                                        type="number"
                                        placeholder="Yıl"
                                        value={newMovie.releaseYear}
                                        onChange={(e) => setNewMovie({ ...newMovie, releaseYear: e.target.value })}
                                        style={formInputStyle}
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="Puan"
                                        value={newMovie.rating}
                                        onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                                        style={formInputStyle}
                                    />
                                </div>
                                <div style={{ ...formRowStyle, gridTemplateColumns: "1fr" }}>
                                    <input
                                        type="text"
                                        placeholder="Poster URL"
                                        value={newMovie.posterUrl}
                                        onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                                        style={formInputStyle}
                                    />
                                </div>
                                <div style={{ ...formRowStyle, gridTemplateColumns: "1fr" }}>
                  <textarea
                      placeholder="Açıklama"
                      value={newMovie.description}
                      onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                      rows="3"
                      style={{ ...formInputStyle, resize: "vertical" }}
                  />
                                </div>
                                <button onClick={handleAddMovie} style={btnStyle}>Ekle</button>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
