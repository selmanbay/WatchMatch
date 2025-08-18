// src/components/register/RegistrationWizard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { authPageStyle } from "../../styles/ui";
import StepAccount from "./StepAccount";
import StepProfile from "./StepProfile";
import StepPrefs from "./StepPrefs";

export default function RegistrationWizard({ onSuccess, onCancel, onGoLogin }) {
    // ===== Form State =====
    const [credentials, setCredentials] = useState({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: ""
    });
    const [pref, setPref] = useState({ sex: "", language: "" });

    // Country (ID)
    const [selectedCountryId, setSelectedCountryId] = useState("");

    // ===== Countries =====
    const [countries, setCountries] = useState([]);
    const [countriesLoading, setCountriesLoading] = useState(false);
    const [countriesError, setCountriesError] = useState(null);

    // ===== Wizard Step =====
    const [step, setStep] = useState(1);

    // Küçük hata metni (sayfa üstü uyarı/alert yok!)
    const [submitError, setSubmitError] = useState("");

    // Fetch countries
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setCountriesLoading(true);
                const r = await fetch("http://localhost:8080/api/countries");
                if (!r.ok) throw new Error("Ülke servisi hatası");
                const data = await r.json();
                if (mounted) {
                    setCountries(Array.isArray(data) ? data : []);
                    setCountriesError(null);
                }
            } catch (e) {
                console.warn(e);
                if (mounted) setCountriesError("❌ Ülkeler alınamadı!");
            } finally {
                if (mounted) setCountriesLoading(false);
            }
        })();
        return () => (mounted = false);
    }, []);

    // ===== Validations =====
    const canNext1 = useMemo(
        () =>
            credentials.username.trim() &&
            credentials.email.trim() &&
            credentials.password.trim(),
        [credentials]
    );

    // Step 2 zorunlulukları: firstName + lastName + country
    const canNext2 = useMemo(
        () =>
            credentials.firstName.trim() &&
            credentials.lastName.trim() &&
            String(selectedCountryId).trim() !== "",
        [credentials, selectedCountryId]
    );

    // Step 3 zorunlulukları: sex + language (İKİSİ DE ZORUNLU)
    const canFinish3 = useMemo(
        () => pref.sex.trim() && pref.language.trim(),
        [pref]
    );

    const goNext = () => setStep((s) => Math.min(3, s + 1));
    const goBack = () => setStep((s) => Math.max(1, s - 1));

    // ===== Helpers =====
    async function linkCountry(userId, countryId) {
        const res = await fetch(
            `http://localhost:8080/api/users/${userId}/country/${countryId}`,
            { method: "PUT" }
        );
        if (!res.ok) throw new Error(await res.text());
        try {
            return await res.json(); // backend 200 + user dönebilir
        } catch {
            return null; // 204 vs.
        }
    }

    // ===== Submit (register → linkCountry → prefs REQUIRED) =====
    const submit = async () => {
        // Sayfa üstünde alert yok; küçük hata metnini StepPrefs altında göstereceğiz.
        setSubmitError("");

        // Step-3 guard: cinsiyet ve dil zorunlu
        if (!pref.sex?.trim()) {
            setStep(3);
            return setSubmitError("Lütfen cinsiyet seçiniz.");
        }
        if (!pref.language?.trim()) {
            setStep(3);
            return setSubmitError("Lütfen dil seçiniz.");
        }

        // Ek savunma: ülke seçimi zorunlu
        const countryIdNum =
            selectedCountryId !== "" && selectedCountryId !== null
                ? Number(selectedCountryId)
                : NaN;
        if (!countryIdNum || Number.isNaN(countryIdNum)) {
            setStep(2);
            return setSubmitError("Lütfen ülke seçiniz.");
        }

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
                    // NOT: countryId'yi body'ye koymuyoruz; ayrı PUT ile bağlayacağız
                })
            });
            if (!regRes.ok) throw new Error(await regRes.text());
            const savedUser = await regRes.json();

            // 2) COUNTRY LINK (AuthForm’daki gibi)
            let userToSet = savedUser;
            try {
                const updated = await linkCountry(savedUser.id, countryIdNum);
                if (updated) userToSet = updated;
            } catch (err) {
                console.warn("Country bağlama başarısız:", err?.message || err);
                // ülke bağlanamasa bile kayıt sürsün; küçük not düşmek istersen:
                setSubmitError("Ülke bağlanırken sorun oluştu, daha sonra tekrar deneyebilirsiniz.");
            }

            // 3) PREFERENCES (ARTIK ZORUNLU)
            const prefRes = await fetch(
                `http://localhost:8080/api/users/${savedUser.id}/preference`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sex: pref.sex,          // boş gönderilmez (yukarıda zorunlu)
                        language: pref.language // boş gönderilmez (yukarıda zorunlu)
                    })
                }
            );
            if (!prefRes.ok) {
                const msg = await prefRes.text();
                throw new Error(msg || "Preference kaydı başarısız");
            }

            // Başarılı — üstte alert yerine direkt callback
            onSuccess?.(userToSet);
        } catch (err) {
            setSubmitError(
                typeof err?.message === "string" ? err.message : "Kayıt sırasında beklenmeyen bir hata oluştu."
            );
        }
    };

    // ===== Local styles: switch row (kırmızı-beyaz tema) =====
    const switchRowStyle = {
        marginTop: 12,
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        color: "rgba(255,255,255,0.85)"
    };

    const switchLinkStyle = {
        background: "transparent",
        border: "none",
        padding: 0,
        color: "#ef4444", // kırmızı
        fontWeight: 700,
        cursor: "pointer",
        textDecoration: "none"
    };

    // ===== Render =====
    return (
        <div style={authPageStyle()}>
            {/* arka plan: public/images/auth-bg.webp */}
            <div
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    padding: 40,
                    width: "100%",
                    maxWidth: 700,
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
                                background:
                                    i <= step
                                        ? "linear-gradient(45deg, #dc2626, #ff6b6b)"
                                        : "rgba(255,255,255,0.2)"
                            }}
                        />
                    ))}
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                    <StepAccount
                        values={credentials}
                        onChange={(patch) => setCredentials((s) => ({ ...s, ...patch }))}
                        onNext={goNext}
                        canNext={!!canNext1}
                        onCancel={onCancel}
                    />
                )}

                {/* STEP 2 */}
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
                        canNext={!!canNext2} // ülke seçilmeden ileri gidemez
                    />
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <StepPrefs
                        pref={pref}
                        setPref={setPref}
                        onBack={goBack}
                        onSubmit={submit}
                        canSubmit={!!canFinish3}   // butonu StepPrefs içinde disable etmek için
                        submitError={submitError}  // küçük kırmızı metin olarak gösterilecek
                    />
                )}

                {/* 🔴 Modal İÇİ alt satır: "Zaten hesabın var mı?" */}
                <div style={switchRowStyle}>
                    <span>Zaten hesabın var mı?</span>
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof onGoLogin === "function") onGoLogin();
                            else console.warn("RegistrationWizard: onGoLogin prop'u sağlanmadı.");
                        }}
                        style={switchLinkStyle}
                        aria-label="Giriş sayfasına geç"
                    >
                        Giriş Yap
                    </button>
                </div>
            </div>
        </div>
    );
}
