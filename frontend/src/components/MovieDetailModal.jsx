// src/components/MovieDetailModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    detailOverlayStyle, detailContainerStyle, detailHeaderStyle, detailHeaderShadeStyle,
    detailCloseBtnStyle, detailBodyStyle, detailPosterLargeStyle,
    detailTitleStyle, detailMetaRowStyle, userScorePillStyle,
    detailActionsRowStyle, detailActionBtnStyle, detailOverviewStyle,
    chipRowStyle, chipStyle
} from "../styles/ui";

/* === Küçük yardımcılar === */
const photoUrl = (p) =>
    !p ? null : (String(p).startsWith("http") ? p : `https://image.tmdb.org/t/p/w185${p}`);

function PersonCard({ name, role, photo }) {
    const card = {
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.12)",
        background: "rgba(255,255,255,.05)",
    };
    const imgBox = {
        width: "100%",
        height: 160,
        background: "rgba(0,0,0,.35)",
        display: "grid",
        placeItems: "center",
    };
    const nameS = {
        fontSize: 13,
        fontWeight: 800,
        padding: "8px 10px 6px 10px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    };
    const badge = {
        position: "absolute",
        left: 8,
        top: 8,
        padding: "4px 8px",
        fontSize: 11,
        fontWeight: 800,
        borderRadius: 999,
        background: role === "Yönetmen" ? "rgba(59,130,246,.9)" : "rgba(220,38,38,.9)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,.25)",
    };

    return (
        <div style={card} title={name}>
            <span style={badge}>{role}</span>
            <div style={imgBox}>
                {photo ? (
                    <img
                        src={photo}
                        alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                        draggable={false}
                    />
                ) : (
                    <span style={{ opacity: 0.7 }}>No Image</span>
                )}
            </div>
            <div style={nameS}>{name}</div>
        </div>
    );
}

export default function MovieDetailModal({
                                             open,
                                             onClose,
                                             movie,
                                             fromTmdb,
                                             onAddWishlist,
                                             onAddWatched,
                                         }) {
    // Hook'lar her zaman çalışsın
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

    useEffect(() => {
        setCredits(m?._credits || null);
    }, [m]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (credits || !m?.id) return;

            // 1) DB MovieFeatures
            try {
                const dbRes = await fetch(`http://localhost:8080/api/movie-features/${m.id}`);
                if (dbRes.ok) {
                    const dbData = await dbRes.json();
                    if (!cancelled && (dbData?.directorNames || dbData?.actorNames)) {
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
                    if (res.ok && !cancelled) setCredits(await res.json());
                }
            } catch {}
        }
        load();
        return () => { cancelled = true; };
    }, [credits, fromTmdb, m]);

    // Veriyi normalize et
    const dirNamesA = Array.isArray(credits?.directorNames) ? credits.directorNames : null;
    const dirIdsA   = Array.isArray(credits?.directorIds)   ? credits.directorIds   : [];
    const actNamesA = Array.isArray(credits?.actorNames)    ? credits.actorNames    : null;
    const actIdsA   = Array.isArray(credits?.actorIds)      ? credits.actorIds      : [];

    const tmdbCrew = Array.isArray(credits?.crew) ? credits.crew
        : Array.isArray(credits?.tmdbCrew) ? credits.tmdbCrew : [];
    const tmdbCast = Array.isArray(credits?.cast) ? credits.cast
        : Array.isArray(credits?.tmdbCast) ? credits.tmdbCast : [];

    const directorsFromCrew = tmdbCrew
        .filter(c =>
            (c?.job === "Director") ||
            (c?.known_for_department === "Directing" && String(c?.job || "").toLowerCase().includes("director"))
        )
        .map(c => ({ id: c?.id, name: c?.name || c?.original_name, role: "Yönetmen", photo: photoUrl(c?.profile_path) }));

    const actorsFromCast = tmdbCast
        .map(c => ({ id: c?.id, name: c?.name || c?.original_name, role: "Oyuncu", photo: photoUrl(c?.profile_path) }));

    const people = useMemo(() => {
        const list = [];
        if (dirNamesA?.length) dirNamesA.forEach((n, i) => list.push({ id: dirIdsA[i], name: n, role: "Yönetmen", photo: null }));
        else list.push(...directorsFromCrew);

        if (actNamesA?.length) actNamesA.forEach((n, i) => list.push({ id: actIdsA[i], name: n, role: "Oyuncu", photo: null }));
        else list.push(...actorsFromCast);

        const seen = new Set();
        return list.filter(p => {
            const key = (p.name || "") + "|" + (p.role || "");
            if (seen.has(key)) return false;
            seen.add(key);
            return Boolean(p.name);
        });
    }, [dirNamesA, dirIdsA, actNamesA, actIdsA, directorsFromCrew, actorsFromCast]);

    // Grid için durum
    const [showAll, setShowAll] = useState(false);
    useEffect(() => { setShowAll(false); }, [m?.id]); // film değişince kapat

    const previewCount = 10;
    const visiblePeople = showAll ? people : people.slice(0, previewCount);

    // Artık render'ı kesebiliriz
    if (!open || !movie) return null;

    // Başlık satırında "Daha Fazla" butonu
    const headerRow = {
        margin: "14px 0 8px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    };
    const kadroTag = {
        background: "#dc2626",
        color: "#fff",
        fontSize: 12,
        fontWeight: 800,
        padding: "6px 10px",
        borderRadius: 999,
    };
    const moreBtn = {
        fontSize: 12,
        fontWeight: 700,
        padding: "6px 10px",
        borderRadius: 8,
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.18)",
        color: "#fff",
        cursor: "pointer",
    };

    // Grid stili
    const gridStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 14,
    };

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
                            {title} {release ? <span style={{opacity:.6, fontWeight:400}}>({String(release).slice(0,4)})</span> : null}
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

                        {/* Aksiyon */}
                        <div style={detailActionsRowStyle}>
                            <button style={detailActionBtnStyle} onClick={() => onAddWishlist?.(m)}>➕ İstek Listesi</button>
                            <button style={detailActionBtnStyle} onClick={() => onAddWatched?.(m)}>✅ İzledim</button>
                        </div>

                        {/* Overview (taşma düzeltildi) */}
                        <div style={detailOverviewStyle}>
                            <h3 style={{margin:"0 0 8px 0"}}>Overview</h3>
                            <p
                                style={{
                                    margin:0,
                                    lineHeight:1.6,
                                    color:"rgba(255,255,255,.9)",
                                    overflowWrap: "anywhere",
                                    wordBreak: "break-word",
                                    whiteSpace: "normal",
                                }}
                            >
                                {m?.overview || credits?.overview || "No overview available."}
                            </p>
                        </div>

                        {/* Kadro (Grid + Daha Fazla) */}
                        <div style={{ marginTop: 16 }}>
                            <div style={headerRow}>
                                <span style={kadroTag}>Kadro</span>
                                {people.length > previewCount && (
                                    <button style={moreBtn} onClick={() => setShowAll(s => !s)}>
                                        {showAll ? "Daha Az Göster" : `Daha Fazla (${people.length})`}
                                    </button>
                                )}
                            </div>

                            {people.length ? (
                                <div style={gridStyle}>
                                    {visiblePeople.map((p, i) => (
                                        <PersonCard
                                            key={`${p.id ?? p.name}-${i}`}
                                            name={p.name}
                                            role={p.role}
                                            photo={p.photo}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div style={{ opacity: 0.7 }}>Bilgi yok</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
