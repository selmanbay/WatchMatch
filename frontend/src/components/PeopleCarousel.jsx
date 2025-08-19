// src/components/PeopleCarousel.jsx
import React, { useMemo, useRef, useState } from "react";

export default function PeopleCarousel({
                                           directors = [],
                                           actors = [],
                                           onPickPerson
                                       }) {
    // --- helpers ---
    const toHttps = (p) => {
        if (!p) return null;
        if (String(p).startsWith("http")) return p;
        if (String(p).startsWith("/")) return `https://image.tmdb.org/t/p/w185${p}`;
        return p;
    };

    // Diziler string ya da obje olabilir → normalize et
    const items = useMemo(() => {
        const mapOne = (x, role) => {
            const name =
                (typeof x === "string" ? x : x?.name || x?.original_name || x?.label || "") || "";
            const photo =
                toHttps(
                    (typeof x === "string" ? null : x?.profile_path || x?.photo || x?.image) || null
                ) || null;
            const id = (typeof x === "string" ? null : x?.id) ?? `${role}-${name}`;
            return { id, name, role, photo };
        };
        const ds = (directors || []).map((d) => mapOne(d, "director"));
        const as = (actors || []).map((a) => mapOne(a, "actor"));
        return [...ds, ...as].filter((p) => p.name);
    }, [directors, actors]);

    if (!items.length) return null;

    // --- drag + wheel scroll ---
    const ref = useRef(null);
    const drag = useRef({ down: false, startX: 0, startLeft: 0 });
    const [grabbing, setGrabbing] = useState(false);

    const scrollBy = (dx) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

    const onPointerDown = (e) => {
        if (!ref.current) return;
        ref.current.setPointerCapture?.(e.pointerId);
        drag.current = { down: true, startX: e.clientX, startLeft: ref.current.scrollLeft };
        setGrabbing(true);
    };
    const onPointerMove = (e) => {
        if (!drag.current.down || !ref.current) return;
        ref.current.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
    };
    const onPointerUp = (e) => {
        drag.current.down = false;
        ref.current?.releasePointerCapture?.(e.pointerId);
        setGrabbing(false);
    };
    const onWheel = (e) => {
        if (!ref.current) return;
        ref.current.scrollLeft += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    };

    // --- styles ---
    const wrapStyle = {
        position: "relative",
        marginTop: 10
    };
    const railStyle = {
        display: "flex",
        gap: 12,
        overflowX: "auto",
        overflowY: "hidden",
        padding: "6px 4px 10px 4px",
        scrollSnapType: "x proximity",
        WebkitOverflowScrolling: "touch",
        overscrollBehaviorX: "contain",
        maskImage:
            "linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)",
        cursor: grabbing ? "grabbing" : "grab"
    };
    const arrowBtn = {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: 34,
        height: 34,
        borderRadius: 10,
        background: "rgba(0,0,0,.55)",
        border: "1px solid rgba(255,255,255,.2)",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        zIndex: 2,
        userSelect: "none"
    };

    const cardStyle = {
        minWidth: 112,
        maxWidth: 112,
        scrollSnapAlign: "start",
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 12,
        padding: 10,
        textAlign: "center",
        color: "#fff",
        cursor: "pointer",
        transition: "transform .12s ease",
    };

    const avatarBox = {
        width: 84,
        height: 84,
        borderRadius: "50%",
        overflow: "hidden",
        margin: "0 auto 8px",
        background: "linear-gradient(135deg,#1a2332,#0f1419)",
        border: "1px solid rgba(255,255,255,.15)",
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        letterSpacing: .3
    };

    const rolePill = (role) => ({
        display: "inline-block",
        marginTop: 6,
        padding: "4px 8px",
        fontSize: 12,
        borderRadius: 999,
        background: role === "director" ? "rgba(220,38,38,.16)" : "rgba(255,255,255,.10)",
        border: `1px solid ${role === "director" ? "rgba(252,165,165,.35)" : "rgba(255,255,255,.18)"}`,
        color: "#fff",
        fontWeight: 700
    });

    // --- sub: person card ---
    const PersonCard = ({ p }) => {
        const initials = p.name
            .split(" ")
            .slice(0, 2)
            .map((s) => s[0])
            .join("")
            .toUpperCase();

        return (
            <div
                style={cardStyle}
                onClick={() => onPickPerson?.(p.role, p.name)}
                onMouseDown={(e) => e.preventDefault()} // drag sırasında text seçilmesin
                title={`${p.role === "director" ? "Yönetmen" : "Oyuncu"}: ${p.name}`}
            >
                <div style={avatarBox}>
                    {p.photo ? (
                        <img
                            src={p.photo}
                            alt={p.name}
                            draggable={false}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                    ) : (
                        <span style={{ opacity: .85 }}>{initials}</span>
                    )}
                </div>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}
                >
                    {p.name}
                </div>
                <div style={rolePill(p.role)}>{p.role === "director" ? "Yönetmen" : "Oyuncu"}</div>
            </div>
        );
    };

    return (
        <div style={wrapStyle}>
            <button style={{ ...arrowBtn, left: 0 }} onClick={() => scrollBy(-320)} aria-label="Sol">‹</button>

            <div
                ref={ref}
                style={railStyle}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onWheel={onWheel}
            >
                {items.map((p) => (
                    <PersonCard key={`${p.role}-${p.id ?? p.name}`} p={p} />
                ))}
            </div>

            <button style={{ ...arrowBtn, right: 0 }} onClick={() => scrollBy(320)} aria-label="Sağ">›</button>
        </div>
    );
}
