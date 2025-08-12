import React from "react";
import { movieGridStyle } from "../styles/ui";
import MovieCard from "./MovieCard";

export default function MovieGrid({ items, fromTmdb = false, emptyText = "Liste boş", onAddWishlist, onAddWatched }) {
    if (!items?.length) {
        return <p style={{ textAlign: "center", gridColumn: "1/-1", color: "rgba(255, 255, 255, 0.6)" }}>{emptyText}</p>;
    }
    return (
        <div style={movieGridStyle}>
            {items.map((m) => (
                <MovieCard
                    key={m.id}
                    movie={m}
                    fromTmdb={fromTmdb}
                    onAddWishlist={onAddWishlist}
                    onAddWatched={onAddWatched}
                />
            ))}
        </div>
    );
}
