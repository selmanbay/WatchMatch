// src/components/BestMatchCard.js
import React from "react";

const BestMatchCard = ({ match, onRefresh }) => {
    if (!match) return null;

    const { username, score, avatarUrl, countryId } = match;

    // Skor rengi belirleme
    const getScoreColor = (score) => {
        if (score >= 80) return "#22c55e"; // yeşil
        if (score >= 60) return "#f59e0b"; // amber
        if (score >= 40) return "#f97316"; // orange
        return "#ef4444"; // kırmızı
    };

    const scoreColor = getScoreColor(score);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "24px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "15px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                maxWidth: "500px",
                margin: "0 auto"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            }}
        >
            {/* Avatar */}
            <div
                style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: `3px solid ${scoreColor}`,
                    flexShrink: 0,
                    position: "relative"
                }}
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={username}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                            color: "rgba(255, 255, 255, 0.7)"
                        }}
                    >
                        👤
                    </div>
                )}
            </div>

            {/* Kullanıcı bilgileri */}
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: "1.3rem",
                        fontWeight: "600",
                        color: "#ffffff",
                        marginBottom: "8px"
                    }}
                >
                    {username}
                </div>
                <div
                    style={{
                        fontSize: "0.9rem",
                        color: "rgba(255, 255, 255, 0.6)",
                        marginBottom: "12px"
                    }}
                >
                    Film zevkleriniz çok uyumlu!
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.85rem" }}>
                        Uyum:
                    </span>
                    <div
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "10px",
                            padding: "4px 12px",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: scoreColor,
                            border: `1px solid ${scoreColor}40`
                        }}
                    >
                        %{Math.round(score)}
                    </div>
                </div>
            </div>

            {/* Yenile butonu */}
            <div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onRefresh) onRefresh();
                    }}
                    style={{
                        backgroundColor: "transparent",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    }}
                >
                    🔄 Yenile
                </button>
            </div>
        </div>
    );
};

export default BestMatchCard;