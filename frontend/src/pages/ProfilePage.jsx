// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Upload, ArrowLeft, Film, Heart, Eye, Edit3 } from "lucide-react";
import { uploadListCover } from "../api/movieLists";
import { pickPoster } from "../utils/images";

const API  = process.env.REACT_APP_API_BASE || "http://localhost:8080";
const TMDB = "https://image.tmdb.org/t/p/w342";

// /uploads/... mutlaklaştır
const toAbs = (url) =>
    url && typeof url === "string" && url.startsWith("/uploads/") ? `${API}${url}` : url;

// Her türlü poster/kapak yolunu mutlak görsel URL’ine çevir
function resolvePosterUrl(p) {
    if (!p) return null;
    const s = String(p);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.startsWith("/uploads/")) return `${API}${s}`;
    if (s.startsWith("/")) return `${TMDB}${s}`; // TMDB poster_path gibi
    return s;
}

// Film objesini normalize et (title/year + posterResolved)
function normalizeMovie(m = {}) {
    const posterCand =
        m.poster || m.posterUrl || m.image || m.cover || m.coverUrl || m.poster_path;

    const title =
        m.title || m.name || m.original_title || m.original_name || "Untitled";

    const year =
        m.releaseYear ||
        (m.release_date ? String(m.release_date).slice(0, 4) : "") ||
        (m.first_air_date ? String(m.first_air_date).slice(0, 4) : "");

    return { ...m, title, year, posterResolved: resolvePosterUrl(posterCand) };
}

/* ---------------- Ortak buton ---------------- */
function ModernButton({
                          variant = "primary",
                          size = "md",
                          children,
                          className = "",
                          onClick,
                          style = {},
                          ...rest
                      }) {
    const baseStyles = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: 500,
        borderRadius: "12px",
        transition: "all 0.2s ease",
        cursor: "pointer",
        border: "none",
        outline: "none",
    };

    const variants = {
        primary: {
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            color: "white",
            boxShadow: "0 4px 14px 0 rgba(220, 38, 38, 0.3)",
        },
        secondary: {
            background: "#374151",
            color: "white",
            border: "1px solid #4b5563",
        },
        glass: {
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.2)",
        },
    };

    const sizes = {
        sm: { padding: "6px 12px", fontSize: "14px" },
        md: { padding: "8px 16px", fontSize: "16px" },
        lg: { padding: "12px 24px", fontSize: "18px" },
    };

    const buttonStyle = {
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        ...style,
    };

    return (
        <button type="button" style={buttonStyle} onClick={onClick} className={className} {...rest}>
            {children}
        </button>
    );
}

