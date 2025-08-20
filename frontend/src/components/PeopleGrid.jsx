// src/components/PeopleGrid.jsx
import React from "react";

const tmdb = (path, size = 185) =>
    path ? `https://image.tmdb.org/t/p/w${size}${path}` : null;

const cardStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
};

const imgWrapStyle = {
    width: "100%",
    aspectRatio: "2/3",
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 24,
    letterSpacing: 1,
};

const nameStyle = {
    fontSize: 14,
    fontWeight: 700,
    padding: "8px 10px 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

const roleStyle = {
    fontSize: 12,
    opacity: 0.8,
    padding: "2px 10px 10px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

export default function PeopleGrid({ people = [], emptyText = "Kadro bilgisi yok" }) {
    if (!people?.length) {
        return <div style={{ opacity: 0.75 }}>{emptyText}</div>;
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 12,
            }}
        >
            {people.map((p) => {
                const key = p.id ?? `${p.name}-${p.credit_id ?? Math.random()}`;
                const img = tmdb(p.profile_path, 185);
                const initials =
                    (p?.name || "?")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                const role = p.character || p.job || p.department || "Oyuncu";

                return (
                    <div key={key} style={cardStyle} title={p.name}>
                        <div style={imgWrapStyle}>
                            {img ? (
                                <img
                                    src={img}
                                    alt={p.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    loading="lazy"
                                />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div style={nameStyle}>{p.name}</div>
                        <div style={roleStyle}>{role}</div>
                    </div>
                );
            })}
        </div>
    );
}
