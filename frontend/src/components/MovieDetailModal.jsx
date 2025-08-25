// src/components/MovieDetailModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    detailOverlayStyle, detailContainerStyle, detailHeaderStyle, detailHeaderShadeStyle,
    detailCloseBtnStyle, detailBodyStyle, detailPosterLargeStyle,
    detailTitleStyle, detailMetaRowStyle, userScorePillStyle,
    detailOverviewStyle, chipRowStyle, chipStyle
} from "../styles/ui";
import ListPicker from "./ListPicker";
import { ThumbsUp, ThumbsDown } from "lucide-react";

/* ===== Görsel URL yardımcıları ===== */
const API        = process.env.REACT_APP_API_BASE || "http://localhost:8080";
const TMDB_W185  = "https://image.tmdb.org/t/p/w185";
const TMDB_W300  = "https://image.tmdb.org/t/p/w300";
const TMDB_W780  = "https://image.tmdb.org/t/p/w780";
const TMDB_W1280 = "https://image.tmdb.org/t/p/w1280";

const toAbs = (url) =>
    url && typeof url === "string" && url.startsWith("/uploads/") ? `${API}${url}` : url;

const resolvePosterUrl = (p) => {
    if (!p) return null;
    const s = String(p);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.startsWith("/uploads/")) return `${API}${s}`;
    if (s.startsWith("/")) return `${TMDB_W300}${s}`; // poster için ideal
    return s;
};

const resolveBackdropUrl = ({ backdrop_path, poster_path, anyPathOrUrl }) => {
    // 1) TMDb backdrop varsa: w1280
    if (backdrop_path && String(backdrop_path).startsWith("/")) return `${TMDB_W1280}${backdrop_path}`;
    // 2) TMDb poster fallback: w780 (geniş alanda yeterli keskinlik)
    if (poster_path && String(poster_path).startsWith("/")) return `${TMDB_W780}${poster_path}`;
    // 3) DB/Uploads/HTTP fallback
    if (!anyPathOrUrl) return null;
    const s = String(anyPathOrUrl);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/uploads/")) return `${API}${s}`;
    if (s.startsWith("/")) return `${TMDB_W780}${s}`;
    return s;
};

const resolveProfileUrl = (p) => {
    if (!p) return null;
    const s = String(p);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/uploads/")) return `${API}${s}`;
    if (s.startsWith("/")) return `${TMDB_W185}${s}`;
    return s;
};

/* === Etkileşimli buton === */
function ActionButton({ onClick, children, style }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const BASE  = "#650E0E";
    const HOVER = "#7A1616";
    const PRESS = "#4F0B0B";

    const base = {
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px 16px", borderRadius: 12, userSelect: "none", cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.95)", color: "#fff",
        background: pressed ? PRESS : hovered ? HOVER : BASE,
        transition: "transform 80ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease",
        transform: pressed ? "translateY(1px) scale(0.98)" : hovered ? "translateY(-1px)" : "none",
        boxShadow: pressed ? "0 2px 8px rgba(0,0,0,.25)" : hovered ? "0 6px 16px rgba(0,0,0,.35)" : "0 2px 6px rgba(0,0,0,.25)",
        outline: "none", fontWeight: 800, fontSize: 16, letterSpacing: 0.2, ...style
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

/* === Kişi kartı === */
function PersonCard({ name, role, photo }) {
    const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const card = {
        width: "100%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column"
    };
    const imgBox = {
        width: "100%", aspectRatio: "2 / 3", background: "rgba(0,0,0,.35)",
        display: "grid", placeItems: "center", fontWeight: 800, fontSize: 22, letterSpacing: 1
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

/* === Grid === */
function PeopleGrid({ people = [] }) {
    if (!people.length) return <div style={{ opacity: 0.7 }}>Bilgi yok</div>;
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
            {people.map((p, i) => (
                <PersonCard key={`${p.id ?? p.name}-${i}`} name={p.name} role={p.role} photo={p.photo} />
            ))}
        </div>
    );
}

/* === İnce buton === */
function GhostButton({ onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.7)",
                background: "transparent", color: "#fff", cursor: "pointer"
            }}
        >
            {children}
        </button>
    );
}

