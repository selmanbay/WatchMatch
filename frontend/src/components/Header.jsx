import React from "react";
import {
    headerStyle, navContainerStyle, logoStyle, logoIconStyle, btnStyle
} from "../styles/ui";

export default function Header({ searchQuery, setSearchQuery, onSearch, onLogout }) {
    return (
        <header style={headerStyle}>
            <div style={navContainerStyle}>
                <div style={logoStyle}>
                    <div style={logoIconStyle}>WM</div>
                    <span>WatchMatch</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Film ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onSearch()}
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
                                right: "15px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "rgba(255, 255, 255, 0.6)",
                                cursor: "pointer"
                            }}
                        >
                            🔍
                        </button>
                    </div>
                    <button onClick={onLogout} style={btnStyle}>🚪 Çıkış Yap</button>
                </div>
            </div>
        </header>
    );
}
