// src/components/header/AvatarMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import {
    avatarWrapperStyle,
    avatarBtnStyle,
    avatarImgStyle,
    avatarFallbackStyle,
    avatarMenuStyle,
    avatarMenuItemStyle,
} from "../../styles/ui";

// /uploads/... yollarını mutlak hale getir
const API = process.env.REACT_APP_API_BASE || "http://localhost:8080";
const toAbs = (url) =>
    url && typeof url === "string" && url.startsWith("/uploads/")
        ? `${API}${url}`
        : url;

export default function AvatarMenu({ user, onProfile, onLogout }) {
    const [open, setOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const ref = useRef(null);

    const initials = (user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase();
    const src = toAbs(user?.avatarUrl || user?.ppLink);

    // Dışarı tıklayınca & ESC ile menüyü kapat
    useEffect(() => {
        const onDocClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onEsc = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    // Avatar url'i değiştiğinde hata bayrağını sıfırla
    useEffect(() => {
        setImgError(false);
    }, [src]);

    return (
        <div style={avatarWrapperStyle} ref={ref}>
            <button
                type="button"
                style={avatarBtnStyle}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                title={user?.username || "Hesabım"}
            >
                {src && !imgError ? (
                    <img
                        src={src}
                        alt="Profil"
                        style={avatarImgStyle}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span style={avatarFallbackStyle}>{initials}</span>
                )}
            </button>

            {open && (
                <div role="menu" style={avatarMenuStyle}>
                    <div style={{ ...avatarMenuItemStyle, opacity: 0.8, cursor: "default" }}>
                        {user?.username ||
                            `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
                            "Kullanıcı"}
                    </div>
                    <div
                        style={avatarMenuItemStyle}
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            onProfile?.();
                        }}
                    >
                        👤 Profilim
                    </div>
                    <div
                        style={avatarMenuItemStyle}
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            onLogout?.();
                        }}
                    >
                        🚪 Çıkış Yap
                    </div>
                </div>
            )}
        </div>
    );
}
