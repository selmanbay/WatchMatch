import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import AuthForm from "./components/AuthForm";
import MovieGrid from "./components/MovieGrid";
import {
    mainContentStyle, containerStyle, sectionHeaderStyle, sectionTitleStyle,
    formStyle, formRowStyle, formInputStyle, btnStyle
} from "./styles/ui";

function App() {
    const [user, setUser] = useState(null);

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMovie, setNewMovie] = useState({
        title: "", genre: "", releaseYear: "", rating: "", description: "", posterUrl: ""
    });

    const [wishlist, setWishlist] = useState([]);
    const [watchedlist, setWatchedlist] = useState([]);

    const [tmdbMovies, setTmdbMovies] = useState([]);
    const [tmdbLoading, setTmdbLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

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

    // Arama
    const handleSearch = () => {
        if (searchQuery.trim() === "") return;
        fetch(`http://localhost:8080/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`)
            .then((res) => res.json())
            .then((data) => setSearchResults(data.results || []))
            .catch(() => alert("❌ Arama başarısız oldu!"));
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

    // Listeler
    const addToWishlist = (movie) => {
        if (!wishlist.some((m) => m.id === movie.id)) setWishlist([...wishlist, movie]);
    };
    const addToWatchedlist = (movie) => {
        if (!watchedlist.some((m) => m.id === movie.id)) setWatchedlist([...watchedlist, movie]);
    };

    // Login/Register ekranı
    if (user === null) {
        return <AuthForm onSuccess={setUser} />;
    }

    return (
        <div>
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onLogout={() => setUser(null)}
            />

            <main style={mainContentStyle}>
                {searchResults.length > 0 && (
                    <section>
                        <div style={sectionHeaderStyle}>
                            <h2 style={sectionTitleStyle}>🔍 Arama Sonuçları</h2>
                        </div>
                        <MovieGrid
                            items={searchResults}
                            fromTmdb
                            onAddWishlist={addToWishlist}
                            onAddWatched={addToWatchedlist}
                        />
                    </section>
                )}

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
                                    marginBottom: "30px)",
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
                            />
                        )}
                    </section>

                    {/* DB Filmleri */}
                    <section>
                        <div style={sectionHeaderStyle}>
                            <h2 style={sectionTitleStyle}>🎥 Film Listesi</h2>
                        </div>
                        {loading ? (
                            <p style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255, 255, 255, 0.6)", fontSize: "1.1rem" }}>
                                ⏳ Yükleniyor...
                            </p>
                        ) : (
                            <MovieGrid
                                items={movies}
                                emptyText="Hiç film bulunamadı"
                                onAddWishlist={addToWishlist}
                                onAddWatched={addToWatchedlist}
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
            </main>
        </div>
    );
}

export default App;
