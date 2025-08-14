import React, { useMemo } from "react";
import {
    detailOverlayStyle, detailContainerStyle, detailHeaderStyle, detailHeaderShadeStyle,
    detailCloseBtnStyle, detailBodyStyle, detailPosterLargeStyle,
    detailTitleStyle, detailMetaRowStyle, userScorePillStyle,
    detailActionsRowStyle, detailActionBtnStyle, detailOverviewStyle,
    chipRowStyle, chipStyle
} from "../styles/ui";

export default function MovieDetailModal({
                                             open,
                                             onClose,
                                             movie,
                                             fromTmdb,
                                             onAddWishlist,
                                             onAddWatched
                                         }) {
    if (!open || !movie) return null;

    const poster = fromTmdb
        ? (movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : null)
        : (movie.posterUrl || null);

    const backdrop = fromTmdb
        ? (movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : poster)
        : poster;

    const title = movie.title || movie.name || "Untitled";
    const release = fromTmdb ? (movie.release_date || movie.first_air_date || "") : (movie.releaseYear || "");
    const score = useMemo(() => {
        const v = fromTmdb ? Number(movie.vote_average) : Number(movie.rating);
        if (Number.isNaN(v)) return null;
        const pct = Math.round(Math.max(0, Math.min(10, v)) * 10);
        return pct; // 0..100
    }, [fromTmdb, movie]);

    return (
        <div style={detailOverlayStyle} onClick={onClose}>
            <div style={detailContainerStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header / Hero */}
                <div
                    style={{
                        ...detailHeaderStyle,
                        backgroundImage: backdrop ? `url(${backdrop})` : "none"
                    }}
                >
                    <div style={detailHeaderShadeStyle} />
                    <button style={detailCloseBtnStyle} onClick={onClose} aria-label="Kapat">✕</button>
                </div>

                {/* Body */}
                <div style={detailBodyStyle}>
                    {/* Poster */}
                    <div>
                        {poster ? (
                            <img src={poster} alt={title} style={detailPosterLargeStyle} />
                        ) : (
                            <div style={{ ...detailPosterLargeStyle, display:"grid", placeItems:"center", color:"rgba(255,255,255,.6)" }}>
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <h1 style={detailTitleStyle}>{title} {release ? <span style={{opacity:.6, fontWeight:400}}>({String(release).slice(0,4)})</span> : null}</h1>

                        <div style={detailMetaRowStyle}>
                            {score != null && (
                                <div style={userScorePillStyle}>
                                    <strong>{score}%</strong>&nbsp;<span style={{opacity:.9}}>User Score</span>
                                </div>
                            )}
                            {release && <span>{release}</span>}
                            {fromTmdb && movie.adult ? <span>18+</span> : null}
                        </div>

                        {/* Genres (TMDB’den geldiyse dizi olabilir) */}
                        <div style={chipRowStyle}>
                            {(fromTmdb ? (movie.genres || []) : (movie.genre ? [{name: movie.genre}] : []))
                                .slice(0,6)
                                .map((g, i) => <span style={chipStyle} key={i}>{g.name || g}</span>)}
                        </div>

                        <div style={detailActionsRowStyle}>
                            <button style={detailActionBtnStyle} onClick={() => onAddWishlist?.(movie)}>➕ İstek Listesi</button>
                            <button style={detailActionBtnStyle} onClick={() => onAddWatched?.(movie)}>✅ İzledim</button>
                        </div>

                        <div style={detailOverviewStyle}>
                            <h3 style={{margin:"0 0 8px 0"}}>Overview</h3>
                            <p style={{margin:0, lineHeight:1.6, color:"rgba(255,255,255,.9)"}}>
                                {movie.overview || "No overview available."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
