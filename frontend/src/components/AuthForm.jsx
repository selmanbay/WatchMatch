// src/components/AuthForm.jsx
import React, { useMemo, useState, Suspense } from "react";
import {
    btnStyle,
    formInputStyle,
    authPageStyle,
    errorTextStyle,
    withError
} from "../styles/ui";

// Lazy import: dosya yoksa bile login ekranı render edilir
const RegistrationWizard = React.lazy(() => import("./register/RegistrationWizard"));

export default function AuthForm({ onSuccess }) {
    const [authMode, setAuthMode] = useState("login");

    // ==== LOGIN state ====
    const [cred, setCred] = useState({ email: "", password: "" });
    const [touched, setTouched] = useState({ email: false, password: false });
    const [loginError, setLoginError] = useState("");

    const errors = useMemo(() => {
        const e = {};
        if (touched.email) {
            const email = cred.email.trim();
            if (!email) e.email = "Email zorunludur.";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Geçerli bir email giriniz.";
        }
        if (touched.password && !cred.password.trim()) e.password = "Şifre zorunludur.";
        return e;
    }, [cred, touched]);

    const canLogin =
        cred.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cred.email.trim()) &&
        cred.password.trim();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");

        if (!canLogin) {
            setTouched({ email: true, password: true });
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cred.email, password: cred.password })
            });

            if (!res.ok) {
                let msg = "Giriş başarısız.";
                try {
                    const j = await res.json();
                    msg = j.message || msg;
                } catch {
                    try { msg = (await res.text()) || msg; } catch {}
                }
                throw new Error(msg);
            }

            const data = await res.json();
            onSuccess?.(data);
        } catch (err) {
            setLoginError(err?.message || "Giriş başarısız.");
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!canLogin) {
                setTouched({ email: true, password: true });
                return;
            }
            e.currentTarget.form?.requestSubmit?.();
        }
    };

    if (authMode === "register") {
        return (
            <>
                <Suspense fallback={<div style={authPageStyle()}>Yükleniyor...</div>}>
                    <RegistrationWizard
                        onSuccess={onSuccess}
                        onCancel={() => setAuthMode("login")}
                    />
                </Suspense>

                <p style={{ textAlign: "center", marginTop: 12, color: "rgba(255,255,255,0.7)" }}>
                    Zaten hesabın var mı?
                    <button
                        onClick={() => setAuthMode("login")}
                        style={{
                            marginLeft: 6,
                            color: "#dc2626",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline"
                        }}
                    >
                        Giriş Yap
                    </button>
                </p>
            </>
        );
    }

    // LOGIN ekranı
    return (
        <div style={authPageStyle()}>
            <div
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    padding: 40,
                    width: "100%",
                    maxWidth: 420,
                    backdropFilter: "blur(20px)",
                    color: "white"
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        fontSize: "2rem",
                        marginBottom: 30,
                        background: "linear-gradient(45deg, #dc2626, #ff6b6b)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}
                >
                    🔑 Giriş Yap
                </h1>

                <form onSubmit={handleLogin}>
                    {/* Email */}
                    <input
                        type="email"
                        autoComplete="email"
                        placeholder="Email"
                        value={cred.email}
                        onChange={(e) => setCred({ ...cred, email: e.target.value })}
                        onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                        onKeyDown={onKeyDown}
                        style={withError(
                            { ...formInputStyle, width: "100%" },
                            touched.email &&
                            (!cred.email.trim() ||
                                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cred.email.trim()))
                        )}
                    />
                    {errors.email && <div style={errorTextStyle}>{errors.email}</div>}

                    {/* Şifre */}
                    <input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Şifre"
                        value={cred.password}
                        onChange={(e) => setCred({ ...cred, password: e.target.value })}
                        onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                        onKeyDown={onKeyDown}
                        style={withError(
                            { ...formInputStyle, width: "100%", marginTop: 12 },
                            touched.password && !cred.password.trim()
                        )}
                    />
                    {errors.password && <div style={errorTextStyle}>{errors.password}</div>}

                    {loginError && (
                        <div style={{ ...errorTextStyle, marginTop: 8 }}>{loginError}</div>
                    )}

                    <button
                        type="submit"
                        disabled={!canLogin}
                        style={{
                            ...btnStyle,
                            width: "100%",
                            marginTop: 12,
                            opacity: canLogin ? 1 : 0.6
                        }}
                    >
                        Giriş Yap
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 20, color: "rgba(255,255,255,0.7)" }}>
                    Hesabın yok mu?
                    <button
                        onClick={() => setAuthMode("register")}
                        style={{
                            marginLeft: 6,
                            color: "#dc2626",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline"
                        }}
                    >
                        Kayıt Ol
                    </button>
                </p>
            </div>
        </div>
    );
}
