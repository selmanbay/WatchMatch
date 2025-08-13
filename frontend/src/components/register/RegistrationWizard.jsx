import React, { useEffect, useMemo, useState } from "react";
import { authPageStyle } from "../../styles/ui";
import StepAccount from "./StepAccount";
import StepProfile from "./StepProfile";
import StepPrefs from "./StepPrefs";

export default function RegistrationWizard({ onSuccess, onCancel }) {
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

    // ===== Submit (register → linkCountry → prefs) =====
    const submit = async () => {
        try {
            // Defensive: country must exist (step 2 zaten engelliyor ama yine de)
            const countryIdNum =
                selectedCountryId !== "" && selectedCountryId !== null
                    ? Number(selectedCountryId)
                    : NaN;
            if (!countryIdNum || Number.isNaN(countryIdNum)) {
                alert("❌ Lütfen ülke seçiniz.");
                setStep(2);
                return;
            }

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
                    // DİKKAT: countryId'yi body'ye koymuyoruz; ayrı PUT ile bağlayacağız
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
            }

            // 3) OPTIONAL PREFERENCES
            const hasAnyPref =
                (pref.sex && pref.sex.trim() !== "") ||
                (pref.language && pref.language.trim() !== "");
            if (hasAnyPref) {
                const prefRes = await fetch(
                    `http://localhost:8080/api/users/${savedUser.id}/preference`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            sex: pref.sex || "-",
                            language: pref.language || "-"
                        })
                    }
                );
                if (!prefRes.ok) {
                    console.warn("Preference kaydı başarısız:", await prefRes.text());
                }
            }

            onSuccess?.(userToSet);
            alert("✅ Kayıt başarılı!");
        } catch (err) {
            alert("❌ Kayıt hatası: " + (err?.message || "Bilinmeyen hata"));
        }
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
                    <StepPrefs pref={pref} setPref={setPref} onBack={goBack} onSubmit={submit} />
                )}
            </div>
        </div>
    );
}
