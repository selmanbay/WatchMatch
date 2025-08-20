// src/components/MovieDetailModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    detailOverlayStyle, detailContainerStyle, detailHeaderStyle, detailHeaderShadeStyle,
    detailCloseBtnStyle, detailBodyStyle, detailPosterLargeStyle,
    detailTitleStyle, detailMetaRowStyle, userScorePillStyle,
    detailActionsRowStyle, detailOverviewStyle,
    chipRowStyle, chipStyle
} from "../styles/ui";
import ListPicker from "./ListPicker";

/* === Etkileşimli buton (hover/press animasyonlu) === */
function ActionButton({ onClick, children, style }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const BASE  = "#650E0E";
    const HOVER = "#7A1616";
    const PRESS = "#4F0B0B";

    const base = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 12,
        userSelect: "none",
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.95)",
        color: "#fff",
        background: pressed ? PRESS : hovered ? HOVER : BASE,
        transition:
            "transform 80ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease",
        transform: pressed ? "translateY(1px) scale(0.98)" : hovered ? "translateY(-1px)" : "none",
        boxShadow: pressed
            ? "0 2px 8px rgba(0,0,0,.25)"
            : hovered
                ? "0 6px 16px rgba(0,0,0,.35)"
                : "0 2px 6px rgba(0,0,0,.25)",
        outline: "none",
        ...style
    };

    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={base}
        >
            {children}
        </button>
    );
}

/* === Kişi kartı (grid için) === */
function PersonCard({ name, role, photo }) {
    const initials = (name || "?")
        .split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const card = {
        width: "100%",
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 10,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
    };
    const imgBox = {
        width: "100%",
        aspectRatio: "2 / 3",
        background: "rgba(0,0,0,.35)",
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: 22,
        letterSpacing: 1
    };
    const nameS = { fontSize: 13, fontWeight: 700, padding: "8px 10px 2px 10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
    const roleS = { fontSize: 11, opacity: 0.75, padding: "0 10px 10px 10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

    return (
        <div style={card} title={name}>
            <div style={imgBox}>
                {photo ? (
                    <img
                        src={photo}
                        alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                ) : (
                    <span>{initials}</span>
                )}
            </div>
            <div style={nameS}>{name}</div>
            {role && <div style={roleS}>{role}</div>}
        </div>
    );
}

/* === Grid yerleşimi === */
function PeopleGrid({ people = [] }) {
    if (!people.length) return <div style={{ opacity: 0.7 }}>Bilgi yok</div>;
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 12
            }}
        >
            {people.map((p, i) => (
                <PersonCard key={`${p.id ?? p.name}-${i}`} name={p.name} role={p.role} photo={p.photo} />
            ))}
        </div>
    );
}

/* === İnce (şeffaf) toggle butonu === */
function GhostButton({ onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.7)",
                background: "transparent",
                color: "#fff",
                cursor: "pointer"
            }}
        >
            {children}
        </button>
    );
}

