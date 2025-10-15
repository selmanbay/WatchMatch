// src/components/ListPicker.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
    listModalOverlayStyle, listModalCardStyle,
    listPickerHeaderStyle, listPickerBodyStyle,
    listInputRowStyle, listInputStyle,
    listEmptyTextStyle, listCloseBtnStyle,
    listRowStyle, listCheckStyle, listNameStyle, listCheckIconStyle
} from "../styles/ui";

const API = process.env.REACT_APP_API_BASE || "http://localhost:8080";

/* ---------- Modern Gradient Button ---------- */
function ModernButton({ onClick, children, disabled, loading, variant = "primary", size = "md", ...props }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const variants = {
        primary: {
            base: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            hover: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
            shadow: "0 8px 25px rgba(102, 126, 234, 0.4)"
        },
        secondary: {
            base: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            hover: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
            shadow: "0 8px 25px rgba(245, 87, 108, 0.4)"
        },
        success: {
            base: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            hover: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
            shadow: "0 8px 25px rgba(79, 172, 254, 0.4)"
        }
    };

    const sizes = {
        sm: { padding: "8px 16px", fontSize: "13px", minHeight: "36px" },
        md: { padding: "12px 24px", fontSize: "14px", minHeight: "44px" },
        lg: { padding: "16px 32px", fontSize: "16px", minHeight: "52px" }
    };

    const currentVariant = variants[variant];
    const currentSize = sizes[size];

    return (
        <button
            onClick={disabled || loading ? undefined : onClick}
            onMouseEnter={() => !disabled && !loading && setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
            onMouseDown={() => !disabled && !loading && setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            disabled={disabled || loading}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: "none",
                borderRadius: "12px",
                color: "#ffffff",
                fontWeight: "600",
                cursor: disabled || loading ? "not-allowed" : "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                background: disabled
                    ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                    : currentVariant.base,
                boxShadow: disabled || loading
                    ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                    : isHovered
                        ? `${currentVariant.shadow}, 0 12px 40px rgba(0, 0, 0, 0.2)`
                        : "0 6px 20px rgba(0, 0, 0, 0.15)",
                transform: disabled || loading
                    ? "none"
                    : isPressed
                        ? "translateY(2px) scale(0.98)"
                        : isHovered
                            ? "translateY(-2px) scale(1.02)"
                            : "translateY(0) scale(1)",
                opacity: disabled ? 0.6 : 1,
                ...currentSize,
                ...props.style
            }}
            {...props}
        >
            {loading && (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                        animation: "spin 1s linear infinite"
                    }}
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="31.416"
                        strokeDashoffset="31.416"
                        style={{
                            animation: "spin 2s linear infinite"
                        }}
                    />
                </svg>
            )}
                {children}
                <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
}

/* ---------- Modern Input Component ---------- */
function ModernInput({
                         value,
                         onChange,
                         placeholder,
                         error,
                         icon,
                         maxLength,
                         onKeyDown,
                         ...props
                     }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(20px)",
                    border: `2px solid ${error ? '#ef4444' : isFocused ? '#667eea' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: "16px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isFocused
                        ? "0 8px 25px rgba(102, 126, 234, 0.25)"
                        : "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
            >
                {icon && (
                    <div style={{
                        padding: "0 16px",
                        color: isFocused ? '#667eea' : 'rgba(255, 255, 255, 0.6)'
                    }}>
                        {icon}
                    </div>
                )}
                <input
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    style={{
                        flex: 1,
                        padding: "16px",
                        paddingLeft: icon ? "0" : "16px",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#ffffff",
                        fontSize: "16px",
                        fontWeight: "500",
                        "::placeholder": {
                            color: "rgba(255, 255, 255, 0.6)"
                        }
                    }}
                    {...props}
                />
            </div>
            {error && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    right: "0",
                    marginTop: "8px",
                    padding: "8px 16px",
                    background: "rgba(239, 68, 68, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "12px",
                    color: "#ef4444",
                    fontSize: "14px",
                    fontWeight: "500"
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}

/* ---------- Helpers ---------- */
const withTimeout = (p, ms = 15000) =>
    Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error("İstek zaman aşımına uğradı")), ms)),
    ]);

async function safeFetch(url, init) {
    try {
        console.log(`🚀 API: ${init?.method || 'GET'} ${url}`);

        const res = await fetch(url, {
            ...init,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...init?.headers
            }
        });

        console.log(`📡 Yanıt: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            const errorText = await res.text().catch(() => "");
            console.error(`❌ API Hatası: ${res.status} - ${errorText}`);
            throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
        }

        const contentType = res.headers.get("content-type") || "";
        const result = contentType.includes("application/json") ? await res.json() : await res.text();
        console.log('✅ Sonuç:', result);
        return result;

    } catch (error) {
        console.error('💥 Fetch Hatası:', error);
        throw error;
    }
}

