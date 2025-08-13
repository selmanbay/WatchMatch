// src/components/register/RegistrationWizard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { authPageStyle } from "../../styles/ui";
import StepAccount from "./StepAccount";
import StepProfile from "./StepProfile";
import StepPrefs from "./StepPrefs";

export default function RegistrationWizard({ onSuccess, onCancel }) {
    // Form state
    const [credentials, setCredentials] = useState({
        username: "", email: "", password: "", firstName: "", lastName: ""
    });
    const [pref, setPref] = useState({ sex: "", language: "" });
    const [selectedCountryId, setSelectedCountryId] = useState("");

    // Countries
    const [countries, setCountries] = useState([]);
    const [countriesLoading, setCountriesLoading] = useState(false);
    const [countriesError, setCountriesError] = useState(null);

    // Steps
    const [step, setStep] = useState(1);

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

    // Basit validasyonlar
    const canNext1 = useMemo(() =>
            credentials.username.trim() && credentials.email.trim() && credentials.password.trim(),
        [credentials]
    );
    const canNext2 = useMemo(() =>
            credentials.firstName.trim() && credentials.lastName.trim(),
        [credentials]
    );

    const goNext = () => setStep((s) => Math.min(3, s + 1));
    const goBack = () => setStep((s) => Math.max(1, s - 1));

    const submit = async () => {
        try {
            // 1) REGISTER
            const regRes = await fetch("http://localhost:8080/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                    username: credentials.username,
                    firstName: credentials.firstName,
                    lastName: credentials.lastName
                    // backend countryId bekliyorsa aç:
                    // , countryId: selectedCountryId || null
                })
            });
            if (!regRes.ok) throw new Error(await regRes.text());
            const savedUser = await regRes.json();

            // 2) Opsiyonel preferences
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
            alert("❌ Kayıt hatası: " + (err?.message || "Bilinmeyen hata"));
        }
    };

    return (
        <div style={authPageStyle()}> {/* arka plan: public/images/auth-bg.webp */}
            <div
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    padding: 40,
                    width: "100%",
                    maxWidth: 700, // geniş kutu
                    color: "white",
                    backdropFilter: "blur(20px)"
                }}
            >
                {/* Stepper */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: 6,
                                borderRadius: 999,
                                background: i <= step ? "linear-gradient(45deg, #dc2626, #ff6b6b)" : "rgba(255,255,255,0.2)"
                            }}
                        />
                    ))}
                </div>

                {step === 1 && (
                    <StepAccount
                        values={credentials}
                        onChange={(patch) => setCredentials((s) => ({ ...s, ...patch }))}
                        onNext={goNext}
                        canNext={!!canNext1}
                        onCancel={onCancel}
                    />
                )}

                {step === 2 && (
                    <StepProfile
                        values={credentials}
                        onChange={(patch) => setCredentials((s) => ({ ...s, ...patch }))}
                        selectedCountryId={selectedCountryId}
                        setSelectedCountryId={setSelectedCountryId}
                        countries={countries}
                        countriesLoading={countriesLoading}
                        countriesError={countriesError}
                        onNext={goNext}
                        onBack={goBack}
                        canNext={!!canNext2}
                    />
                )}

                {step === 3 && (
                    <StepPrefs
                        pref={pref}
                        setPref={setPref}
                        onBack={goBack}
                        onSubmit={submit}
                    />
                )}
            </div>
        </div>
    );
}