export default function MovieDetailModal({
                                             open,
                                             onClose,
                                             movie,
                                             fromTmdb,
                                             onAddWishlist,
                                             onAddWatched,
                                             userId
                                         }) {
    const m = movie || {};

    // Poster & backdrop
    const poster = fromTmdb
        ? (m?.poster_path ? `https://image.tmdb.org/t/p/w300${m.poster_path}` : null)
        : (m?.posterUrl || null);

    const backdrop = fromTmdb
        ? (m?.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : poster)
        : poster;

    const title = m?.title || m?.name || "Untitled";
    const release = fromTmdb ? (m?.release_date || m?.first_air_date || "") : (m?.releaseYear || "");

    const score = useMemo(() => {
        const v = fromTmdb ? Number(m?.vote_average) : Number(m?.rating);
        if (Number.isNaN(v)) return null;
        return Math.round(Math.max(0, Math.min(10, v)) * 10);
    }, [fromTmdb, m]);

    // Krediler
    const [credits, setCredits] = useState(m?._credits || null);
    useEffect(() => { setCredits(m?._credits || null); }, [m]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (credits || !m?.id) return;

            // 1) DB'den MovieFeatures
            try {
                const dbRes = await fetch(`http://localhost:8080/api/movie-features/${m.id}`);
                if (dbRes.ok) {
                    const dbData = await dbRes.json();
                    if (!cancelled && dbData && (dbData.directorNames || dbData.actorNames)) {
                        setCredits(dbData);
                        return;
                    }
                }
            } catch {}

            // 2) TMDB credits
            try {
                if (fromTmdb) {
                    const res = await fetch(
                        `http://localhost:8080/api/tmdb/movie/${m.id}/credits?language=tr-TR`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        if (!cancelled) setCredits(data);
                    }
                }
            } catch {}
        }
        load();
        return () => { cancelled = true; };
    }, [credits, fromTmdb, m]);

    const photoUrl = (p) =>
        !p ? null : (String(p).startsWith("http") ? p : `https://image.tmdb.org/t/p/w185${p}`);

    const dirNamesA = Array.isArray(credits?.directorNames) ? credits.directorNames : null;
    const dirIdsA   = Array.isArray(credits?.directorIds)   ? credits.directorIds   : [];

    const actNamesA = Array.isArray(credits?.actorNames) ? credits.actorNames : null;
    const actIdsA   = Array.isArray(credits?.actorIds)   ? credits.actorIds   : [];

    const tmdbCrew = Array.isArray(credits?.crew) ? credits.crew
        : Array.isArray(credits?.tmdbCrew) ? credits.tmdbCrew : [];
    const tmdbCast = Array.isArray(credits?.cast) ? credits.cast
        : Array.isArray(credits?.tmdbCast) ? credits.tmdbCast : [];

    const directorsFromCrew = tmdbCrew
        .filter(c =>
            (c?.job === "Director") ||
            (c?.known_for_department === "Directing" && (c?.job || "").toLowerCase().includes("director"))
        )
        .map(c => ({ id: c?.id, name: c?.name || c?.original_name, role: "Yönetmen", photo: photoUrl(c?.profile_path) }));

    const actorsFromCast = tmdbCast
        .slice(0, 30)
        .map(c => ({ id: c?.id, name: c?.name || c?.original_name, role: "Oyuncu", photo: photoUrl(c?.profile_path) }));

    const people = useMemo(() => {
        const list = [];
        if (dirNamesA && dirNamesA.length) {
            dirNamesA.forEach((n, i) => list.push({ id: dirIdsA[i], name: n, role: "Yönetmen", photo: null }));
        } else {
            list.push(...directorsFromCrew);
        }
        if (actNamesA && actNamesA.length) {
            actNamesA.forEach((n, i) => list.push({ id: actIdsA[i], name: n, role: "Oyuncu", photo: null }));
        } else {
            list.push(...actorsFromCast);
        }
        const seen = new Set();
        return list.filter(p => {
            const key = (p.name || "") + "|" + (p.role || "");
            if (seen.has(key)) return false;
            seen.add(key);
            return Boolean(p.name);
        });
    }, [dirNamesA, dirIdsA, actNamesA, actIdsA, directorsFromCrew, actorsFromCast]);

    // "Daha Fazla / Daha Az" kontrolü
    const [showAllPeople, setShowAllPeople] = useState(false);
    const VISIBLE_COUNT = 6;
    const visiblePeople = showAllPeople ? people : people.slice(0, VISIBLE_COUNT);

    // Film Listesi paneli
    const [showListPicker, setShowListPicker] = useState(false);
    const openListPicker = () => {
        if (!userId) {
            alert("Film Listesi için giriş yapmış olmalısınız.");
            return;
        }
        setShowListPicker(true);
    };

    if (!open || !movie) return null;

    return (
        <div style={detailOverlayStyle} onClick={onClose}>
            <div style={detailContainerStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{ ...detailHeaderStyle, backgroundImage: backdrop ? `url(${backdrop})` : "none" }}>
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
                        <h1 style={detailTitleStyle}>
                            {title}{" "}
                            {release ? <span style={{opacity:.6, fontWeight:400}}>({String(release).slice(0,4)})</span> : null}
                        </h1>

                        <div style={detailMetaRowStyle}>
                            {score != null && (
                                <div style={userScorePillStyle}>
                                    <strong>{score}%</strong>&nbsp;<span style={{opacity:.9}}>User Score</span>
                                </div>
                            )}
                            {release && <span>{release}</span>}
                            {fromTmdb && m?.adult ? <span>18+</span> : null}
                        </div>

                        {/* Türler */}
                        <div style={chipRowStyle}>
                            {(fromTmdb ? (m?.genres || []) : (m?.genre ? [{name: m.genre}] : []))
                                .slice(0,6)
                                .map((g, i) => <span style={chipStyle} key={i}>{g?.name || g}</span>)}
                        </div>

                        {/* Aksiyon butonları */}
                        <div style={detailActionsRowStyle}>
                            <ActionButton onClick={() => onAddWishlist?.(m)}>İstek Listesi</ActionButton>
                            <ActionButton onClick={() => onAddWatched?.(m)}>İzledim</ActionButton>
                            <ActionButton onClick={openListPicker}>Film Listesi</ActionButton>
                        </div>

                        {/* Overview */}
                        <div style={detailOverviewStyle}>
                            <h3 style={{margin:"0 0 8px 0"}}>Overview</h3>
                            <p style={{margin:0, lineHeight:1.6, color:"rgba(255,255,255,.9)"}}>
                                {m?.overview || credits?.overview || "No overview available."}
                            </p>
                        </div>

                        {/* Kadro (GRID + Daha Fazla/Az) */}
                        <div style={{ marginTop: 16 }}>
                            <div style={{ margin: "14px 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "#650e0e", color: "#fff", fontSize: 12, fontWeight: 800, padding: "6px 10px", borderRadius: 999 }}>
                  Kadro
                </span>
                            </div>

                            <PeopleGrid people={visiblePeople} />

                            {people.length > VISIBLE_COUNT && (
                                <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                                    <GhostButton onClick={() => setShowAllPeople(v => !v)}>
                                        {showAllPeople ? "Daha Az" : "Daha Fazla"}
                                    </GhostButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 🎞️ Film Listesi paneli */}
                <ListPicker
                    open={showListPicker}
                    onClose={() => setShowListPicker(false)}
                    movie={m}
                    userId={userId}
                    fromTmdb={fromTmdb}
                />
            </div>
        </div>
    );
}
