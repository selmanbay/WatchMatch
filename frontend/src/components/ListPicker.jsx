// src/components/ListPicker.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
    // merkez modal
    listModalOverlayStyle, listModalCardStyle,
    // içerik
    listPickerHeaderStyle, listPickerBodyStyle,
    listInputRowStyle, listInputStyle,
    listEmptyTextStyle, listCloseBtnStyle,
    // satır + kutucuk
    listRowStyle, listCheckStyle, listNameStyle, listCheckIconStyle
} from "../styles/ui";
import {
    getUserLists, createList,
    addTmdbToList, addMovieToList,
    getListById, removeMovieFromList
} from "../api/movieLists";

/* === Beyaz çerçeveli + #650E0EFF paletli etkileşimli buton === */
function PrimaryButton650({ onClick, children, disabled, busy, style, ...rest }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const BASE  = "#650E0EFF";
    const HOVER = "#7A1616FF";
    const PRESS = "#4F0B0BFF";

    const bg = pressed ? PRESS : hovered ? HOVER : BASE;

    const baseStyle = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 14px",
        minHeight: 40,
        borderRadius: 12,
        userSelect: "none",
        cursor: disabled || busy ? "not-allowed" : "pointer",
        border: "1px solid rgba(255,255,255,0.95)", // ⬅️ beyaz çerçeve
        color: "#fff",
        background: bg,
        transition:
            "transform 80ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease",
        transform:
            disabled || busy ? "none" : (pressed ? "translateY(1px) scale(0.98)" : (hovered ? "translateY(-1px)" : "none")),
        boxShadow:
            disabled || busy ? "0 2px 6px rgba(0,0,0,.2)"
                : pressed ? "0 2px 8px rgba(0,0,0,.25)"
                    : hovered ? "0 6px 16px rgba(0,0,0,.35)"
                        : "0 2px 6px rgba(0,0,0,.25)",
        opacity: disabled ? 0.5 : 1,
        fontWeight: 700,
        fontSize: 14,
        ...style
    };

    return (
        <button
            type="button"
            onClick={disabled || busy ? undefined : onClick}
            onMouseEnter={() => !disabled && !busy && setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => !disabled && !busy && setPressed(true)}
            onMouseUp={() => setPressed(false)}
            aria-busy={busy || undefined}
            disabled={disabled}
            style={baseStyle}
            {...rest}
        >
            {children}
        </button>
    );
}

// ---- yardımcılar ----
const withTimeout = (p, ms = 12000) =>
    Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error("Sunucu zaman aşımına uğradı.")), ms)),
    ]);

const normalizeList = (l) => ({
    id: l?.id ?? l?.listId ?? l?.listID ?? l?.list_id ?? l?.uuid ?? l?.pk ?? null,
    name: l?.name ?? l?.listName ?? l?.list_name ?? l?.title ?? "İsimsiz",
    description: l?.description ?? l?.listDescription ?? l?.list_description ?? "",
    image: l?.listImage ?? l?.list_image ?? l?.image ?? null,
    rating: typeof l?.listRating === "number" ? l.listRating : (l?.rating ?? null),
    raw: l
});
const normalizeArray = (arr) => (Array.isArray(arr) ? arr.map(normalizeList) : []);

function pickMembership(detail, movie, fromTmdb) {
    const items = detail?.movies ?? detail?.movieList ?? detail?.items ?? detail?.contents ?? [];
    const tmdbTarget = movie?.tmdbId ?? movie?.tmdb_id ?? movie?.id;
    const dbTarget   = movie?.id;

    let matched = null;
    for (const it of items) {
        const itTmdb = it?.tmdbId ?? it?.tmdb_id ?? it?.externalId ?? null;
        const itId   = it?.id ?? it?.movieId ?? it?.movie_id ?? null;
        const ok = fromTmdb ? String(itTmdb) === String(tmdbTarget)
            : String(itId)   === String(dbTarget);
        if (ok) { matched = it; break; }
    }
    return {
        inList: Boolean(matched),
        dbMovieId: matched ? (matched.id ?? matched.movieId ?? matched.movie_id ?? null) : null
    };
}

