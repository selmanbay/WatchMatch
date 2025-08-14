// src/components/MovieGrid.jsx
import React, { useState, useMemo } from "react";
import { movieGridStyle } from "../styles/ui";
import MovieCard from "./MovieCard";
import MovieDetailModal from "./MovieDetailModal";

export default function MovieGrid({
                                      items,
                                      fromTmdb = false,
                                      emptyText = "Liste boş",
                                      onAddWishlist,
                                      onAddWatched,
                                      onRemoveWishlist,   // opsiyonel
                                      onRemoveWatched     // opsiyonel
                                  }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const handleOpenDetail = (movie) => {
        setSelected(movie);
        setOpen(true);
    };

    // 🔽 En çok izlenen (vote_count) → popularity → vote_average sırası
    const sortedItems = useMemo(() => {
        const list = Array.isArray(items) ? [...items] : [];
        return list.sort((a, b) => {
            const avc = a?.vote_count ?? 0;
            const bvc = b?.vote_count ?? 0;
            if (bvc !== avc) return bvc - avc;

            const ap = a?.popularity ?? 0;
            const bp = b?.popularity ?? 0;
            if (bp !== ap) return bp - ap;

            const ava = a?.vote_average ?? 0;
            const bva = b?.vote_average ?? 0;
            if (bva !== ava) return bva - ava;

            // Son çare: daha yeni tarih önce gelsin
            const ar = (a?.release_date || a?.first_air_date || a?.releaseYear || "") + "";
            const br = (b?.release_date || b?.first_air_date || b?.releaseYear || "") + "";
            return br.localeCompare(ar);
        });
    }, [items]);

    if (!sortedItems.length) {
        return (
            <p style={{ textAlign: "center", gridColumn: "1/-1", color: "rgba(255, 255, 255, 0.6)" }}>
                {emptyText}
            </p>
        );
    }

    return (
        <>
            <div style={movieGridStyle}>
                {sortedItems.map((m) => (
                    <MovieCard
                        key={m.id ?? m.tmdbId ?? m.title}
                        movie={m}
                        fromTmdb={fromTmdb}
                        onAddWishlist={onAddWishlist}
                        onAddWatched={onAddWatched}
                        onRemoveWishlist={onRemoveWishlist}
                        onRemoveWatched={onRemoveWatched}
                        onOpenDetail={handleOpenDetail} // karta tıkla → detay aç
                    />
                ))}
            </div>

            <MovieDetailModal
                open={open}
                onClose={() => setOpen(false)}
                movie={selected}
                fromTmdb={fromTmdb}
                onAddWishlist={onAddWishlist}
                onAddWatched={onAddWatched}
            />
        </>
    );
}
