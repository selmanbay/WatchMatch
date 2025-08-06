import React, { useEffect, useState } from "react";

function App() {
    // Kullanıcı bilgisi (login olmuş mu?)
    const [user, setUser] = useState(null);

    // Kullanıcı login mi register mi yapıyor
    const [authMode, setAuthMode] = useState("login");

    // Login/Register formu için bilgiler
    const [credentials, setCredentials] = useState({ email: "", password: "" });

    // Filmler ve yeni film formu
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

    // ✅ Wishlist ve Watchedlist
    const [wishlist, setWishlist] = useState([]);
    const [watchedlist, setWatchedlist] = useState([]);

    // Eğer kullanıcı login olduysa film listesini çek
    useEffect(() => {
        if (user !== null) {  // kullanıcı giriş yaptıysa
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
        }
    }, [user]);

    // Kullanıcı login/register işlemi
    const handleAuth = (e) => {
        e.preventDefault();

        fetch(`http://localhost:8080/api/users/${authMode}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        })
            .then((res) => {
                if (!res.ok) throw new Error("❌ İşlem başarısız!");
                return res.json();
            })
            .then((data) => {
                setUser(data);
                alert(authMode === "login" ? "✅ Giriş başarılı!" : "✅ Kayıt başarılı!");
            })
            .catch((err) => alert(err.message));
    };

    // Yeni film ekleme
    const handleAddMovie = (e) => {
        e.preventDefault();

        fetch("http://localhost:8080/api/movies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMovie)
        })
            .then((res) => res.json())
            .then((data) => {
                setMovies([...movies, data]); // listeye yeni filmi ekle
                // formu temizle
                setNewMovie({ title: "", genre: "", releaseYear: "", rating: "", description: "", posterUrl: "" });
            })
            .catch(() => alert("❌ Film eklenemedi!"));
    };

    // ✅ Wishlist'e ekle
    const addToWishlist = (movie) => {
        if (!wishlist.some(m => m.id === movie.id)) {
            setWishlist([...wishlist, movie]);
        }
    };

    // ✅ Watchedlist'e ekle
    const addToWatchedlist = (movie) => {
        if (!watchedlist.some(m => m.id === movie.id)) {
            setWatchedlist([...watchedlist, movie]);
        }
    };

    // ================== SAYFA GÖRÜNÜMLERİ ==================

    if (user === null) {
        return (
            <div style={{ padding: "20px" }}>
                <h1>{authMode === "login" ? "🔑 Giriş Yap" : "📝 Kayıt Ol"}</h1>

                <form onSubmit={handleAuth}>
                    <input
                        type="text"
                        placeholder="Kullanıcı adı"
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        required
                    />
                    <button type="submit">
                        {authMode === "login" ? "Giriş Yap" : "Kayıt Ol"}
                    </button>
                </form>

                <p>
                    {authMode === "login" ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}
                    <button
                        onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                    >
                        {authMode === "login" ? "Kayıt Ol" : "Giriş Yap"}
                    </button>
                </p>
            </div>
        );
    }

    // Eğer kullanıcı login olmuşsa film sayfası göster
    return (
        <div style={{ padding: "20px" }}>
            <h1>🎬 Hoşgeldin {user.username}</h1>
            <button onClick={() => setUser(null)}>🚪 Çıkış Yap</button>

            {/* Film Listesi */}
            <h2>Film Listesi</h2>
            {loading ? (
                <p>⏳ Yükleniyor...</p>
            ) : (
                <ul>
                    {movies.length === 0 ? (
                        <li>Hiç film bulunamadı</li>
                    ) : (
                        movies.map((movie) => (
                            <li key={movie.id}>
                                <strong>{movie.title}</strong> ({movie.genre}, {movie.releaseYear}) ⭐ {movie.rating}
                                <p>{movie.description}</p>
                                {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} width="100" />}
                                <br />
                                <button onClick={() => addToWishlist(movie)}>➕ İstek Listesine Ekle</button>
                                <button onClick={() => addToWatchedlist(movie)}>✅ İzledim</button>
                            </li>
                        ))
                    )}
                </ul>
            )}

            {/* ✅ İstek Listesi */}
            <h2>İstek Listem</h2>
            <ul>
                {wishlist.length === 0 ? <li>Liste boş</li> : wishlist.map((m) => <li key={m.id}>{m.title}</li>)}
            </ul>

            {/* ✅ İzlediklerim */}
            <h2>İzlediklerim</h2>
            <ul>
                {watchedlist.length === 0 ? <li>Liste boş</li> : watchedlist.map((m) => <li key={m.id}>{m.title}</li>)}
            </ul>

            {/* Film Ekleme Formu */}
            <h2>Yeni Film Ekle</h2>
            <form onSubmit={handleAddMovie}>
                <input type="text" placeholder="Başlık"
                       value={newMovie.title}
                       onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })} required />
                <input type="text" placeholder="Tür"
                       value={newMovie.genre}
                       onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })} required />
                <input type="number" placeholder="Yıl"
                       value={newMovie.releaseYear}
                       onChange={(e) => setNewMovie({ ...newMovie, releaseYear: e.target.value })} required />
                <input type="number" step="0.1" placeholder="Puan"
                       value={newMovie.rating}
                       onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })} required />
                <input type="text" placeholder="Açıklama"
                       value={newMovie.description}
                       onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })} />
                <input type="text" placeholder="Poster URL"
                       value={newMovie.posterUrl}
                       onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })} />
                <button type="submit">Ekle</button>
            </form>
        </div>
    );
}

export default App;
