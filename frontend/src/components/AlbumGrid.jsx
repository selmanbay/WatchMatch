// src/components/AlbumGrid.jsx
import React from "react";
import {
    albumGridStyle,
    albumCardStyle,
    albumCoverStyle,
    albumTitleStyle,
    albumMetaStyle,
    albumCountPillStyle,
    albumChangeCoverBtnStyle
} from "../styles/ui";
import { normalizePosterPath } from "../utils/images";

export default function AlbumGrid({ albums = [], onOpen, onChangeCover }) {
    return (
        <div style={albumGridStyle}>
            {albums.map((a) => {
                const key = a.id ?? a.title ?? Math.random();

                // Kapak URL'ini belirle
                const coverUrl = (() => {
                    // Liste kapağını kontrol et (placeholder hariç)
                    const listCover = a.image || a.listImage || a.list_image || a.cover || a.coverUrl;

                    if (listCover && !listCover.includes('list-placeholder.png')) {
                        return normalizePosterPath(listCover);
                    }

                    // İlk filmin poster'ını kontrol et (posterUrl alanını kullan)
                    const firstMovie = (a.movies || [])[0];
                    if (firstMovie?.posterUrl) {
                        return normalizePosterPath(firstMovie.posterUrl);
                    }

                    // poster_url alanını da kontrol et (eski format için)
                    if (firstMovie?.poster_url) {
                        return normalizePosterPath(firstMovie.poster_url);
                    }

                    return null;
                })();

                return (
                    <div
                        key={key}
                        style={albumCardStyle}
                        onClick={() => onOpen?.(a)}
                        role="button"
                        tabIndex={0}
                    >
                        <div style={{ ...albumCoverStyle, position: "relative" }}>
                            {coverUrl ? (
                                <img
                                    src={coverUrl}
                                    alt={a.title || "Kapak"}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        // Debug için hangi URL'de hata olduğunu göster
                                        console.log('Kapak yüklenemedi:', coverUrl);
                                    }}
                                />
                            ) : (
                                // Kapak yoksa placeholder göster
                                <div style={{
                                    position: "absolute",
                                    inset: 0,
                                    backgroundColor: "#f0f0f0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#666",
                                    fontSize: "14px"
                                }}>
                                    Kapak Yok
                                </div>
                            )}

                            <span style={albumCountPillStyle}>
                                {a.count ?? (a.movies?.length || 0)}
                            </span>

                            {a.editable && (
                                <button
                                    type="button"
                                    style={albumChangeCoverBtnStyle}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChangeCover?.(a);
                                    }}
                                >
                                    Kapak
                                </button>
                            )}
                        </div>

                        <div style={{ padding: 12 }}>
                            <div style={albumTitleStyle} title={a.title}>
                                {a.title}
                            </div>
                            {a.subtitle && <div style={albumMetaStyle}>{a.subtitle}</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}