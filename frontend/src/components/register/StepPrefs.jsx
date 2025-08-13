// src/components/register/StepPrefs.jsx
import React, { useMemo, useState } from "react";
import { btnStyle, selectStyle, errorTextStyle, withError } from "../../styles/ui";

export default function StepPrefs({ pref, setPref, onBack, onSubmit }) {
    // Hata mesajlarını select altında göstermek için touched durumu
    const [touched, setTouched] = useState({ sex: false, language: false });

    // Alan bazlı hataları hesapla
    const errors = useMemo(() => {
        const e = {};
        if (touched.sex && !pref.sex.trim()) e.sex = "Cinsiyet zorunludur.";
        if (touched.language && !pref.language.trim()) e.language = "Dil zorunludur.";
        return e;
    }, [pref, touched]);

    const canSubmit = pref.sex.trim() && pref.language.trim();

    const handleSubmit = () => {
        if (!canSubmit) {
            setTouched({ sex: true, language: true });
            return;
        }
        onSubmit?.();
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>⚙️ Tercihler</h2>

            {/* Cinsiyet */}
            <select
                value={pref.sex}
                onChange={(e) => setPref({ ...pref, sex: e.target.value })}
                onBlur={() => setTouched((s) => ({ ...s, sex: true }))}
                style={withError(
                    { ...selectStyle, width: "100%" },
                    touched.sex && !pref.sex.trim()
                )}
            >
                <option value="">Cinsiyet (zorunlu)</option>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
                <option value="other">Diğer</option>
            </select>
            {errors.sex && <div style={errorTextStyle}>{errors.sex}</div>}

            {/* Dil */}
            <select
                value={pref.language}
                onChange={(e) => setPref({ ...pref, language: e.target.value })}
                onBlur={() => setTouched((s) => ({ ...s, language: true }))}
                style={withError(
                    { ...selectStyle, width: "100%" },
                    touched.language && !pref.language.trim()
                )}
            >
                <option value="">Dil (zorunlu)</option>
                <option value="TR">TR</option>
                <option value="EN">EN</option>
                <option value="DE">DE</option>
                <option value="FR">FR</option>
            </select>
            {errors.language && <div style={errorTextStyle}>{errors.language}</div>}

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
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    style={{ ...btnStyle, flex: 1, opacity: canSubmit ? 1 : 0.6 }}
                >
                    Kaydı Tamamla
                </button>
            </div>
        </div>
    );
}