// Liste normalize
const normalizeList = (l) => ({
    id: l?.id ?? l?.listId ?? l?.list_id ?? l?.uuid ?? l?.pk ?? null,
    name: l?.name ?? l?.listName ?? l?.list_name ?? l?.title ?? "İsimsiz Liste",
    image: l?.image ?? l?.listImage ?? l?.list_image ?? null,
    description: l?.description ?? l?.listDescription ?? l?.list_description ?? null,
    raw: l
});

const normalizeArray = (arr) => (Array.isArray(arr) ? arr.map(normalizeList) : []);

// Üyelik tespiti
function pickMembership(detail, movie, opts) {
    const items = detail?.movies ?? detail?.movieList ?? detail?.items ?? detail?.contents ?? [];
    const tmdbTarget = opts.tmdbId ?? movie?.tmdbId ?? movie?.tmdb_id ?? (opts.fromTmdb ? movie?.id : null);
    const dbTarget = opts.dbMovieId ?? movie?.movieId ?? movie?.movie_id ?? movie?.id;
    let matched = null;

    for (const it of items) {
        const itTmdb = it?.tmdbId ?? it?.tmdb_id ?? it?.externalId ?? null;
        const itId = it?.id ?? it?.movieId ?? it?.movie_id ?? null;
        const ok = opts.fromTmdb
            ? (itTmdb != null && String(itTmdb) === String(tmdbTarget))
            : (itId != null && String(itId) === String(dbTarget));
        if (ok) {
            matched = it;
            break;
        }
    }

    return {
        inList: Boolean(matched),
        dbMovieId: matched ? (matched.id ?? matched.movieId ?? matched.movie_id ?? null) : null
    };
}

