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
import { normalizePosterPath, pickPoster } from "../utils/images";

export default function AlbumGrid({ albums = [], onOpen, onChangeCover }) {
    return (
        <div style={albumGridStyle}>
            {albums.map((a) => {
                const key = a.id ?? a.title ?? Math.random();

                // Kapak: listeden gelen alanlar + ilk filmin posteri
                const coverUrl =
                    normalizePosterPath(a.image || a.listImage || a.cover || a.coverUrl) ||
                    pickPoster((a.movies || [])[0]);

                return (
                    <div
                        key={key}
                        style={albumCardStyle}
                        onClick={() => onOpen?.(a)}
                        role="button"
                        tabIndex={0}
                    >
                        <div style={{ ...albumCoverStyle, position: "relative" }}>
                            {coverUrl && (
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
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                            )}

                            <span style={albumCountPillStyle}>{a.count ?? 0}</span>

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