export default function ListPicker({
                                       open, onClose, movie, userId, fromTmdb, autoClose = false
                                   }) {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [error, setError] = useState("");
    const [newName, setNewName] = useState("");

    // { [listId]: { inList: boolean, dbMovieId?: number } }
    const [membership, setMembership] = useState({});

    const refresh = useCallback(async () => {
        if (!userId) { setError("Kullanıcı bulunamadı (userId yok)."); return; }
        setError("");
        setLoading(true);
        try {
            const data = await withTimeout(getUserLists(userId));
            const normalized = normalizeArray(data);
            setLists(normalized);

            const pairs = await Promise.all(
                normalized.map(async (l) => {
                    try {
                        const detail = await withTimeout(getListById(l.id));
                        return [l.id, pickMembership(detail, movie, fromTmdb)];
                    } catch {
                        return [l.id, { inList: false }];
                    }
                })
            );
            const map = {};
            for (const [id, entry] of pairs) map[id] = entry;
            setMembership(map);
        } catch (e) {
            console.error(e);
            setError(e?.message || "Listeler alınamadı.");
        } finally {
            setLoading(false);
        }
    }, [userId, movie, fromTmdb]);

    useEffect(() => { if (open) refresh(); }, [open, refresh]);

    const doCreate = useCallback(async () => {
        const name = newName.trim();
        if (!name) { setError("Lütfen liste adını yaz."); return; }
        if (!userId) { setError("Kullanıcı bulunamadı (userId yok)."); return; }

        setError("");
        setCreating(true);
        try {
            await withTimeout(createList({ userId, name, description: `Kullanıcı listesi: ${name}` }));
            setNewName("");
            await refresh();
        } catch (e) {
            console.error(e);
            setError(e?.message || "Liste oluşturulamadı.");
        } finally {
            setCreating(false);
        }
    }, [newName, userId, refresh]);

    const onInputKeyDown = (e) => {
        if (e.key === "Enter" && !creating && newName.trim()) {
            e.preventDefault();
            doCreate();
        }
    };

    // ESC ile kapat
    useEffect(() => {
        if (!open) return;
        const onKey = (ev) => { if (ev.key === "Escape") onClose?.(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // kutucuğa tıkla → toggle
    const toggle = async (l) => {
        if (togglingId) return;
        const entry = membership[l.id] || { inList: false };
        const isSelected = entry.inList;

        setTogglingId(l.id);
        setError("");

        try {
            if (isSelected) {
                // seçiliyse KALDIR
                let dbMovieId = entry.dbMovieId;
                if (!dbMovieId) {
                    const detail = await withTimeout(getListById(l.id));
                    dbMovieId = pickMembership(detail, movie, fromTmdb).dbMovieId;
                }
                if (!dbMovieId) throw new Error("Kaldırılacak kayıt id'si bulunamadı.");
                await withTimeout(removeMovieFromList(l.id, dbMovieId));
                setMembership((m) => ({ ...m, [l.id]: { inList: false, dbMovieId: null } }));
            } else {
                // seçili değilse EKLE
                if (fromTmdb) {
                    const tmdbId = movie.tmdbId || movie.tmdb_id || movie.id;
                    await withTimeout(addTmdbToList(l.id, tmdbId));
                } else {
                    await withTimeout(addMovieToList(l.id, movie.id));
                }
                setMembership((m) => ({ ...m, [l.id]: { inList: true } }));
                if (autoClose) onClose?.();
            }
        } catch (e) {
            console.error(e);
            setError(e?.message || "İşlem başarısız.");
        } finally {
            setTogglingId(null);
        }
    };

    if (!open) return null;

    return (
        <div style={listModalOverlayStyle} onClick={onClose}>
            <div style={listModalCardStyle} onClick={(e) => e.stopPropagation()}>
                <div style={listPickerHeaderStyle}>
                    <span>🎞️ Film Listesi</span>
                    <button style={listCloseBtnStyle} onClick={onClose} aria-label="Kapat">✕</button>
                </div>

                <div style={listPickerBodyStyle}>
                    <div style={listInputRowStyle}>
                        <input
                            style={listInputStyle}
                            value={newName}
                            onChange={(e) => { setNewName(e.target.value); if (error) setError(""); }}
                            onKeyDown={onInputKeyDown}
                            placeholder="Yeni film listesi adı..."
                            maxLength={60}
                            autoFocus
                        />
                        <PrimaryButton650
                            onClick={doCreate}
                            disabled={creating || !newName.trim()}
                            busy={creating}
                            // dilersen küçük bir minWidth ver:
                            style={{ minWidth: 110 }}
                        >
                            {creating ? "..." : "Oluştur"}
                        </PrimaryButton650>
                    </div>

                    {error && <div style={{ color: "#ef4444", fontSize: 13, whiteSpace: "pre-wrap" }}>{error}</div>}

                    {loading ? (
                        <div style={listEmptyTextStyle}>Yükleniyor...</div>
                    ) : lists.length === 0 ? (
                        <div style={listEmptyTextStyle}>Hiç listen yok. Hemen bir tane oluştur!</div>
                    ) : (
                        lists.map((l) => {
                            const entry = membership[l.id] || { inList: false };
                            const selected = entry.inList;
                            const busy = togglingId === l.id;

                            return (
                                <div
                                    key={l.id ?? l.raw?.id ?? l.raw?.listId}
                                    style={{ ...listRowStyle, ...(busy && { opacity: 0.6, pointerEvents: "none" }) }}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggle(l)}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(l); } }}
                                        aria-pressed={selected}
                                        aria-label={selected ? "Listeden çıkar" : "Listeye ekle"}
                                        style={listCheckStyle(selected)}
                                    >
                                        {selected && (
                                            <svg style={listCheckIconStyle} viewBox="0 0 24 24" fill="none" aria-hidden>
                                                <path
                                                    d="M20 6L9 17l-5-5"
                                                    stroke="#dc2626"
                                                    strokeWidth="3.2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Ad */}
                                    <div style={listNameStyle}>{l.name}</div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