export default function MovieDetailModal({ open, onClose, movie, fromTmdb, userId }) {
    const m = movie || {};

    /* Poster */
    const posterCandidate =
        m.posterResolved || m.posterUrl || m.poster || m.image || m.cover || m.coverUrl ||
        (fromTmdb ? m.poster_path : null) || m.poster_path;
    const poster = resolvePosterUrl(toAbs(posterCandidate));

    /* Backdrop — yüksek çözünürlük */
    const backdrop = resolveBackdropUrl({
        backdrop_path: fromTmdb ? m.backdrop_path : (m.backdrop_path || m.tmdbBackdrop),
        poster_path:   fromTmdb ? m.poster_path   : (m.poster_path   || m.tmdbPoster),
        anyPathOrUrl:  posterCandidate
    });

    const title   = m?.title || m?.name || "Untitled";
    const release = fromTmdb ? (m?.release_date || m?.first_air_date || "") : (m?.releaseYear || "");

    const score = useMemo(() => {
        const v = fromTmdb ? Number(m?.vote_average) : Number(m?.rating);
        if (Number.isNaN(v)) return null;
        return Math.round(Math.max(0, Math.min(10, v)) * 10);
    }, [fromTmdb, m]);

    /* Krediler */
    const [credits, setCredits] = useState(m?._credits || null);
    useEffect(() => { setCredits(m?._credits || null); }, [m]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!m?.id && !m?.tmdbId) return;

            // 1) DB MovieFeatures (isim listeleri gelebilir; foto yok)
            if (!credits && m?.id) {
                try {
                    const dbRes = await fetch(`${API}/api/movie-features/${m.id}`);
                    if (dbRes.ok) {
                        const dbData = await dbRes.json();
                        if (!cancelled && dbData && (dbData.directorNames || dbData.actorNames)) {
                            setCredits((prev) => prev || dbData);
                        }
                    }
                } catch {}
            }

            // 2) TMDb Credits (m.tmdbId varsa, fromTmdb olmasa bile foto al)
            const tmdbId = fromTmdb ? m?.id : (m?.tmdbId || null);
            if (tmdbId) {
                try {
                    const res = await fetch(`${API}/api/tmdb/movie/${tmdbId}/credits?language=tr-TR`);
                    if (res.ok) {
                        const data = await res.json();
                        if (!cancelled && data) {
                            setCredits((prev) => ({
                                ...(prev || {}),
                                tmdbCrew: data.crew,
                                tmdbCast: data.cast
                            }));
                        }
                    }
                } catch {}
            }
        }

        load();
        return () => { cancelled = true; };
    }, [credits, fromTmdb, m]);

    /* Kişi/foto derleme */
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
        .map(c => ({ id: c?.id, name: c?.name || c?.original_name, role: "Yönetmen", photo: resolveProfileUrl(c?.profile_path) }));

    const actorsFromCast = tmdbCast
        .slice(0, 30)
        .map(c => ({ id: c?.id, name: c?.name || c?.original_name, role: "Oyuncu", photo: resolveProfileUrl(c?.profile_path) }));

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

    /* Toggle */
    const [showAllPeople, setShowAllPeople] = useState(false);
    const VISIBLE_COUNT = 6;
    const visiblePeople = showAllPeople ? people : people.slice(0, VISIBLE_COUNT);

    /* ListPicker */
    const [showListPicker, setShowListPicker] = useState(false);
    const openListPicker = () => {
        if (!userId) {
            alert("Film Listesi için giriş yapmış olmalısınız.");
            return;
        }
        setShowListPicker(true);
    };

    /* Reaksiyon */
    const [reaction, setReaction] = useState(null); // 'like' | 'dislike' | null
    const likeActive = reaction === "like";
    const dislikeActive = reaction === "dislike";
    const handleLike = (e) => { e.stopPropagation(); setReaction((r) => (r === "like" ? null : "like")); };
    const handleDislike = (e) => { e.stopPropagation(); setReaction((r) => (r === "dislike" ? null : "dislike")); };

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

                        {/* Eylemler */}
                        <div style={detailOverviewStyle}>
                            <ActionButton onClick={openListPicker} style={{ width: "100%" }}>
                                + Ekle
                            </ActionButton>

                            <div style={{ display: "flex", marginTop: 10 }}>
                                <ActionButton
                                    onClick={handleLike}
                                    style={{
                                        flex: 1,
                                        borderTopRightRadius: 0, borderBottomRightRadius: 0,
                                        background: likeActive ? "rgba(34,197,94,0.18)" : undefined,
                                        borderColor: likeActive ? "rgba(34,197,94,0.5)" : undefined,
                                        color: likeActive ? "#22c55e" : undefined
                                    }}
                                >
                                    <ThumbsUp size={18} /> Beğen
                                </ActionButton>

                                <ActionButton
                                    onClick={handleDislike}
                                    style={{
                                        flex: 1,
                                        borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: 0,
                                        background: dislikeActive ? "rgba(239,68,68,0.18)" : undefined,
                                        borderColor: dislikeActive ? "rgba(239,68,68,0.5)" : undefined,
                                        color: dislikeActive ? "#ef4444" : undefined
                                    }}
                                >
                                    <ThumbsDown size={18} /> Beğenme
                                </ActionButton>
                            </div>
                        </div>

                        {/* Overview */}
                        <div style={detailOverviewStyle}>
                            <h3 style={{margin:"0 0 8px 0"}}>Overview</h3>
                            <p style={{margin:0, lineHeight:1.6, color:"rgba(255,255,255,.9)"}}>
                                {m?.overview || credits?.overview || "No overview available."}
                            </p>
                        </div>

                        {/* Kadro */}
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
