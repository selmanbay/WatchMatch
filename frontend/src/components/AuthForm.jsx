import React, { useEffect, useState } from "react";
import { btnStyle, formInputStyle, selectStyle } from "../styles/ui";

export default function AuthForm({ onSuccess }) {
    const [authMode, setAuthMode] = useState("login");

    const [credentials, setCredentials] = useState({
        username: "", email: "", password: "", firstName: "", lastName: ""
    });
    const [pref, setPref] = useState({ sex: "", language: "" });

    const [countries, setCountries] = useState([]);
    const [countriesLoading, setCountriesLoading] = useState(false);
    const [countriesError, setCountriesError] = useState(null);
    const [selectedCountryId, setSelectedCountryId] = useState("");

    // Ülkeleri yükle (aynı URL)
    useEffect(() => {
        setCountriesLoading(true);
        fetch("http://localhost:8080/api/countries")
            .then((r) => {
                if (!r.ok) throw new Error("Ülke servisi hatası");
                return r.json();
            })
            .then((data) => { setCountries(data || []); setCountriesError(null); })
            .catch((e) => { console.warn(e); setCountriesError("❌ Ülkeler alınamadı!"); })
            .finally(() => setCountriesLoading(false));
    }, []);

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            if (authMode === "login") {
                const res = await fetch("http://localhost:8080/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: credentials.email, password: credentials.password })
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                onSuccess?.(data);
                alert("✅ Giriş başarılı!");
                return;
            }

            // REGISTER
            const regRes = await fetch("http://localhost:8080/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                    username: credentials.username,
                    firstName: credentials.firstName,
                    lastName: credentials.lastName
                })
            });
            if (!regRes.ok) throw new Error(await regRes.text());
            const savedUser = await regRes.json();

            // Opsiyonel: preference
            if ((pref.sex && pref.sex.trim() !== "") || (pref.language && pref.language.trim() !== "")) {
                const prefRes = await fetch(`http://localhost:8080/api/users/${savedUser.id}/preference`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sex: pref.sex || "-", language: pref.language || "-" })
                });
                if (!prefRes.ok) console.warn("Preference kaydı başarısız:", await prefRes.text());
            }

            onSuccess?.(savedUser);
            alert("✅ Kayıt başarılı!");
        } catch (err) {
            alert("❌ Kayıt/Giriş hatası: " + (typeof err.message === "string" ? err.message : "Bilinmeyen hata"));
        }
    };

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
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "20px",
                    padding: "40px",
                    width: "100%",
                    maxWidth: "420px",
                    backdropFilter: "blur(20px)",
                    color: "white"
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        fontSize: "2rem",
                        marginBottom: "30px",
                        background: "linear-gradient(45deg, #dc2626, #ff6b6b)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}
                >
                    {authMode === "login" ? "🔑 Giriş Yap" : "📝 Kayıt Ol"}
                </h1>

                <form onSubmit={handleAuth}>
                    {authMode === "register" && (
                        <>
                            <input
                                type="text"
                                placeholder="Kullanıcı adı"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                style={{ ...formInputStyle, marginBottom: 12 }}
                            />
                            <input
                                type="text"
                                placeholder="Ad"
                                value={credentials.firstName}
                                onChange={(e) => setCredentials({ ...credentials, firstName: e.target.value })}
                                style={{ ...formInputStyle, marginBottom: 12 }}
                            />
                            <input
                                type="text"
                                placeholder="Soyad"
                                value={credentials.lastName}
                                onChange={(e) => setCredentials({ ...credentials, lastName: e.target.value })}
                                style={{ ...formInputStyle, marginBottom: 12 }}
                            />

                            {/* Ülke seçimi */}
                            <select
                                value={selectedCountryId}
                                onChange={(e) => setSelectedCountryId(e.target.value)}
                                style={{ ...selectStyle, marginBottom: 12 }}
                                disabled={countriesLoading || countriesError}
                            >
                                <option value="">
                                    {countriesLoading ? "Yükleniyor..." : countriesError ? "Ülke alınamadı" : "Ülke (opsiyonel)"}
                                </option>
                                {countries.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.countryName}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        style={{ ...formInputStyle, marginBottom: 12 }}
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        style={{ ...formInputStyle, marginBottom: 12 }}
                    />

                    {authMode === "register" && (
                        <>
                            <select
                                value={pref.sex}
                                onChange={(e) => setPref({ ...pref, sex: e.target.value })}
                                style={{ ...selectStyle, marginBottom: 12 }}
                            >
                                <option value="">Cinsiyet (opsiyonel)</option>
                                <option value="male">Erkek</option>
                                <option value="female">Kadın</option>
                                <option value="other">Diğer</option>
                            </select>

                            <select
                                value={pref.language}
                                onChange={(e) => setPref({ ...pref, language: e.target.value })}
                                style={{ ...selectStyle, marginBottom: 20 }}
                            >
                                <option value="">Dil (opsiyonel)</option>
                                <option value="TR">TR</option>
                                <option value="EN">EN</option>
                                <option value="DE">DE</option>
                                <option value="FR">FR</option>
                            </select>
                        </>
                    )}

                    <button type="submit" style={{ ...btnStyle, width: "100%" }}>
                        {authMode === "login" ? "Giriş Yap" : "Kayıt Ol"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "20px", color: "rgba(255, 255, 255, 0.7)" }}>
                    {authMode === "login" ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}
                    <button
                        onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                        style={{
                            marginLeft: "5px",
                            color: "#dc2626",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline"
                        }}
                    >
                        {authMode === "login" ? "Kayıt Ol" : "Giriş Yap"}
                    </button>
                </p>
            </div>
        </div>
    );
}
