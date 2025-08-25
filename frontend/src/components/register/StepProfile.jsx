// src/components/register/StepProfile.jsx
import React, { useMemo, useState } from "react";
import {
    btnStyle,
    formInputStyle,
    selectStyle,
    errorTextStyle,
    withError
} from "../../styles/ui";

export default function StepProfile({
                                        values,
                                        onChange,
                                        selectedCountryId,
                                        setSelectedCountryId,
                                        countries,
                                        countriesLoading,
                                        countriesError,
                                        onNext,
                                        onBack,
                                        canNext
                                    }) {
    // Input altı kırmızı uyarılar için touched durumu
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        country: false
    });

    // Alan bazlı hatalar
    const errors = useMemo(() => {
        const e = {};
        if (touched.firstName && !values.firstName.trim()) e.firstName = "Ad zorunludur.";
        if (touched.lastName && !values.lastName.trim()) e.lastName = "Soyad zorunludur.";
        if (touched.country && !String(selectedCountryId).trim()) e.country = "Ülke zorunludur.";
        return e;
    }, [values, selectedCountryId, touched]);

    // Devam tıklanınca, eksikler varsa alanları işaretle
    const handleNext = () => {
        if (!canNext) {
            setTouched({ firstName: true, lastName: true, country: true });
            return;
        }
        onNext?.();
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>👤 Profil Bilgileri</h2>

            {/* Ad */}
            <input
                type="text"
                placeholder="Ad"
                value={values.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                onBlur={() => setTouched((s) => ({ ...s, firstName: true }))}
                style={withError(
                    { ...formInputStyle, width: "100%" },
                    touched.firstName && !values.firstName.trim()
                )}
            />
            {errors.firstName && <div style={errorTextStyle}>{errors.firstName}</div>}

            {/* Soyad */}
            <input
                type="text"
                placeholder="Soyad"
                value={values.lastName}
                onChange={(e) => onChange({ lastName: e.target.value })}
                onBlur={() => setTouched((s) => ({ ...s, lastName: true }))}
                style={withError(
                    { ...formInputStyle, width: "100%" },
                    touched.lastName && !values.lastName.trim()
                )}
            />
            {errors.lastName && <div style={errorTextStyle}>{errors.lastName}</div>}

            {/* Ülke */}
            <select
                value={selectedCountryId}
                onChange={(e) => setSelectedCountryId(e.target.value)}
                onBlur={() => setTouched((s) => ({ ...s, country: true }))}
                style={withError(
                    { ...selectStyle, width: "100%" },
                    touched.country && !String(selectedCountryId).trim()
                )}
                disabled={countriesLoading || countriesError}
            >
                <option value="">
                    {countriesLoading
                        ? "Yükleniyor..."
                        : countriesError
                            ? "Ülke alınamadı"
                            : "Ülke"}
                </option>
                {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.countryName}
                    </option>
                ))}
            </select>
            {errors.country && <div style={errorTextStyle}>{errors.country}</div>}

            {/* Butonlar */}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                    type="button"
                    onClick={onBack}
                    style={{ ...btnStyle, background: "rgba(255,255,255,0.15)" }}
                >
                    Geri
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext}
                    style={{ ...btnStyle, flex: 1, opacity: canNext ? 1 : 0.6 }}
                >
                    Devam Et
                </button>
            </div>
        </div>
    );
}