export default function ListPicker({
                                       open,
                                       onClose,
                                       userId,
                                       movie,
                                       fromTmdb,
                                       tmdbId,
                                       dbMovieId,
                                       autoClose = false
                                   }) {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [error, setError] = useState("");
    const [newName, setNewName] = useState("");
    const [membership, setMembership] = useState({});

    // Kesin id seçimleri
    const normalizedTmdb = tmdbId ?? movie?.tmdbId ?? movie?.tmdb_id ?? movie?.externalId ?? null;
    const effective = {
        tmdbId: normalizedTmdb != null && !Number.isNaN(Number(normalizedTmdb))
            ? Number(normalizedTmdb)
            : (fromTmdb ? Number(movie?.id) || null : null),
        dbMovieId: dbMovieId ?? movie?.movieId ?? movie?.movie_id ?? null,
        fromTmdb: Boolean(typeof fromTmdb === "boolean" ? fromTmdb : (normalizedTmdb != null || Number(movie?.id)))
    };

    const loadLists = useCallback(async () => {
        if (!open || !userId) return;

        setLoading(true);
        setError("");

        try {
            console.log('📋 Listeler yükleniyor, userId:', userId);
            const data = await withTimeout(
                safeFetch(`${API}/api/movie-lists/user/${userId}`, {
                    method: 'GET'
                })
            );

            const arr = normalizeArray(Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []));
            console.log('📋 Yüklenen listeler:', arr);
            setLists(arr);

            // Her liste için üyelik durumunu kontrol et
            const membershipPromises = arr.map(async (l) => {
                try {
                    const detail = await withTimeout(
                        safeFetch(`${API}/api/movie-lists/${l.id}`, { method: 'GET' })
                    );
                    return [l.id, pickMembership(detail, movie, effective)];
                } catch (err) {
                    console.error(`❌ Liste ${l.id} detayı alınamadı:`, err);
                    return [l.id, { inList: false }];
                }
            });

            const pairs = await Promise.allSettled(membershipPromises);
            const map = {};

            for (const result of pairs) {
                if (result.status === 'fulfilled') {
                    const [id, entry] = result.value;
                    map[id] = entry;
                }
            }

            console.log('✅ Üyelik durumu:', map);
            setMembership(map);

        } catch (e) {
            console.error('💥 Liste yükleme hatası:', e);
            setLists([]);
            setError(e?.message || "Listeler yüklenemedi");
        } finally {
            setLoading(false);
        }
    }, [open, userId, movie, effective.tmdbId, effective.dbMovieId, effective.fromTmdb]);

    useEffect(() => {
        loadLists();
    }, [loadLists]);

    // DÜZELTME: Backend'in beklediği tam format
    const doCreate = useCallback(async () => {
        const name = newName.trim();
        if (!name) {
            setError("Liste adını yazmalısınız");
            return;
        }
        if (!userId) {
            setError("Kullanıcı kimliği bulunamadı");
            return;
        }

        setError("");
        setCreating(true);

        try {
            console.log('🎬 Yeni liste oluşturuluyor:', { name, userId });

            // Backend'in beklediği format - NULL değerler yerine boş string veya varsayılan değerler
            const listData = {
                name: name,
                description: `Film listesi: ${name}`,
                list_image: "default.jpg", // NOT NULL constraint için varsayılan değer
                list_rating: 0.0, // Varsayılan rating
                list_type: "USER", // Varsayılan tip
                is_is_showshow: true, // Varsayılan görünürlük
                user: { id: parseInt(userId) } // userId'yi integer'a çevir
            };

            await withTimeout(safeFetch(`${API}/api/movie-lists`, {
                method: "POST",
                body: JSON.stringify(listData)
            }));

            setNewName("");
            await loadLists();

        } catch (e) {
            console.error('💥 Liste oluşturma hatası:', e);
            setError(e?.message || "Liste oluşturulamadı");
        } finally {
            setCreating(false);
        }
    }, [newName, userId, loadLists]);

    // Toggle (ekle / kaldır)
    const toggle = async (l) => {
        if (togglingId) return;

        const entry = membership[l.id] || { inList: false };
        const isSelected = entry.inList;

        setTogglingId(l.id);
        setError("");

        try {
            console.log(`${isSelected ? '➖' : '➕'} ${isSelected ? 'Kaldırılıyor' : 'Ekleniyor'} - Liste: ${l.name}`);

            if (isSelected) {
                // KALDIR
                let idForDelete = entry.dbMovieId;

                if (!idForDelete) {
                    const detail = await withTimeout(
                        safeFetch(`${API}/api/movie-lists/${l.id}`, { method: 'GET' })
                    );
                    idForDelete = pickMembership(detail, movie, effective).dbMovieId;
                }

                if (!idForDelete) {
                    throw new Error("Kaldırılacak film bulunamadı");
                }

                await withTimeout(
                    safeFetch(`${API}/api/movie-lists/${l.id}/movies/${idForDelete}`, {
                        method: "DELETE"
                    })
                );

                setMembership((m) => ({ ...m, [l.id]: { inList: false, dbMovieId: null } }));

            } else {
                // EKLE
                if (effective.tmdbId != null) {
                    await withTimeout(
                        safeFetch(`${API}/api/movie-lists/${l.id}/tmdb/${effective.tmdbId}`, {
                            method: "POST"
                        })
                    );
                } else if (effective.dbMovieId != null) {
                    await withTimeout(
                        safeFetch(`${API}/api/movie-lists/${l.id}/movies/${effective.dbMovieId}`, {
                            method: "POST"
                        })
                    );
                } else {
                    throw new Error("Film kimliği bulunamadı");
                }

                setMembership((m) => ({ ...m, [l.id]: { inList: true } }));

                if (autoClose) onClose?.();
            }

            // Liste değişikliği event'i
            window.dispatchEvent(new CustomEvent("wm:list-changed", {
                detail: { listId: l.id, action: isSelected ? 'remove' : 'add' }
            }));

        } catch (e) {
            console.error('💥 Toggle hatası:', e);
            setError(e?.message || "İşlem başarısız");
        } finally {
            setTogglingId(null);
        }
    };

    if (!open) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(20px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
                animation: "fadeIn 0.3s ease-out"
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(60, 60, 60, 0.95) 100%)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "24px",
                    padding: "32px",
                    width: "100%",
                    maxWidth: "500px",
                    maxHeight: "80vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
                    animation: "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "32px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "32px" }}>🎬</span>
                        <h2 style={{
                            margin: 0,
                            color: "#ffffff",
                            fontSize: "24px",
                            fontWeight: "700",
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                            Film Listelerim
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "none",
                            borderRadius: "50%",
                            width: "44px",
                            height: "44px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#ffffff",
                            fontSize: "20px",
                            fontWeight: "bold",
                            transition: "all 0.3s ease",
                            backdropFilter: "blur(10px)"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.2)";
                            e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.1)";
                            e.target.style.transform = "scale(1)";
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Content */}
                <div style={{
                    flex: 1,
                    overflow: "auto",
                    marginRight: "-8px",
                    paddingRight: "8px"
                }}>
                    {/* Yeni liste oluştur */}
                    <div style={{
                        display: "flex",
                        gap: "16px",
                        marginBottom: "32px",
                        alignItems: "flex-start"
                    }}>
                        <ModernInput
                            value={newName}
                            onChange={(e) => {
                                setNewName(e.target.value);
                                if (error) setError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !creating && newName.trim()) {
                                    e.preventDefault();
                                    doCreate();
                                }
                            }}
                            placeholder="Yeni liste adı yazın..."
                            maxLength={60}
                            error={error}
                            icon={<span>📝</span>}
                            autoFocus
                        />
                        <ModernButton
                            onClick={doCreate}
                            disabled={creating || !newName.trim()}
                            loading={creating}
                            variant="success"
                            size="lg"
                            style={{ minWidth: "120px" }}
                        >
                            Oluştur
                        </ModernButton>
                    </div>

                    {/* Liste satırları */}
                    {loading ? (
                        <div style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: "16px"
                        }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                border: "4px solid rgba(255, 255, 255, 0.2)",
                                borderTop: "4px solid #667eea",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                                margin: "0 auto 16px"
                            }}></div>
                            Listeleriniz yükleniyor...
                        </div>
                    ) : lists.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: "16px"
                        }}>
                            <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>🎭</span>
                            Henüz hiç listeniz yok<br />
                            Hemen bir tane oluşturun!
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {lists.map((l) => {
                                const entry = membership[l.id] || { inList: false };
                                const selected = entry.inList;
                                const busy = togglingId === l.id;

                                return (
                                    <div
                                        key={l.id ?? l.raw?.id ?? l.raw?.listId}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "16px",
                                            padding: "20px",
                                            background: selected
                                                ? "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)"
                                                : "rgba(255, 255, 255, 0.05)",
                                            backdropFilter: "blur(20px)",
                                            border: `2px solid ${selected ? 'rgba(102, 126, 234, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                                            borderRadius: "16px",
                                            cursor: busy ? "wait" : "pointer",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            opacity: busy ? 0.7 : 1,
                                            transform: busy ? "scale(0.98)" : "scale(1)",
                                            boxShadow: selected
                                                ? "0 8px 25px rgba(102, 126, 234, 0.3)"
                                                : "0 4px 12px rgba(0, 0, 0, 0.2)"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!busy) {
                                                e.currentTarget.style.transform = "scale(1.02)";
                                                e.currentTarget.style.boxShadow = selected
                                                    ? "0 12px 40px rgba(102, 126, 234, 0.4)"
                                                    : "0 8px 25px rgba(255, 255, 255, 0.1)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!busy) {
                                                e.currentTarget.style.transform = "scale(1)";
                                                e.currentTarget.style.boxShadow = selected
                                                    ? "0 8px 25px rgba(102, 126, 234, 0.3)"
                                                    : "0 4px 12px rgba(0, 0, 0, 0.2)";
                                            }
                                        }}
                                        onClick={() => !busy && toggle(l)}
                                    >
                                        {/* Checkbox */}
                                        <div
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                borderRadius: "8px",
                                                border: `2px solid ${selected ? '#667eea' : 'rgba(255, 255, 255, 0.3)'}`,
                                                background: selected
                                                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                                                    : "transparent",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.3s ease",
                                                flexShrink: 0
                                            }}
                                        >
                                            {busy ? (
                                                <div style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    border: "2px solid rgba(255, 255, 255, 0.3)",
                                                    borderTop: "2px solid #ffffff",
                                                    borderRadius: "50%",
                                                    animation: "spin 1s linear infinite"
                                                }}></div>
                                            ) : selected ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M20 6L9 17l-5-5"
                                                        stroke="#ffffff"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            ) : null}
                                        </div>

                                        {/* Liste İsmi */}
                                        <div style={{
                                            flex: 1,
                                            color: "#ffffff",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            textAlign: "left"
                                        }}>
                                            {l.name}
                                        </div>

                                        {/* Status İkonu */}
                                        <div style={{
                                            color: selected ? "#4ade80" : "rgba(255, 255, 255, 0.5)",
                                            fontSize: "20px",
                                            flexShrink: 0
                                        }}>
                                            {selected ? "✓" : "+"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from { 
                        opacity: 0;
                        transform: translateY(30px) scale(0.9);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Custom Scrollbar */
                *::-webkit-scrollbar {
                    width: 8px;
                }

                *::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }

                *::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 4px;
                }

                *::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #764ba2, #667eea);
                }

                /* Input placeholder styling */
                input::placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
            `}</style>
        </div>
    );
}