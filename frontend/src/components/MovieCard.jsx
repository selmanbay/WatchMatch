// src/components/MovieCard.jsx
import React, { useState, useEffect } from "react";
import {
    movieCardWrapStyle,   // poster + caption sarmalayıcı
    movieCardStyle,       // posterin bulunduğu asıl kart
    moviePosterStyle,
    addToListHoverBtnStyle,
    statusWrapStyle,
    statusBadgeStyle,
    ribbonWrapStyle,
    movieCaptionStyle      // başlık (kartın altında)
} from "../styles/ui";
import { pickPoster } from "../utils/images";   // ✅ poster normalizer
import ListPicker from "./ListPicker";          // 🎞️ Film Listesi paneli
import { ThumbsUp, ThumbsDown } from "lucide-react"; // 👍👎 ikonlar

export default function MovieCard({
                                      movie,
                                      fromTmdb,
                                      isWatched,           // opsiyonel: parent state
                                      isInWishlist,        // opsiyonel: parent state
                                      onOpenDetail,        // opsiyonel: karta tıklayınca detay aç
                                      userId               // 🎯 Film listeleri için gerekli
                                  }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showListPicker, setShowListPicker] = useState(false);

    // 👍👎 reaksiyon (like | dislike | null)
    const [reaction, setReaction] = useState(null);

    // UI durumları (parent verir ise onu dinleriz; vermezse local state)
    const [watchedUI, setWatchedUI] = useState(
        Boolean(isWatched ?? movie?.isWatched ?? movie?.watched)
    );
    const [wishlistUI, setWishlistUI] = useState(
        Boolean(isInWishlist ?? movie?.isInWishlist ?? movie?.wishlisted)
    );

    useEffect(() => {
        if (typeof isWatched === "boolean") setWatchedUI(isWatched);
    }, [isWatched]);

    useEffect(() => {
        if (typeof isInWishlist === "boolean") setWishlistUI(isInWishlist);
    }, [isInWishlist]);

    // ✅ Poster'i tüm olası alanlardan toparla
    const poster = pickPoster(movie);
    const title =
        movie?.title ||
        movie?.name ||
        movie?.original_title ||
        movie?.originalName ||
        "Untitled";

    // Hover'da görünen “+ Ekle” butonu
    const addBtnStyle = {
        ...addToListHoverBtnStyle,
        opacity: isHovered ? 1 : 0,
        pointerEvents: isHovered ? "auto" : "none"
    };

    /* ------------- 👍👎 Reaksiyon barı (hover'da sağ üst) ------------- */
    const reactionBarStyle = {
        position: "absolute",
        top: 8,
        right: 8,
        display: "inline-flex",
        gap: 8,
        padding: "6px 8px",
        borderRadius: 999,
        background: "rgba(20,20,20,0.55)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(6px)",
        transition: "opacity 140ms ease",
        opacity: isHovered ? 1 : 0,
        pointerEvents: isHovered ? "auto" : "none",
        zIndex: 7
    };

    const baseReactBtn = {
        width: 28,
        height: 28,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.06)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.85)",
        cursor: "pointer",
        transition: "transform 120ms ease, background 160ms ease, color 160ms ease, border-color 160ms ease",
    };

    const likeActive = reaction === "like";
    const dislikeActive = reaction === "dislike";

    const likeBtnStyle = {
        ...baseReactBtn,
        ...(likeActive
            ? { background: "rgba(34,197,94,0.18)", borderColor: "rgba(34,197,94,0.5)", color: "#22c55e" }
            : {}),
    };
    const dislikeBtnStyle = {
        ...baseReactBtn,
        ...(dislikeActive
            ? { background: "rgba(239,68,68,0.18)", borderColor: "rgba(239,68,68,0.5)", color: "#ef4444" }
            : {}),
    };

    const handleLike = (e) => {
        e.stopPropagation();
        setReaction((r) => (r === "like" ? null : "like"));
    };
    const handleDislike = (e) => {
        e.stopPropagation();
        setReaction((r) => (r === "dislike" ? null : "dislike"));
    };
    /* ------------------------------------------------------------------ */

    return (
        <div style={movieCardWrapStyle}>
            {/* Poster kartı */}
            <div
                style={movieCardStyle}
                onClick={() => onOpenDetail?.(movie, fromTmdb)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    // Liste paneli açık kalsın istiyorsan bu satırı kaldır.
                    // setShowListPicker(false);
                }}
                role="button"
                aria-label={`Open details for ${title}`}
            >
                <div style={moviePosterStyle}>
                    {poster ? (
                        <img
                            src={poster}
                            alt={title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                                // görsel bozuksa graceful fallback
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                            No Image
                        </div>
                    )}
                </div>

                {/* Hover'da görünen 👍👎 reaksiyon barı (sağ üst) */}
                <div style={reactionBarStyle} aria-label="Beğeni seçenekleri">
                    <button
                        aria-label="Beğen"
                        style={likeBtnStyle}
                        onClick={handleLike}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <ThumbsUp size={16} />
                    </button>
                    <button
                        aria-label="Beğenme"
                        style={dislikeBtnStyle}
                        onClick={handleDislike}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <ThumbsDown size={16} />
                    </button>
                </div>

                {/* Hover'da görünen “+ Ekle” tetikleyici — sadece ListPicker aç */}
                <button
                    style={addBtnStyle}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowListPicker(true); //
                    }}
                    aria-haspopup="dialog"
                >
                    + Ekle
                </button>

                {/* Sağ üst durum ikonları (mevcut rozetler) */}
                <div style={statusWrapStyle}>
                    {watchedUI && (
                        <div style={statusBadgeStyle} title="İzledim">
                            {/* 👁️ Eye SVG */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path
                                    d="M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7Z"
                                    fill="#fff"
                                    opacity="0.9"
                                />
                                <circle cx="12" cy="12" r="4" fill="#0b0b0b" />
                                <circle cx="12" cy="12" r="2" fill="#fff" />
                            </svg>
                        </div>
                    )}
                </div>

                {wishlistUI && (
                    <div style={ribbonWrapStyle} title="İstek Listesinde">
                        {/* 🔖 Ribbon SVG */}
                        <svg width="24" height="36" viewBox="0 0 24 36" fill="none" aria-hidden>
                            <path d="M0 0h24v26L12 20 0 26V0Z" fill="#dc2626" />
                            <rect x="0" y="0" width="24" height="3" fill="rgba(255,255,255,0.18)" />
                        </svg>
                    </div>
                )}

                {/* 🎞️ Film Listesi paneli (sadece bu açılıyor) */}
                <ListPicker
                    open={showListPicker}
                    onClose={() => setShowListPicker(false)}
                    movie={movie}
                    userId={userId}
                    fromTmdb={fromTmdb}
                />
            </div>

            {/* Başlık: kartın ALTINDA */}
            <div style={movieCaptionStyle} title={title}>
                {title}
            </div>
        </div>
    );
}
