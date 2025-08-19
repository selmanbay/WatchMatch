// src/components/MovieCard.jsx
import React, { useState, useEffect } from "react";
import {
    movieCardWrapStyle,   // poster + caption sarmalayıcı
    movieCardStyle,       // posterin bulunduğu asıl kart
    moviePosterStyle,
    addToListHoverBtnStyle,
    expandMenuItemStyle,  // kırmızı gradient buton
    statusWrapStyle,
    statusBadgeStyle,
    ribbonWrapStyle,
    movieCaptionStyle      // başlık (kartın altında)
} from "../styles/ui";
import { pickPoster } from "../utils/images";   // ✅ poster normalizer
import ListPicker from "./ListPicker";          // 🎞️ Film Listesi paneli

export default function MovieCard({
                                      movie,
                                      fromTmdb,
                                      onAddWishlist,
                                      onAddWatched,
                                      onRemoveWishlist,   // opsiyonel
                                      onRemoveWatched,    // opsiyonel
                                      isWatched,          // opsiyonel: parent state
                                      isInWishlist,       // opsiyonel: parent state
                                      onOpenDetail,       // opsiyonel: karta tıklayınca detay aç
                                      userId              // 🎯 Film listeleri için gerekli
                                  }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showListPicker, setShowListPicker] = useState(false);

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

    const addBtnStyle = {
        ...addToListHoverBtnStyle,
        opacity: isHovered ? 1 : 0,
        pointerEvents: isHovered ? "auto" : "none"
    };

    // Tüm kartı kaplayan overlay
    const overlayStyle = {
        position: "absolute",
        inset: 0,
        background: "rgba(12,12,12,0.82)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 6,
        opacity: showMenu ? 1 : 0,
        pointerEvents: showMenu ? "auto" : "none",
        transition: "opacity .18s ease"
    };

    const overlayInnerStyle = {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "80%",
        maxWidth: 280
    };

    // Hover parlaklığı
    const brighten = (el, on) => {
        if (el) el.style.filter = on ? "brightness(1.06)" : "none";
    };

    // —————— Tek-durum (mutually exclusive) ——————
    const handleWishlist = (e) => {
        e.stopPropagation();
        if (!wishlistUI) {
            onAddWishlist?.(movie);
            setWishlistUI(true);
            if (watchedUI) {
                onRemoveWatched?.(movie);
                setWatchedUI(false);
            }
        }
        setShowMenu(false);
        setShowListPicker(false);
    };

    const handleWatched = (e) => {
        e.stopPropagation();
        if (!watchedUI) {
            onAddWatched?.(movie);
            setWatchedUI(true);
            if (wishlistUI) {
                onRemoveWishlist?.(movie);
                setWishlistUI(false);
            }
        }
        setShowMenu(false);
        setShowListPicker(false);
    };

    const openListPicker = (e) => {
        e.stopPropagation();
        setShowListPicker((v) => !v); // aynı butona tekrar basınca kapansın
        setShowMenu(true);            // overlay açık kalsın
    };
    // ————————————————————————————————

    return (
        <div style={movieCardWrapStyle}>
            {/* Poster kartı */}
            <div
                style={movieCardStyle}
                onClick={() => onOpenDetail?.(movie, fromTmdb)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setShowMenu(false);
                    setShowListPicker(false);
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

                {/* Hover'da görünen kırmızı buton */}
                <button
                    style={addBtnStyle}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu((v) => {
                            const next = !v;
                            if (!next) setShowListPicker(false);
                            return next;
                        });
                    }}
                    aria-haspopup="menu"
                >
                    + Ekle
                </button>

                {/* 🔴 TÜM KARTI KAPLAYAN OVERLAY MENÜ */}
                <div
                    style={overlayStyle}
                    onClick={() => {
                        setShowMenu(false);
                        setShowListPicker(false);
                    }}
                    role="menu"
                    aria-label="Ekle menüsü"
                >
                    <div
                        style={overlayInnerStyle}
                        onClick={(e) => e.stopPropagation()} // içeriğe tıklayınca kapanmasın
                    >
                        <button
                            style={{ ...expandMenuItemStyle, width: "100%" }}
                            onMouseEnter={(e) => brighten(e.currentTarget, true)}
                            onMouseLeave={(e) => brighten(e.currentTarget, false)}
                            onClick={handleWishlist}
                        >
                            + İstek Listesi
                        </button>

                        <button
                            style={{ ...expandMenuItemStyle, width: "100%" }}
                            onMouseEnter={(e) => brighten(e.currentTarget, true)}
                            onMouseLeave={(e) => brighten(e.currentTarget, false)}
                            onClick={handleWatched}
                        >
                            + İzledim
                        </button>

                        <button
                            style={{ ...expandMenuItemStyle, width: "100%" }}
                            onMouseEnter={(e) => brighten(e.currentTarget, true)}
                            onMouseLeave={(e) => brighten(e.currentTarget, false)}
                            onClick={openListPicker}
                        >
                            + Film Listesi
                        </button>
                    </div>
                </div>

                {/* Sağ üst durum ikonları */}
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

                {/* 🎞️ Film Listesi paneli */}
                <ListPicker
                    open={showListPicker}
                    onClose={() => setShowListPicker(false)}
                    movie={movie}
                    userId={userId}     // giriş yapan kullanıcının id’si
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
