import React from "react";
import { btnStyle, formInputStyle, selectStyle } from "../../styles/ui";

export default function StepProfile({
                                        values, onChange,
                                        selectedCountryId, setSelectedCountryId,
                                        countries, countriesLoading, countriesError,
                                        onNext, onBack, canNext
                                    }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>👤 Profil Bilgileri</h2>

            {/* Ad & Soyad: ALT ALTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                    type="text"
                    placeholder="Ad"
                    value={values.firstName}
                    onChange={(e) => onChange({ firstName: e.target.value })}
                    style={{ ...formInputStyle, width: "100%" }}
                />
                <input
                    type="text"
                    placeholder="Soyad"
                    value={values.lastName}
                    onChange={(e) => onChange({ lastName: e.target.value })}
                    style={{ ...formInputStyle, width: "100%" }}
                />
            </div>

            <select
                value={selectedCountryId}
                onChange={(e) => setSelectedCountryId(e.target.value)}
                style={{ ...selectStyle, width: "100%" }}
                disabled={countriesLoading || countriesError}
            >
                <option value="">
                    {countriesLoading ? "Yükleniyor..." : countriesError ? "Ülke alınamadı" : "Ülke (opsiyonel)"}
                </option>
                {countries.map((c) => (
                    <option key={c.id} value={c.id}>{c.countryName}</option>
                ))}
            </select>

            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                    onClick={onBack}
                    style={{ ...btnStyle, background: "rgba(255,255,255,0.15)" }}
                >
                    Geri
                </button>
                <button
                    onClick={onNext}
                    disabled={!canNext}
                    style={{ ...btnStyle, flex: 1, opacity: canNext ? 1 : 0.6 }}
                >
                    Devam Et
                </button>
            </div>
        </div>
    );
}
