import React, { useEffect, useState } from "react";

function App() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/api/movies")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Backend hata döndürdü: " + response.status);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Backend'den gelen:", data);
                setMovies(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch hatası:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Yükleniyor...</p>;
    if (error) return <p>Hata: {error}</p>;

    return (
        <div>
            <h1>Filmler</h1>
            {movies.length === 0 ? (
                <p>Hiç film bulunamadı.</p>
            ) : (
                <ul>
                    {movies.map((movie) => (
                        <li key={movie.id}>
                            <h3>{movie.title}</h3>
                            <p>{movie.genre} ({movie.releaseYear})</p>
                            <img src={movie.posterUrl} alt={movie.title} width="100" />
                            <p>Puan: {movie.rating}</p>
                            <p>{movie.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;
