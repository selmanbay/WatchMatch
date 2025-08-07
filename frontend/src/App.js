import React, { useEffect, useState } from "react";

function App() {
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState("login");
    const [credentials, setCredentials] = useState({ username: "", email: "", password: "" });

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMovie, setNewMovie] = useState({
        title: "",
        genre: "",
        releaseYear: "",
        rating: "",
        description: "",
        posterUrl: ""
    });

    const [wishlist, setWishlist] = useState([]);
    const [watchedlist, setWatchedlist] = useState([]);

    const [tmdbMovies, setTmdbMovies] = useState([]);
    const [tmdbLoading, setTmdbLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = () => {
        if (searchQuery.trim() === "") return;
        fetch(`http://localhost:8080/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`)
            .then((res) => res.json())
            .then((data) => {
                setSearchResults(data.results || []);
            })
            .catch(() => {
                alert("❌ Arama başarısız oldu!");
            });
    };


    useEffect(() => {
        if (user !== null) {
            setLoading(true);
            fetch("http://localhost:8080/api/movies")
                .then((res) => res.json())
                .then((data) => {
                    setMovies(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                    alert("❌ Filmler alınamadı!");
                });

            setTmdbLoading(true);
            fetch("http://localhost:8080/api/tmdb/popular")
                .then((res) => res.json())
                .then((data) => {
                    setTmdbMovies(data.results || []);
                    setTmdbLoading(false);
                })
                .catch(() => {
                    setTmdbLoading(false);
                    alert("❌ TMDB filmleri alınamadı!");
                });
        }
    }, [user]);

    const handleAuth = (e) => {
        e.preventDefault();
        fetch(`http://localhost:8080/api/users/${authMode}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        })
            .then((res) => {
                if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
                return res.json();
            })
            .then((data) => {
                setUser(data);
                alert(authMode === "login" ? "✅ Giriş başarılı!" : "✅ Kayıt başarılı!");
            })
            .catch((err) => alert(err.message));
    };

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

    const addToWishlist = (movie) => {
        if (!wishlist.some(m => m.id === movie.id)) {
            setWishlist([...wishlist, movie]);
        }
    };

    const addToWatchedlist = (movie) => {
        if (!watchedlist.some(m => m.id === movie.id)) {
            setWatchedlist([...watchedlist, movie]);
        }
    };

    if (user === null) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '40px',
                    width: '100%',
                    maxWidth: '400px',
                    backdropFilter: 'blur(20px)',
                    color: 'white'
                }}>
                    <h1 style={{
                        textAlign: 'center',
                        fontSize: '2rem',
                        marginBottom: '30px',
                        background: 'linear-gradient(45deg, #dc2626, #ff6b6b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {authMode === "login" ? "🔑 Giriş Yap" : "📝 Kayıt Ol"}
                    </h1>
                    <div>
                        {authMode === "register" && (
                            <input
                                type="text"
                                placeholder="Kullanıcı adı"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    marginBottom: '20px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '15px',
                                marginBottom: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '15px',
                                marginBottom: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                        <button onClick={handleAuth} style={{
                            width: '100%',
                            background: 'linear-gradient(45deg, #dc2626, #991b1b)',
                            color: 'white',
                            border: 'none',
                            padding: '15px 20px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '16px',
                            transition: 'all 0.3s'
                        }}>
                            {authMode === "login" ? "Giriş Yap" : "Kayıt Ol"}
                        </button>
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {authMode === "login" ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}
                        <button
                            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                            style={{
                                marginLeft: '5px',
                                color: '#dc2626',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            {authMode === "login" ? "Kayıt Ol" : "Giriş Yap"}
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    const headerStyle = {
        background: 'rgba(15, 20, 25, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '15px 0',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 1000
    };

    const navContainerStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px'
    };

    const logoStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'white'
    };

    const logoIconStyle = {
        width: '40px',
        height: '40px',
        background: 'linear-gradient(45deg, #dc2626, #991b1b)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white'
    };

    const mainContentStyle = {
        marginTop: '80px',
        padding: '40px 0',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 100%)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: 'white'
    };

    const containerStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px'
    };

    const sectionHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    };

    const sectionTitleStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const movieGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '25px',
        marginBottom: '60px'
    };

    const movieCardStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        overflow: 'hidden',
        transition: 'all 0.3s',
        position: 'relative',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    };

    const moviePosterStyle = {
        width: '100%',
        height: '300px',
        background: 'linear-gradient(135deg, #1a2332, #0f1419)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
    };

    const movieInfoStyle = {
        padding: '20px'
    };

    const movieTitleStyle = {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '8px',
        color: 'white'
    };

    const movieMetaStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    };

    const movieYearStyle = {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.9rem'
    };

    const movieRatingStyle = {
        background: 'linear-gradient(45deg, #dc2626, #991b1b)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '15px',
        fontSize: '0.8rem',
        fontWeight: '600'
    };

    const movieGenreStyle = {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.85rem',
        marginBottom: '15px'
    };

    const movieActionsStyle = {
        display: 'flex',
        gap: '8px'
    };

    const actionBtnStyle = {
        flex: 1,
        padding: '8px 12px',
        border: 'none',
        borderRadius: '20px',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.3s',
        fontWeight: '500'
    };

    const wishlistBtnStyle = {
        ...actionBtnStyle,
        background: 'rgba(59, 130, 246, 0.2)',
        color: '#60a5fa',
        border: '1px solid rgba(59, 130, 246, 0.3)'
    };

    const watchedBtnStyle = {
        ...actionBtnStyle,
        background: 'rgba(34, 197, 94, 0.2)',
        color: '#4ade80',
        border: '1px solid rgba(34, 197, 94, 0.3)'
    };

    const formStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '40px'
    };

    const formRowStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
    };

    const formInputStyle = {
        width: '100%',
        padding: '15px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '10px',
        color: 'white',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.3s'
    };

    const btnStyle = {
        background: 'linear-gradient(45deg, #dc2626, #991b1b)',
        color: 'white',
        border: 'none',
        padding: '15px 30px',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s',
        textDecoration: 'none',
        display: 'inline-block'
    };

    return (
        <div>
            <header style={headerStyle}>
                <div style={navContainerStyle}>
                    <div style={logoStyle}>
                        <div style={logoIconStyle}>B</div>
                        <span>WatchMatch</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Film ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '25px',
                                    padding: '10px 45px 10px 20px',
                                    color: 'white',
                                    fontSize: '14px',
                                    width: '300px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSearch}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    cursor: 'pointer'
                                }}
                            >
                                🔍
                            </button>

                        </div>
                        <button onClick={() => setUser(null)} style={btnStyle}>
                            🚪 Çıkış Yap
                        </button>
                    </div>
                </div>
            </header>

            <main style={mainContentStyle}>
                {/* Arama Sonuçları */}
                {searchResults.length > 0 && (
                    <section>
                        <div style={sectionHeaderStyle}>
                            <h2 style={sectionTitleStyle}>🔍 Arama Sonuçları</h2>
                        </div>
                        <div style={movieGridStyle}>
                            {searchResults.map((movie) => (
                                <div key={movie.id} style={movieCardStyle}>
                                    <div style={moviePosterStyle}>
                                        {movie.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                                alt={movie.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div style={movieInfoStyle}>
                                        <h3 style={movieTitleStyle}>{movie.title}</h3>
                                        <div style={movieMetaStyle}>
                                            <span style={movieYearStyle}>{movie.release_date}</span>
                                            <span style={movieRatingStyle}>⭐ {movie.vote_average}</span>
                                        </div>
                                        <div style={movieActionsStyle}>
                                            <button
                                                onClick={() => addToWishlist(movie)}
                                                style={wishlistBtnStyle}
                                            >
                                                ➕ İstek Listesi
                                            </button>
                                            <button
                                                onClick={() => addToWatchedlist(movie)}
                                                style={watchedBtnStyle}
                                            >
                                                ✅ İzledim
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div style={containerStyle}>
                    {/* Hero Section */}
                    <section style={{
                        position: 'relative',
                        height: '50vh',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '60px',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), linear-gradient(135deg, #1a2332, #0f1419)'
                    }}>
                        <div style={{ maxWidth: '600px', padding: '40px', zIndex: 2 }}>
                            <h1 style={{
                                fontSize: '3.5rem',
                                fontWeight: 'bold',
                                marginBottom: '20px',
                                background: 'linear-gradient(45deg, #dc2626, #ff6b6b)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                WatchMatch
                            </h1>
                            <p style={{
                                fontSize: '1.2rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                marginBottom: '30px',
                                lineHeight: '1.6'
                            }}>
                                Film Review & Movie Database Application
                            </p>
                        </div>
                    </section>

                    {/* TMDB Filmler */}
                    <section>
                        <div style={sectionHeaderStyle}>
                            <h2 style={sectionTitleStyle}>🌍 TMDB Popüler Filmler</h2>
                        </div>
                        {tmdbLoading ? (
                            <p style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem' }}>
                                ⏳ Yükleniyor...
                            </p>
                        ) : (
                            <div style={movieGridStyle}>
                                {tmdbMovies.map((movie) => (
                                    <div key={movie.id} style={movieCardStyle}>
                                        <div style={moviePosterStyle}>
                                            {movie.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                                    alt={movie.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div style={movieInfoStyle}>
                                            <h3 style={movieTitleStyle}>{movie.title}</h3>
                                            <div style={movieMetaStyle}>
                                                <span style={movieYearStyle}>{movie.release_date}</span>
                                                <span style={movieRatingStyle}>⭐ {movie.vote_average}</span>
                                            </div>
                                            <div style={movieActionsStyle}>
                                                <button
                                                    onClick={() => addToWishlist(movie)}
                                                    style={wishlistBtnStyle}
                                                >
                                                    ➕ İstek Listesi
                                                </button>
                                                <button
                                                    onClick={() => addToWatchedlist(movie)}
                                                    style={watchedBtnStyle}
                                                >
                                                    ✅ İzledim
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Senin DB Filmleri */}
                    <section>
                        <div style={sectionHeaderStyle}>
                            <h2 style={sectionTitleStyle}>🎥 Film Listesi</h2>
                        </div>
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem' }}>
                                ⏳ Yükleniyor...
                            </p>
                        ) : (
                            <div style={movieGridStyle}>
                                {movies.length === 0 ? (
                                    <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'rgba(255, 255, 255, 0.6)' }}>
                                        Hiç film bulunamadı
                                    </p>
                                ) : (
                                    movies.map((movie) => (
                                        <div key={movie.id} style={movieCardStyle}>
                                            <div style={moviePosterStyle}>
                                                {movie.posterUrl ? (
                                                    <img
                                                        src={movie.posterUrl}
                                                        alt={movie.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div style={movieInfoStyle}>
                                                <h3 style={movieTitleStyle}>{movie.title}</h3>
                                                <div style={movieMetaStyle}>
                                                    <span style={movieYearStyle}>{movie.releaseYear}</span>
                                                    <span style={movieRatingStyle}>⭐ {movie.rating}</span>
                                                </div>
                                                <div style={movieGenreStyle}>{movie.genre}</div>
                                                <div style={movieActionsStyle}>
                                                    <button
                                                        onClick={() => addToWishlist(movie)}
                                                        style={wishlistBtnStyle}
                                                    >
                                                        ➕ İstek Listesi
                                                    </button>
                                                    <button
                                                        onClick={() => addToWatchedlist(movie)}
                                                        style={watchedBtnStyle}
                                                    >
                                                        ✅ İzledim
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>

                    {/* İstek Listesi */}
                    <section>
                        <div style={sectionHeaderStyle}>
                            <h2 style={sectionTitleStyle}>💡 İstek Listem</h2>
                        </div>
                        <div style={movieGridStyle}>
                            {wishlist.length === 0 ? (
                                <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'rgba(255, 255, 255, 0.6)' }}>
                                    Liste boş
                                </p>
                            ) : (
                                wishlist.map((m) => (
                                    <div key={m.id} style={movieCardStyle}>
                                        <div style={movieInfoStyle}>
                                            <h3 style={movieTitleStyle}>{m.title}</h3>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* İzlediklerim */}
                    <section>
                        <div style={sectionHeaderStyle}>
                            <h2 style={sectionTitleStyle}>✅ İzlediklerim</h2>
                        </div>
                        <div style={movieGridStyle}>
                            {watchedlist.length === 0 ? (
                                <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'rgba(255, 255, 255, 0.6)' }}>
                                    Liste boş
                                </p>
                            ) : (
                                watchedlist.map((m) => (
                                    <div key={m.id} style={movieCardStyle}>
                                        <div style={movieInfoStyle}>
                                            <h3 style={movieTitleStyle}>{m.title}</h3>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Film Ekleme */}
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
                            <div style={{...formRowStyle, gridTemplateColumns: '1fr'}}>
                                <input
                                    type="text"
                                    placeholder="Poster URL"
                                    value={newMovie.posterUrl}
                                    onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                                    style={formInputStyle}
                                />
                            </div>
                            <div style={{...formRowStyle, gridTemplateColumns: '1fr'}}>
                                <textarea
                                    placeholder="Açıklama"
                                    value={newMovie.description}
                                    onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                                    rows="3"
                                    style={{...formInputStyle, resize: 'vertical'}}
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