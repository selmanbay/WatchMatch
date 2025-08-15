// src/components/Header.jsx
import React from "react";
import {
    headerStyle,
    navContainerStyle,
    logoStyle,
    logoIconStyle
} from "../styles/ui";
import AvatarMenu from "./nav/AvatarMenu";

export default function Header({
                                   user,                 // { firstName, lastName, username, avatarUrl, ... }
                                   searchQuery,
                                   setSearchQuery,
                                   onSearch,
                                   onLogout,
                                   onProfile            // opsiyonel; yoksa /profile'a gider
                               }) {
    return (
        <header style={headerStyle}>
            <div style={navContainerStyle}>
                {/* Sol: Logo */}
                <div style={logoStyle}>
                    <div style={logoIconStyle}>WM</div>
                    <span>WatchMatch</span>
                </div>

                {/* Sağ: Arama + Profil menüsü */}
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <div style={{ position: "relative" }}>
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
                                width: "300px",
                                outline: "none"
                            }}
                        />
                        <button
                            onClick={onSearch}
                            style={{
                                position: "absolute",
                                right: 15,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "rgba(255, 255, 255, 0.6)",
                                cursor: "pointer"
                            }}
                            aria-label="Ara"
                        >
                            🔍
                        </button>
                    </div>

                    {/* Eski "Çıkış Yap" butonu kaldırıldı. Yerine avatar menüsü: */}
                    {user && (
                        <AvatarMenu
                            user={user}
                            onProfile={
                                onProfile ??
                                (() => {
                                    window.location.href = "/profile";
                                })
                            }
                            onLogout={onLogout}
                        />
                    )}
                </div>
            </div>
        </header>
    );
}
