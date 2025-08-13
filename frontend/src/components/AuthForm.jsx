import React, { useState } from "react";
import { btnStyle, formInputStyle } from "../styles/ui";
import RegistrationWizard from "./register/RegistrationWizard";

export default function AuthForm({ onSuccess }) {
    const [authMode, setAuthMode] = useState("login");
    const [cred, setCred] = useState({ email: "", password: "" });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8080/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cred.email, password: cred.password })
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            onSuccess?.(data);
            alert("✅ Giriş başarılı!");
        } catch (err) {
            alert("❌ Giriş hatası: " + (err?.message || "Bilinmeyen hata"));
        }
    };

    if (authMode === "register") {
        return (
            <>
                <RegistrationWizard
                    onSuccess={onSuccess}
                    onCancel={() => setAuthMode("login")}
                />
                <p style={{ textAlign: "center", marginTop: 12, color: "rgba(255,255,255,0.7)" }}>
                    Zaten hesabın var mı?
                    <button
                        onClick={() => setAuthMode("login")}
                        style={{ marginLeft: 6, color: "#dc2626", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                    >
                        Giriş Yap
                    </button>
                </p>
            </>
        );
    }

    // LOGIN ekranı
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0f1419 0%, #1a2332 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
        >
            <div
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 20, padding: 40, width: "100%", maxWidth: 420,
                    backdropFilter: "blur(20px)", color: "white"
                }}
            >
                <h1
                    style={{
                        textAlign: "center", fontSize: "2rem", marginBottom: 30,
                        background: "linear-gradient(45deg, #dc2626, #ff6b6b)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                    }}
                >
                    🔑 Giriş Yap
                </h1>

                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={cred.email}
                        onChange={(e) => setCred({ ...cred, email: e.target.value })}
                        style={{ ...formInputStyle, marginBottom: 12 }}
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={cred.password}
                        onChange={(e) => setCred({ ...cred, password: e.target.value })}
                        style={{ ...formInputStyle, marginBottom: 20 }}
                    />
                    <button type="submit" style={{ ...btnStyle, width: "100%" }}>Giriş Yap</button>
                </form>

                <p style={{ textAlign: "center", marginTop: 20, color: "rgba(255,255,255,0.7)" }}>
                    Hesabın yok mu?
                    <button
                        onClick={() => setAuthMode("register")}
                        style={{ marginLeft: 6, color: "#dc2626", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                    >
                        Kayıt Ol
                    </button>
                </p>
            </div>
        </div>
    );
}
