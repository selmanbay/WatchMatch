import React, { useEffect, useRef, useState } from "react";
import {
    avatarWrapperStyle,
    avatarBtnStyle,
    avatarImgStyle,
    avatarFallbackStyle,
    avatarMenuStyle,
    avatarMenuItemStyle
} from "../../styles/ui";

export default function AvatarMenu({ user, onProfile, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

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

    const initials =
        (user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase();

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
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Profil" style={avatarImgStyle} />
                ) : (
                    <span style={avatarFallbackStyle}>{initials}</span>
                )}
            </button>

            {open && (
                <div role="menu" style={avatarMenuStyle}>
                    <div
                        style={{ ...avatarMenuItemStyle, opacity: 0.8, cursor: "default" }}
                    >
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
