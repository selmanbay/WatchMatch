// src/components/Header.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    headerStyle,
    navContainerStyle,
    logoStyle,
    logoIconStyle,
} from "../styles/ui";
import AvatarMenu from "./nav/AvatarMenu";

export default function Header({
                                   user,
                                   searchQuery,
                                   setSearchQuery,
                                   onSearch,
                                   onLogout,
                                   onProfile,
                                   suggestions = [],
                                   suggestionsLoading = false,
                                   onPickSuggestion,
                                   onHome,
                                   onType, // opsiyonel
                               }) {
    const inputRef = useRef(null);

    // ---- Yerel input state ----
    const [localValue, setLocalValue] = useState(searchQuery || "");
    const ignoreNextSyncRef = useRef(false); // öneri tıklamasından sonra 1 kez senkronu atla

    // Parent dışarıdan bir değer dayarsa senkron tut (ama gerekirse atla)
    useEffect(() => {
        if (ignoreNextSyncRef.current) {
            ignoreNextSyncRef.current = false;
            return;
        }
        setLocalValue(searchQuery || "");
    }, [searchQuery]);

    const typeCb = useMemo(() => onType || setSearchQuery, [onType, setSearchQuery]);

    const goHome = () => {
        if (typeof onHome === "function") onHome();
        else window.location.href = "/";
    };

    // sağ grup
    const rightGroupStyle = {
        display: "inline-flex",
        alignItems: "center",
        gap: 15,
        flex: "none",
        whiteSpace: "nowrap",
    };

    const searchWrapStyle = { position: "relative", width: 260, flex: "none" };

    const panelStyle = {
        position: "absolute",
        top: "110%",
        left: 0,
        width: "100%",
        background: "rgba(20,20,20,0.98)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
        backdropFilter: "blur(10px)",
        zIndex: 1100,
        overflow: "hidden",
        maxHeight: "60vh",
        overflowY: "auto",
    };

    const rowStyle = {
        display: "grid",
        gridTemplateColumns: "40px 1fr auto",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        cursor: "pointer",
        color: "white",
    };
    const rowHover = { background: "rgba(255,255,255,0.05)" };
    const sourcePill = (src) => ({
        fontSize: 12,
        padding: "4px 8px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.18)",
        opacity: 0.9,
        ...(src === "local"
            ? { color: "#60a5fa", borderColor: "rgba(96,165,250,0.4)" }
            : { color: "#facc15", borderColor: "rgba(250,204,21,0.4)" }),
    });

    // ---- Handlers ----
    const doSearch = () => {
        const q = localValue.trim();
        if (!q) return;
        onSearch?.(q);
        setLocalValue("");              // sadece yerel input temizle
        setTimeout(() => inputRef.current?.blur(), 0);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            doSearch();
        }
    };

    const handleClickSearch = () => doSearch();

    const handlePick = (s) => {
        onPickSuggestion?.(s);
        // Tek seferlik: parent senkronunu atla ki eski query geri yazılmasın
        ignoreNextSyncRef.current = true;
        setLocalValue("");
        // paneli kapat
        setTimeout(() => inputRef.current?.blur(), 0);
    };

    const showPanel =
        localValue.trim() !== "" && (suggestionsLoading || suggestions.length > 0);

    return (
        <header style={headerStyle}>
            <div style={navContainerStyle}>
                {/* Sol: Logo */}
                <button
                    onClick={goHome}
                    title="Ana sayfa"
                    aria-label="Ana sayfaya git"
                    style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        margin: 0,
                        ...logoStyle,
                        cursor: "pointer",
                    }}
                >
                    <div style={logoIconStyle}>WM</div>
                    <span>WatchMatch</span>
                </button>

                {/* Sağ: Arama + Avatar */}
                <div style={rightGroupStyle}>
                    <div style={searchWrapStyle}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Film ara..."
                            value={localValue}
                            onChange={(e) => {
                                const v = e.target.value;
                                setLocalValue(v);   // yerel input
                                typeCb?.(v);        // parent’a metni ilet (öneriler için)
                            }}
                            onKeyDown={handleKeyDown}
                            style={{
                                background: "rgba(255, 255, 255, 0.1)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius: "25px",
                                padding: "10px 45px 10px 20px",
                                color: "white",
                                fontSize: "14px",
                                width: "100%",
                                boxSizing: "border-box",
                                outline: "none",
                                display: "block",
                            }}
                        />
                        <button
                            onClick={handleClickSearch}
                            style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: 24,
                                height: 24,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "none",
                                border: "none",
                                color: "rgba(255, 255, 255, 0.7)",
                                cursor: "pointer",
                                padding: 0,
                            }}
                            aria-label="Ara"
                        >
                            🔍
                        </button>

                        {showPanel && (
                            <div style={panelStyle}>
                                {suggestionsLoading && (
                                    <div style={{ padding: 12, opacity: 0.8 }}>Aranıyor…</div>
                                )}
                                {!suggestionsLoading && suggestions.length === 0 && (
                                    <div style={{ padding: 12, opacity: 0.8 }}>Sonuç yok</div>
                                )}
                                {!suggestionsLoading &&
                                    suggestions.map((s, i) => (
                                        <div
                                            key={`${s.source}-${s.id ?? s.title}-${i}`}
                                            onMouseDown={(e) => {
                                                // blur’dan önce çalışsın ve fokus değişimini engellesin
                                                e.preventDefault();
                                                handlePick(s);
                                            }}
                                            onMouseEnter={(e) =>
                                                Object.assign(e.currentTarget.style, rowHover)
                                            }
                                            onMouseLeave={(e) =>
                                                Object.assign(e.currentTarget.style, {
                                                    background: "transparent",
                                                })
                                            }
                                            style={rowStyle}
                                            role="option"
                                        >
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 60,
                                                    borderRadius: 6,
                                                    overflow: "hidden",
                                                    background: "rgba(255,255,255,0.08)",
                                                    border: "1px solid rgba(255,255,255,0.12)",
                                                }}
                                            >
                                                {s.poster ? (
                                                    <img
                                                        src={s.poster}
                                                        alt=""
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : null}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        lineHeight: 1.2,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {s.title}
                                                </div>
                                                <div style={{ fontSize: 12, opacity: 0.8 }}>
                                                    {s.year || ""}&nbsp;
                                                </div>
                                            </div>
                                            <div style={sourcePill(s.source)}>
                                                {s.source === "local" ? "DB" : "TMDB"}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {user && (
                        <AvatarMenu
                            user={user}
                            onProfile={onProfile ?? (() => { window.location.href = "/profile"; })}
                            onLogout={onLogout}
                        />
                    )}
                </div>
            </div>
        </header>
    );
}
