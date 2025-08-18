import React from "react";
import {
    headerStyle,
    navContainerStyle,
    logoStyle,
    logoIconStyle
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
                                   onHome
                               }) {
    const goHome = () => {
        if (typeof onHome === "function") onHome();
        else window.location.href = "/";
    };

    // sağ grup büyümesin
    const rightGroupStyle = {
        display: "inline-flex",
        alignItems: "center",
        gap: 15,
        flex: "none",
        whiteSpace: "nowrap"
    };

    // arama kutusu sabit
    const searchWrapStyle = {
        position: "relative",
        width: 260,
        flex: "none"
    };

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
        overflowY: "auto"
    };

    const rowStyle = {
        display: "grid",
        gridTemplateColumns: "40px 1fr auto",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        cursor: "pointer",
        color: "white"
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
            : { color: "#facc15", borderColor: "rgba(250,204,21,0.4)" })
    });

    return (
        <header style={headerStyle}>
            <div style={navContainerStyle}>
                {/* Sol: Logo -> Ana sayfa */}
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
                        cursor: "pointer"
                    }}
                >
                    <div style={logoIconStyle}>WM</div>
                    <span>WatchMatch</span>
                </button>

                {/* Sağ: Arama + Avatar */}
                <div style={rightGroupStyle}>
                    <div style={searchWrapStyle}>
                        <input
                            type="text"
                            placeholder="Film ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
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
                                display: "block"
                            }}
                        />
                        <button
                            onClick={onSearch}
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
                                padding: 0
                            }}
                            aria-label="Ara"
                        >
                            🔍
                        </button>

                        {(searchQuery.trim() !== "") &&
                            (suggestionsLoading || suggestions.length > 0) && (
                                <div style={panelStyle}>
                                    {suggestionsLoading && (
                                        <div style={{ padding: 12, opacity: 0.8 }}>Aranıyor…</div>
                                    )}
                                    {!suggestionsLoading && suggestions.length === 0 && (
                                        <div style={{ padding: 12, opacity: 0.8 }}>Sonuç yok</div>
                                    )}
                                    {!suggestionsLoading && suggestions.map((s, i) => (
                                        <div
                                            key={`${s.source}-${s.id ?? s.title}-${i}`}
                                            onMouseDown={() => onPickSuggestion?.(s)}
                                            onMouseEnter={(e) =>
                                                Object.assign(e.currentTarget.style, rowHover)
                                            }
                                            onMouseLeave={(e) =>
                                                Object.assign(e.currentTarget.style, { background: "transparent" })
                                            }
                                            style={rowStyle}
                                            role="option"
                                        >
                                            <div style={{
                                                width: 40, height: 60, borderRadius: 6,
                                                overflow: "hidden", background: "rgba(255,255,255,0.08)",
                                                border: "1px solid rgba(255,255,255,0.12)"
                                            }}>
                                                {s.poster ? (
                                                    <img
                                                        src={s.poster}
                                                        alt=""
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                ) : null}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 700, lineHeight: 1.2,
                                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                                }}>
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