/* ---------------- İstatistik kartı ---------------- */
function StatCard({ icon: Icon, label, value, gradient = "#3b82f6, #1d4ed8" }) {
    const cardStyle = {
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "all 0.3s ease",
        textAlign: "center",
    };

    const iconContainerStyle = {
        width: "56px",
        height: "56px",
        borderRadius: "14px",
        background: `linear-gradient(135deg, ${gradient})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
    };

    return (
        <div style={cardStyle}>
            <div style={iconContainerStyle}>{Icon ? <Icon size={28} color="white" /> : null}</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>
                {value}
            </div>
            <div style={{ fontSize: "14px", color: "#9ca3af" }}>{label}</div>
        </div>
    );
}

/* ---------------- Albüm kartı ---------------- */
function AlbumCard({ album, onOpen, onUploadCover }) {
    const [isHovered, setIsHovered] = useState(false);

    const cardStyle = {
        position: "relative",
        cursor: "pointer",
        borderRadius: "16px",
        overflow: "hidden",
        aspectRatio: "3/4",
        background: "linear-gradient(135deg, #374151, #1f2937)",
        transition: "transform 0.3s ease",
    };

    const overlayStyle = {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)",
    };

    const hoverOverlayStyle = {
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.3s ease",
    };

    const contentStyle = {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px",
        color: "white",
    };

    return (
        <div
            style={{ ...cardStyle, transform: isHovered ? "scale(1.05)" : "scale(1)" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onOpen?.(album)}
        >
            {album.image && (
                <img
                    src={album.image}
                    alt={album.title}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: isHovered ? "scale(1.1)" : "scale(1)",
                        transition: "transform 0.5s ease",
                    }}
                    onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                />
            )}

            <div style={overlayStyle} />
            <div style={hoverOverlayStyle}>
                <div style={{ textAlign: "center", color: "white" }}>
                    <Eye size={32} style={{ margin: "0 auto 8px" }} />
                    <div style={{ fontWeight: 500 }}>Görüntüle</div>
                </div>
            </div>

            {album.editable && isHovered && (
                <button
                    type="button"
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        width: "40px",
                        height: "40px",
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "50%",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background 0.2s ease",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onUploadCover?.(album);
                    }}
                >
                    <Upload size={20} color="white" />
                </button>
            )}

            <div style={contentStyle}>
                <h3
                    style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {album.title}
                </h3>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        color: "#d1d5db",
                    }}
                >
                    <span>{album.subtitle}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Film size={16} />
                        {album.count}
          </span>
                </div>
            </div>
        </div>
    );
}

/* ---------------- Film kartı ---------------- */
function MovieCard({ movie }) {
    const [isHovered, setIsHovered] = useState(false);

    const cardStyle = {
        cursor: "pointer",
        borderRadius: "12px",
        overflow: "hidden",
        aspectRatio: "2/3",
        background: "#374151",
        position: "relative",
    };

    const overlayStyle = {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.3s ease",
    };

    const contentStyle = {
        position: "absolute",
        bottom: "16px",
        left: "16px",
        right: "16px",
        color: "white",
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.3s ease",
    };

    // ProfilePage -> normalizeMovie ile eklenir
    const poster =
        movie?.posterResolved ??
        resolvePosterUrl(
            movie?.poster ||
            movie?.posterUrl ||
            movie?.image ||
            movie?.cover ||
            movie?.coverUrl ||
            movie?.poster_path
        );

    return (
        <div
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={movie?.title || movie?.name}
        >
            {poster ? (
                <img
                    src={poster}
                    alt={movie?.title || movie?.name || ""}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: isHovered ? "scale(1.05)" : "scale(1)",
                        transition: "transform 0.3s ease",
                    }}
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                    }}
                />
            ) : (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "grid",
                        placeItems: "center",
                        color: "rgba(255,255,255,.6)",
                    }}
                >
                    No Image
                </div>
            )}
            <div style={overlayStyle} />
            <div style={contentStyle}>
                <h4 style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
                    {movie?.title || movie?.name}
                </h4>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "#d1d5db",
                    }}
                >
          <span>
            {movie?.year || (movie?.releaseYear ?? (movie?.release_date || "")?.slice(0, 4))}
          </span>
                </div>
            </div>
        </div>
    );
}

/* ---------------- Sayfa ---------------- */
export default function ProfilePage({ user: initialUser, userId }) {
    // Kullanıcı + tercih
    const [user, setUser] = useState(initialUser || null);
    const [pref, setPref] = useState(null);

    // Listeler + seçili albüm
    const [listsMeta, setListsMeta] = useState([]);
    const [loadingLists, setLoadingLists] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [loadingAlbum, setLoadingAlbum] = useState(false);

    // Upload inputları
    const avatarFileRef = useRef(null);
    const coverFileRef = useRef(null);
    const coverForListIdRef = useRef(null); // hangi albüm için kapak yüklenecek

    /* ----- Kullanıcı + Tercihler ----- */
    useEffect(() => {
        if (!userId) return;
        const ac = new AbortController();

        (async () => {
            // user
            try {
                const rUser = await fetch(`${API}/api/users/${userId}`, { signal: ac.signal });
                if (rUser.ok) {
                    const u = await rUser.json();
                    const avatar = toAbs(u.avatarUrl || u.ppLink);
                    const normalized = { ...u, avatarUrl: avatar, ppLink: avatar };
                    setUser(normalized);
                    try {
                        const raw = localStorage.getItem("wm_user");
                        if (raw) {
                            const cur = JSON.parse(raw);
                            localStorage.setItem("wm_user", JSON.stringify({ ...cur, ...normalized }));
                        } else {
                            localStorage.setItem("wm_user", JSON.stringify(normalized));
                        }
                    } catch {}
                }
            } catch {}

            // preference (opsiyonel)
            try {
                const rPref = await fetch(`${API}/api/users/${userId}/preference`, { signal: ac.signal });
                if (rPref.ok) setPref(await rPref.json());
                else setPref(null);
            } catch {
                setPref(null);
            }
        })();

        return () => ac.abort();
    }, [userId]);

    /* ----- Kullanıcı listeleri ----- */
    useEffect(() => {
        if (!userId) return;
        const ac = new AbortController();
        (async () => {
            try {
                setLoadingLists(true);
                const res = await fetch(`${API}/api/movie-lists/user/${userId}`, { signal: ac.signal });
                if (!res.ok) throw new Error("Listeler alınamadı");
                const data = await res.json();
                const normalized = (Array.isArray(data) ? data : []).map((l) => ({
                    ...l,
                    image: resolvePosterUrl(toAbs(l.image || l.listImage || l.cover || l.coverUrl)),
                    title: l.listName || l.name || "Liste",
                    count: l.movieCount ?? (l.movies?.length ?? 0),
                    subtitle: l.listType || "Kullanıcı Listesi",
                    id: l.id ?? l.listId,
                    editable: true, // isterseniz BE alanına göre değiştirebilirsiniz
                }));
                if (!ac.signal.aborted) setListsMeta(normalized);
            } catch (e) {
                if (!ac.signal.aborted) {
                    console.error("List özetleri hatası:", e);
                    setListsMeta([]);
                }
            } finally {
                if (!ac.signal.aborted) setLoadingLists(false);
            }
        })();
        return () => ac.abort();
    }, [userId]);

    /* ----- Kapak tamamlama: kapaksız listelere ilk filmin posterini kapak yap ----- */
    useEffect(() => {
        if (!userId) return;

        // sadece kapak OLMAYAN ve film sayısı > 0 olanlar
        const targets = (listsMeta || []).filter(
            (l) =>
                !(l.image || l.listImage || l.cover || l.coverUrl) &&
                ((Number(l.count) || 0) > 0)
        );
        if (targets.length === 0) return;

        const ac = new AbortController();
        (async () => {
            try {
                const results = await Promise.all(
                    targets.map(async (l) => {
                        const id = l.id ?? l.listId;
                        try {
                            const r = await fetch(`${API}/api/movie-lists/${id}`, { signal: ac.signal });
                            if (!r.ok) return null;
                            const detail = await r.json();
                            const movies = detail?.movies || [];
                            const cover =
                                detail?.image ||
                                detail?.listImage ||
                                detail?.cover ||
                                detail?.coverUrl ||
                                pickPoster(movies[0]); // ⬅️ ilk filmin posteri
                            const resolved = resolvePosterUrl(toAbs(cover));
                            return resolved ? { id, cover: resolved } : null;
                        } catch {
                            return null;
                        }
                    })
                );

                const map = new Map(results.filter(Boolean).map((x) => [String(x.id), x.cover]));
                setListsMeta((prev) =>
                    (prev || []).map((l) => {
                        const id = l.id ?? l.listId;
                        const cv = map.get(String(id));
                        return cv ? { ...l, image: cv } : l;
                    })
                );
            } catch (e) {
                console.warn("Kapak tamamlama sırasında hata:", e);
            }
        })();

        return () => ac.abort();
    }, [userId, listsMeta]);

    /* ----- Albüm aç ----- */
    const openAlbum = async (album) => {
        if (!album?.id) return;
        const ac = new AbortController();
        try {
            setLoadingAlbum(true);
            const res = await fetch(`${API}/api/movie-lists/${album.id}`, { signal: ac.signal });
            if (!res.ok) throw new Error("Liste detayı alınamadı");
            const detail = await res.json();

            const moviesRaw = detail?.movies || [];
            const movies = moviesRaw.map(normalizeMovie);

            // kapak: önce detay alanları, yoksa ilk filmin posteri
            const coverCand =
                detail?.image || detail?.listImage || detail?.cover || detail?.coverUrl || pickPoster(moviesRaw[0]);
            const image = resolvePosterUrl(toAbs(album.image || coverCand));

            setSelectedAlbum({
                ...album,
                image,
                movies,
            });
        } catch (e) {
            console.error("Liste detayı hatası:", e);
            setSelectedAlbum({ ...album, movies: [] });
        } finally {
            setLoadingAlbum(false);
        }
    };

    /* ----- Kapak yükleme ----- */
    const triggerCoverUpload = (album) => {
        coverForListIdRef.current = album?.id;
        coverFileRef.current?.click();
    };

    const onCoverFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        const listId = coverForListIdRef.current;
        coverForListIdRef.current = null;
        if (!file || !listId) return;
        try {
            const res = await uploadListCover(listId, file);
            const newUrl = resolvePosterUrl(toAbs(res?.listImage || res?.image || res?.cover || res?.url));
            if (newUrl) {
                setListsMeta((prev) =>
                    (prev || []).map((l) => (String(l.id) === String(listId) ? { ...l, image: newUrl } : l))
                );
                setSelectedAlbum((sa) => (sa && String(sa.id) === String(listId) ? { ...sa, image: newUrl } : sa));
            } else {
                // optimistic fallback
                setSelectedAlbum((sa) =>
                    sa && String(sa.id) === String(listId) ? { ...sa, image: URL.createObjectURL(file) } : sa
                );
            }
        } catch (err) {
            alert("Kapak yükleme başarısız: " + (err?.message || ""));
        }
    };

    /* ----- Avatar yükleme ----- */
    const handleAvatarUploadClick = () => avatarFileRef.current?.click();

    const onAvatarFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !userId) return;
        const fd = new FormData();
        fd.append("file", file);
        try {
            const r = await fetch(`${API}/api/users/${userId}/avatar`, {
                method: "POST",
                body: fd,
            });
            if (!r.ok) throw new Error(await r.text());
            const data = await r.json(); // UserDto
            const url = toAbs(data?.avatarUrl || data?.ppLink);
            setUser((u) => ({ ...(u || {}), avatarUrl: url, ppLink: url }));
            try {
                const raw = localStorage.getItem("wm_user");
                if (raw) {
                    const cur = JSON.parse(raw);
                    localStorage.setItem("wm_user", JSON.stringify({ ...cur, avatarUrl: url, ppLink: url }));
                } else {
                    localStorage.setItem("wm_user", JSON.stringify({ avatarUrl: url, ppLink: url }));
                }
            } catch {}
        } catch (err) {
            alert("Avatar yükleme başarısız: " + (err?.message || ""));
        }
    };

    /* ----- Türev veriler ----- */
    const albums = useMemo(() => {
        // İstiyorsan sistem listelerini gizlemek için burada filtre uygulayabilirsin.
        // Şimdilik TÜM listeleri gösteriyoruz.
        return listsMeta || [];
    }, [listsMeta]);

    const totalMovies = useMemo(
        () => (albums || []).reduce((sum, a) => sum + (Number(a.count) || 0), 0),
        [albums]
    );
    const totalLists = albums.length;

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Kullanıcı";
    const countryName = user?.country?.name || user?.countryName || user?.country?.countryName || "-";
    const language = (pref?.language || user?.language || "TR").toUpperCase();
    const avatarSrc = toAbs(user?.avatarUrl || user?.ppLink);
    const NAV_SAFE_OFFSET = 70;

    /* ----- Stiller ----- */
    const containerStyle = {
        minHeight: "100vh",
        paddingTop: NAV_SAFE_OFFSET, // header alta taşma fix
        background: "linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%)",
        position: "relative",
    };

    const patternStyle = {
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.5,
    };

    const headerStyle = {
        position: "relative",
        zIndex: 10,
        background: "linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(185, 28, 28, 0.8))",
        backdropFilter: "blur(20px)",
        padding: "40px 0",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    };

    const headerContentStyle = {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        gap: "32px",
    };

    const mainContentStyle = {
        position: "relative",
        zIndex: 10,
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px",
        display: "grid",
        gridTemplateColumns: "350px 1fr",
        gap: "32px",
    };

    const profilePanelStyle = {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "24px",
        padding: "32px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: "32px",
        alignSelf: "flex-start",
    };

    return (
        <div style={containerStyle}>
            <div style={patternStyle} />

            {/* Header */}
            <div style={headerStyle}>
                <div style={headerContentStyle}>
                    {/* Avatar */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <div
                            style={{
                                width: "180px",
                                height: "180px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                background: "rgba(255, 255, 255, 0.1)",
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt="Avatar"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                <div style={{ color: "white", fontSize: "64px", fontWeight: "bold" }}>
                                    {(user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleAvatarUploadClick}
                            style={{
                                position: "absolute",
                                bottom: "8px",
                                right: "8px",
                                width: "48px",
                                height: "48px",
                                background: "rgba(0, 0, 0, 0.7)",
                                backdropFilter: "blur(10px)",
                                borderRadius: "50%",
                                border: "2px solid white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            title="Profil fotoğrafı yükle"
                        >
                            <Camera size={24} color="white" />
                        </button>
                        <input
                            ref={avatarFileRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={onAvatarFile}
                        />
                    </div>

                    {/* Profil Bilgileri */}
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ color: "white", fontSize: "16px", fontWeight: 500, marginBottom: "8px" }}>
                                Profil
                            </div>
                            <h1
                                style={{
                                    fontSize: "72px",
                                    fontWeight: "900",
                                    color: "white",
                                    margin: 0,
                                    lineHeight: "1",
                                    textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                                }}
                            >
                                {fullName}
                            </h1>
                            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px", marginTop: "8px" }}>
                                @{user?.username}
                            </div>
                        </div>

                        {/* İstatistikler */}
                        <div style={{ display: "flex", alignItems: "center", gap: "32px", color: "white", fontSize: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Film size={20} />
                                <span>
                  <strong>{totalMovies}</strong> film
                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Heart size={20} />
                                <span>
                  <strong>{totalLists}</strong> liste
                </span>
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.7)" }}>
                                {countryName} · {language}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={mainContentStyle}>
                {/* Sol Panel */}
                <div style={profilePanelStyle}>
                    <ModernButton variant="glass" style={{ width: "100%", marginBottom: "20px" }}>
                        <Edit3 size={16} />
                        Profili Düzenle
                    </ModernButton>

                    {/* Detaylı İstatistikler */}
                    <div style={{ marginBottom: "24px" }}>
                        <h3 style={{ color: "white", marginBottom: "16px", fontSize: "18px", fontWeight: 600 }}>
                            İstatistikler
                        </h3>
                        <div style={{ display: "grid", gap: "16px" }}>
                            <StatCard icon={Film} label="Toplam Film" value={totalMovies} gradient="#3b82f6, #1d4ed8" />
                            <StatCard icon={Heart} label="Liste Sayısı" value={totalLists} gradient="#ec4899, #be185d" />
                        </div>
                    </div>

                    {/* Profil Bilgileri */}
                    <div>
                        <h3 style={{ color: "white", marginBottom: "16px", fontSize: "18px", fontWeight: 600 }}>
                            Bilgiler
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingBottom: "12px",
                                borderBottom: "1px solid rgba(255,255,255,0.1)",
                                marginBottom: "12px",
                            }}
                        >
                            <span style={{ color: "#9ca3af" }}>Ülke</span>
                            <span style={{ color: "white", fontWeight: 500 }}>{countryName}</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingBottom: "12px",
                                borderBottom: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            <span style={{ color: "#9ca3af" }}>Dil</span>
                            <span style={{ color: "white", fontWeight: 500 }}>{language}</span>
                        </div>
                    </div>
                </div>

                {/* Sağ Panel */}
                <div>
                    {!selectedAlbum ? (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "32px",
                                }}
                            >
                                <h2 style={{ fontSize: "48px", fontWeight: "bold", color: "white", margin: 0 }}>
                                    📀 Albümlerim
                                </h2>
                            </div>

                            {loadingLists ? (
                                <div style={{ color: "rgba(255,255,255,.85)" }}>Listeler yükleniyor…</div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                        gap: "24px",
                                    }}
                                >
                                    {albums.map((album) => (
                                        <AlbumCard
                                            key={album.id}
                                            album={album}
                                            onOpen={openAlbum}
                                            onUploadCover={triggerCoverUpload}
                                        />
                                    ))}
                                </div>
                            )}
                            <input
                                ref={coverFileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={onCoverFile}
                            />
                        </>
                    ) : (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "32px",
                                }}
                            >
                                <h2 style={{ fontSize: "48px", fontWeight: "bold", color: "white", margin: 0 }}>
                                    📀 {selectedAlbum.title}
                                </h2>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <ModernButton variant="secondary" onClick={() => setSelectedAlbum(null)}>
                                        <ArrowLeft size={16} />
                                        Geri
                                    </ModernButton>
                                    {selectedAlbum.editable && (
                                        <ModernButton variant="primary" onClick={() => triggerCoverUpload(selectedAlbum)}>
                                            <Upload size={16} />
                                            Kapak Yükle
                                        </ModernButton>
                                    )}
                                </div>
                            </div>

                            {loadingAlbum ? (
                                <div style={{ color: "rgba(255,255,255,.85)" }}>İçerik yükleniyor…</div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                                        gap: "24px",
                                    }}
                                >
                                    {(selectedAlbum.movies || []).map((movie) => (
                                        <MovieCard key={movie.id ?? movie.tmdbId ?? movie.title} movie={movie} />
                                    ))}
                                </div>
                            )}

                            <input
                                ref={coverFileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={onCoverFile}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
