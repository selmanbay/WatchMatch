import React, { useEffect, useState } from "react";

function App() {
    const [movies, setMovies] = useState([]);      // film listesi
    const [loading, setLoading] = useState(true);  // yüklenme durumu
    const [error, setError] = useState(null);      // hata durumu
    const [newMovie, setNewMovie] = useState({     // yeni film formu
        title: "",
        genre: "",
        releaseYear: "",
        rating: "",
        description: "",
        posterUrl: ""
    });

    // Filmleri çek
    useEffect(() => {
        fetch("http://localhost:8080/api/movies")
            .then((response) => {
                if (!response.ok) throw new Error("Veri çekilemedi");
                return response.json();
            })
            .then((data) => {
                setMovies(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Yeni film ekle
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
            .catch((err) => alert("Film eklenemedi: " + err));
    };

    if (loading) return <p>Yükleniyor...</p>;
    if (error) return <p>Hata: {error}</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>🎬 Film Listesi</h1>

            {/* Film Listesi */}
            <ul>
                {movies.length === 0 ? (
                    <li>Hiç film bulunamadı</li>
                ) : (
                    movies.map((movie) => (
                        <li key={movie.id}>
                            <strong>{movie.title}</strong> ({movie.genre}, {movie.releaseYear}) ⭐ {movie.rating}
                            <p>{movie.description}</p>
                            {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} width="100" />}
                        </li>
                    ))
                )}
            </ul>

            <hr />

            {/* Film Ekleme Formu */}
            <h2>Yeni Film Ekle</h2>
            <form onSubmit={handleAddMovie}>
                <input
                    type="text"
                    placeholder="Başlık"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Tür"
                    value={newMovie.genre}
                    onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Yıl"
                    value={newMovie.releaseYear}
                    onChange={(e) => setNewMovie({ ...newMovie, releaseYear: e.target.value })}
                    required
                />
                <input
                    type="number"
                    step="0.1"
                    placeholder="Puan"
                    value={newMovie.rating}
                    onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Açıklama"
                    value={newMovie.description}
                    onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Poster URL"
                    value={newMovie.posterUrl}
                    onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                />
                <button type="submit">Ekle</button>
            </form>
        </div>
    );
}

export default App;
