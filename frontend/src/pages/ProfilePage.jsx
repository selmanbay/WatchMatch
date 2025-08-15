// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import MovieGrid from "../components/MovieGrid";
import AlbumGrid from "../components/AlbumGrid";
import { containerStyle, sectionHeaderStyle, sectionTitleStyle } from "../styles/ui";
import { pickPoster } from "../utils/images";

export default function ProfilePage({
                                        user,
                                        userId,
                                        wishlist = [],
                                        watchedlist = [],
                                        onBack,
                                        onAddWishlist,
                                        onAddWatched
                                    }) {
    const [listsMeta, setListsMeta] = useState([]);      // sadece özet (id, name, image, count?)
    const [loadingLists, setLoadingLists] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [loadingAlbum, setLoadingAlbum] = useState(false);

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        user?.username ||
        "Kullanıcı";

    // Kullanıcının listelerinin ÖZETİ (detaylar tıklanınca)
    useEffect(() => {
        if (!userId) return;
        const ac = new AbortController();
        (async () => {
            try {
                setLoadingLists(true);
                const res = await fetch(
                    `http://localhost:8080/api/movie-lists/user/${userId}`,
                    { signal: ac.signal }
                );
                if (!res.ok) throw new Error("Listeler alınamadı");
                const data = await res.json();
                if (!ac.signal.aborted) setListsMeta(Array.isArray(data) ? data : []);
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

    // ⚡ Kapak görseli olmayan listeler için: detayını çek → ilk filmin posteriyle kapak doldur
    useEffect(() => {
        if (!userId) return;
        const targets = (listsMeta || []).filter(
            (l) =>
                !(l.image || l.listImage || l.cover || l.coverUrl) &&
                ((l.movieCount ?? (l.movies?.length ?? 0)) > 0)
        );
        if (targets.length === 0) return;

        const ac = new AbortController();
        (async () => {
            try {
                const results = await Promise.all(
                    targets.map(async (l) => {
                        const id = l.id ?? l.listId;
                        try {
                            const r = await fetch(`http://localhost:8080/api/movie-lists/${id}`, {
                                signal: ac.signal
                            });
                            if (!r.ok) return null;
                            const detail = await r.json();
                            const movies = detail?.movies || [];
                            const cover =
                                detail?.image ||
                                detail?.listImage ||
                                detail?.cover ||
                                detail?.coverUrl ||
                                pickPoster(movies[0]);
                            return cover ? { id, cover } : null;
                        } catch {
                            return null;
                        }
                    })
                );

                const map = new Map(
                    results.filter(Boolean).map((x) => [String(x.id), x.cover])
                );

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

    // Albüm kartları (Wishlist/Watchlist + custom list özetleri)
    const albums = useMemo(() => {
        const sys = [
            {
                id: "wishlist",
                title: "Wishlist",
                image: wishlist?.image || pickPoster(wishlist[0]),
                count: wishlist?.length || 0,
                movies: wishlist || [],
                editable: false,
                subtitle: "Sistem Albümü"
            },
            {
                id: "watchlist",
                title: "Watchlist",
                image: watchedlist?.image || pickPoster(watchedlist[0]),
                count: watchedlist?.length || 0,
                movies: watchedlist || [],
                editable: false,
                subtitle: "Sistem Albümü"
            }
        ];

        const custom = (listsMeta || []).map((l) => ({
            id: l.id ?? l.listId,
            title: l.listName || l.name || "Liste",
            // Özetten gelirse kullan, yoksa (üstteki efekt kısa sürede dolduracak)
            image: l.image || l.listImage || l.cover || l.coverUrl || null,
            count: l.movieCount ?? (l.movies?.length ?? 0),
            movies: l.movies || undefined,
            editable: true,
            subtitle: "Kullanıcı Listesi"
        }));

        return [...sys, ...custom];
    }, [wishlist, watchedlist, listsMeta]);

    const openAlbum = async (album) => {
        // Sistem albümleri: içerik zaten elde
        if (album.id === "wishlist" || album.id === "watchlist") {
            setSelectedAlbum(album);
            return;
        }
        if (!album?.id) return;
        const ac = new AbortController();
        try {
            setLoadingAlbum(true);
            const res = await fetch(
                `http://localhost:8080/api/movie-lists/${album.id}`,
                { signal: ac.signal }
            );
            if (!res.ok) throw new Error("Liste detayı alınamadı");
            const detail = await res.json();
            const movies = detail?.movies || [];
            setSelectedAlbum({
                ...album,
                image:
                    album.image ||
                    detail?.image ||
                    detail?.listImage ||
                    detail?.cover ||
                    detail?.coverUrl ||
                    pickPoster(movies[0]),
                movies
            });
        } catch (e) {
            console.error("Liste detayı hatası:", e);
            setSelectedAlbum({ ...album, movies: [] });
        } finally {
            setLoadingAlbum(false);
        }
    };

    const changeCover = async (album) => {
        if (!album?.editable || !album?.id) return;
        const newUrl = prompt("Yeni kapak görseli URL'si:");
        if (!newUrl) return;
        try {
            await fetch(`http://localhost:8080/api/movie-lists/${album.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: newUrl })
            });
        } catch (e) {
            console.warn("Kapak güncelle API hatası:", e);
        } finally {
            // UI’ı anında güncelle
            setListsMeta((prev) =>
                (prev || []).map((l) => {
                    const id = l.id ?? l.listId;
                    return String(id) === String(album.id) ? { ...l, image: newUrl } : l;
                })
            );
            setSelectedAlbum((sa) =>
                sa && String(sa.id) === String(album.id) ? { ...sa, image: newUrl } : sa
            );
        }
    };

    return (
        <main style={{ paddingTop: 80, minHeight: "100vh" }}>
            <div
                style={{
                    ...containerStyle,
                    display: "grid",
                    gridTemplateColumns: "320px 1fr",
                    gap: 24
                }}
            >
                {/* Sol: profil kartı */}
                <aside
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 16,
                        padding: 20
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                        <div
                            style={{
                                width: 220,
                                height: 220,
                                borderRadius: 16,
                                overflow: "hidden",
                                border: "1px solid rgba(255,255,255,0.1)",
                                background: "rgba(255,255,255,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 64,
                                fontWeight: 800
                            }}
                        >
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="avatar"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                (user?.firstName?.[0] ?? user?.username?.[0] ?? "U").toUpperCase()
                            )}
                        </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <h2 style={{ margin: "8px 0 4px 0" }}>{fullName}</h2>
                        <div style={{ color: "rgba(255,255,255,0.85)" }}>
                            {user?.country?.name ?? ""}
                        </div>
                    </div>

                    {onBack && (
                        <div style={{ marginTop: 12, textAlign: "center" }}>
                            <button
                                onClick={onBack}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    background: "transparent",
                                    color: "#fff",
                                    cursor: "pointer"
                                }}
                            >
                                ← Geri
                            </button>
                        </div>
                    )}
                </aside>

                {/* Sağ: Albümler veya seçili albüm içeriği */}
                <section>
                    {!selectedAlbum ? (
                        <>
                            <div style={sectionHeaderStyle}>
                                <h3 style={sectionTitleStyle}>📀 Albümlerim</h3>
                            </div>
                            {loadingLists ? (
                                <div style={{ opacity: 0.8 }}>Listeler yükleniyor…</div>
                            ) : (
                                <AlbumGrid
                                    albums={albums}
                                    onOpen={openAlbum}
                                    onChangeCover={changeCover}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <div style={sectionHeaderStyle}>
                                <h3 style={sectionTitleStyle}>📀 {selectedAlbum.title}</h3>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={() => setSelectedAlbum(null)}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "1px solid rgba(255,255,255,0.2)",
                                            background: "transparent",
                                            color: "#fff",
                                            cursor: "pointer"
                                        }}
                                    >
                                        ← Albümlere Dön
                                    </button>
                                    {selectedAlbum.editable && (
                                        <button
                                            onClick={() => changeCover(selectedAlbum)}
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: 8,
                                                border: "1px solid rgba(255,255,255,0.2)",
                                                background: "transparent",
                                                color: "#fff",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Kapak Değiştir 🖼️
                                        </button>
                                    )}
                                </div>
                            </div>

                            {loadingAlbum ? (
                                <div style={{ opacity: 0.8 }}>İçerik yükleniyor…</div>
                            ) : (
                                <MovieGrid
                                    items={selectedAlbum.movies || []}
                                    emptyText="Bu albüm boş"
                                    userId={userId}
                                    onAddWishlist={onAddWishlist}
                                    onAddWatched={onAddWatched}
                                />
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
