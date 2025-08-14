// src/components/ListPicker.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
    listPickerStyle, listPickerHeaderStyle, listPickerBodyStyle,
    listInputRowStyle, listInputStyle, listCreateBtnStyle,
    listItemStyle, listEmptyTextStyle, listCloseBtnStyle
} from "../styles/ui";
import {
    getUserLists, createList,
    addTmdbToList, addMovieToList,
    getListById,              // ⬅️ yeni: liste detayını çekmek için
    removeMovieFromList       // ⬅️ kaldırma için
} from "../api/movieLists";

// --- Helpers: API'den gelen alanları tek biçime çevir ---
const normalizeList = (l) => ({
    id:
        l?.id ??
        l?.listId ??
        l?.listID ??
        l?.list_id ??
        l?.uuid ??
        l?.pk ??
        null,
    name:
        l?.name ??
        l?.listName ??
        l?.list_name ??
        l?.title ??
        "İsimsiz",
    description:
        l?.description ??
        l?.listDescription ??
        l?.list_description ??
        "",
    image: l?.listImage ?? l?.list_image ?? l?.image ?? null,
    rating: typeof l?.listRating === "number" ? l.listRating : (l?.rating ?? null),
    raw: l
});
const normalizeArray = (arr) => (Array.isArray(arr) ? arr.map(normalizeList) : []);

// liste detayındaki movies alanından, bu film o listede mi ve kaldırmak için DB movieId nedir tespit et
function pickMembership(detail, movie, fromTmdb) {
    const items =
        detail?.movies ??
        detail?.movieList ??
        detail?.items ??
        detail?.contents ??
        [];

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
                                       open,
                                       onClose,
                                       movie,
                                       userId,
                                       fromTmdb,
                                       autoClose = true // başarıdan sonra kapatma davranışı
                                   }) {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [addingId, setAddingId] = useState(null);
    const [tempAdded, setTempAdded] = useState(null); // “✓ Eklendi”
    const [error, setError] = useState("");
    const [newName, setNewName] = useState("");

    // { [listId]: { inList: boolean, dbMovieId?: number } }
    const [membership, setMembership] = useState({});
    const [hoveredId, setHoveredId] = useState(null);

    // listeleri getir + her liste için üyelik durumunu çıkar
    const refresh = useCallback(async () => {
        if (!userId) { setError("Kullanıcı bulunamadı (userId yok)."); return; }
        setError("");
        setLoading(true);
        try {
            const data = await getUserLists(userId);
            const normalized = normalizeArray(data);
            setLists(normalized);

            // her liste için detay çekip üyelik durumunu belirle
            const pairs = await Promise.all(
                normalized.map(async (l) => {
                    try {
                        const detail = await getListById(l.id);
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

    useEffect(() => {
        if (!open) return;
        refresh();
    }, [open, refresh]);

    const doCreate = useCallback(async () => {
        const name = newName.trim();
        if (!name) { setError("Lütfen liste adını yaz."); return; }
        if (!userId) { setError("Kullanıcı bulunamadı (userId yok)."); return; }

        setError("");
        setCreating(true);
        try {
            await createList({
                userId,
                name,
                description: `Kullanıcı listesi: ${name}` // NOT NULL için
            });
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

    // Ekle / (üyeyse) kaldır
    const handleToggle = async (l) => {
        const entry = membership[l.id] || { inList: false };
        const isIn  = entry.inList;

        if (addingId) return; // aynı anda iki işlem olmasın

        // Üyeyse → kaldırmadan önce sor
        if (isIn) {
            const ok = window.confirm(`“${l.name}” adlı listeden kaldırmak istiyor musun?`);
            if (!ok) return;

            setAddingId(l.id);
            try {
                // dbMovieId yoksa bir kez daha detay çekip bul
                let dbMovieId = entry.dbMovieId;
                if (!dbMovieId) {
                    const detail = await getListById(l.id);
                    dbMovieId = pickMembership(detail, movie, fromTmdb).dbMovieId;
                }
                if (!dbMovieId) throw new Error("Kaldırılacak kayıt id'si bulunamadı.");

                await removeMovieFromList(l.id, dbMovieId);
                setMembership((m) => ({ ...m, [l.id]: { inList: false, dbMovieId: null } }));
            } catch (e) {
                console.error(e);
                setError(e?.message || "Listeden çıkarılamadı.");
            } finally {
                setAddingId(null);
            }
            return;
        }

        // Üye değilse → ekle
        setError("");
        setAddingId(l.id);
        try {
            if (fromTmdb) {
                const tmdbId = movie.tmdbId || movie.tmdb_id || movie.id;
                await addTmdbToList(l.id, tmdbId);
            } else {
                await addMovieToList(l.id, movie.id);
            }

            setTempAdded(l.id);
            setTimeout(() => setTempAdded(null), 1200);
            setMembership((m) => ({ ...m, [l.id]: { inList: true } }));

            if (autoClose) onClose?.();
        } catch (e) {
            console.error(e);
            const msg = String(e?.message || "");
            if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("duplicate")) {
                setError("Bu film zaten bu listede 👌");
            } else {
                setError(msg || "Listeye eklenemedi.");
            }
        } finally {
            setAddingId(null);
        }
    };

    if (!open) return null;

    return (
        <div style={listPickerStyle} onClick={(e) => e.stopPropagation()}>
            <div style={listPickerHeaderStyle}>
                <span>🎞️ Film Listesi</span>
                <button style={listCloseBtnStyle} onClick={onClose} aria-label="Kapat">✕</button>
            </div>

            <div style={listPickerBodyStyle}>
                <div style={listInputRowStyle}>
                    <input
                        style={listInputStyle}
                        value={newName}
                        onChange={(e) => {
                            setNewName(e.target.value);
                            if (error) setError("");
                        }}
                        onKeyDown={onInputKeyDown}
                        placeholder="Yeni film listesi adı..."
                        maxLength={60}
                    />
                    <button
                        style={listCreateBtnStyle}
                        onClick={doCreate}
                        disabled={creating || !newName.trim()}
                        aria-busy={creating}
                    >
                        {creating ? "..." : "Oluştur"}
                    </button>
                </div>

                {error && (
                    <div style={{ color: "#ef4444", fontSize: 13, whiteSpace: "pre-wrap" }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={listEmptyTextStyle}>Yükleniyor...</div>
                ) : lists.length === 0 ? (
                    <div style={listEmptyTextStyle}>Hiç listen yok. Hemen bir tane oluştur!</div>
                ) : (
                    lists.map((l) => {
                        const disabled = Boolean(addingId);
                        const entry = membership[l.id] || { inList: false };
                        const isIn  = entry.inList;
                        const showMinus = isIn && hoveredId === l.id;
                        const icon = showMinus ? "−" : "+";
                        const label =
                            addingId === l.id ? "⏳ İşleniyor..." :
                                tempAdded === l.id ? "✓ Eklendi" :
                                    `${icon} ${l.name}`;

                        return (
                            <button
                                key={l.id ?? l.raw?.id ?? l.raw?.listId}
                                style={{
                                    ...listItemStyle,
                                    ...(disabled && { opacity: 0.6, cursor: "not-allowed" })
                                }}
                                onMouseEnter={() => setHoveredId(l.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => !disabled && handleToggle(l)}
                                disabled={disabled}
                                aria-busy={addingId === l.id}
                                title={isIn ? "Bu listeden kaldır" : "Bu listeye ekle"}
                            >
                                {label}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
