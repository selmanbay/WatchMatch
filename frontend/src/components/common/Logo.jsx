import React from "react";

/**
 * WatchMatch Logo (Kırmızı-Beyaz)
 * - İkon: kırmızı klaket + beyaz "play"
 * - Yazı: "Watch" beyaz, "Match" kırmızı
 */
export default function Logo({ size = 36, compact = false }) {
    const RED = "#ef4444"; // kırmızı (Tailwind red-500 benzeri)
    const iconSize = size;

    const brandWrap = {
        display: "inline-flex",
        alignItems: "baseline",
        marginLeft: 10,
        gap: 4,
        userSelect: "none",
        whiteSpace: "nowrap"
    };

    const watchStyle = {
        fontWeight: 800,
        fontSize: Math.round(size * 0.78),
        lineHeight: 1,
        color: "#fff",
        letterSpacing: 0.2,
    };

    const matchStyle = {
        ...watchStyle,
        color: RED
    };

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {/* SVG ikon */}
            <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 36 36"
                role="img"
                aria-label="WatchMatch logosu"
            >
                {/* Klaket üst (kırmızı kapak) */}
                <path d="M6 6h18l4 7H10z" fill={RED} />
                {/* Klaket gövde (beyaz hat, şeffaf iç) */}
                <rect
                    x="6"
                    y="11"
                    width="24"
                    height="19"
                    rx="5"
                    fill="rgba(255,255,255,0.06)"
                    stroke={RED}
                    strokeWidth="1.4"
                />
                {/* Play üçgeni (beyaz) */}
                <polygon points="16,16 16,25 24,20.5" fill="#ffffff" />
            </svg>

            {!compact && (
                <span style={brandWrap}>
          <span style={watchStyle}>Watch</span>
          <span style={matchStyle}>Match</span>
        </span>
            )}
        </div>
    );
}
