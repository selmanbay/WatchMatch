import React from "react";
import {
    movieCardStyle, moviePosterStyle, movieInfoStyle, movieTitleStyle,
    movieMetaStyle, movieYearStyle, movieRatingStyle, movieGenreStyle,
    movieActionsStyle, wishlistBtnStyle, watchedBtnStyle
} from "../styles/ui";

export default function MovieCard({ movie, fromTmdb, onAddWishlist, onAddWatched }) {
    const poster = fromTmdb
        ? (movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : null)
        : (movie.posterUrl || null);

    return (
        <div style={movieCardStyle}>
            <div style={moviePosterStyle}>
                {poster ? (
                    <img src={poster} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>No Image</div>
                )}
            </div>
            <div style={movieInfoStyle}>
                <h3 style={movieTitleStyle}>{movie.title}</h3>
                <div style={movieMetaStyle}>
                    <span style={movieYearStyle}>{fromTmdb ? movie.release_date : movie.releaseYear}</span>
                    <span style={movieRatingStyle}>⭐ {fromTmdb ? movie.vote_average : movie.rating}</span>
                </div>
                {!fromTmdb && movie.genre && <div style={movieGenreStyle}>{movie.genre}</div>}
                <div style={movieActionsStyle}>
                    <button onClick={() => onAddWishlist(movie)} style={wishlistBtnStyle}>➕ İstek Listesi</button>
                    <button onClick={() => onAddWatched(movie)} style={watchedBtnStyle}>✅ İzledim</button>
                </div>
            </div>
        </div>
    );
}
