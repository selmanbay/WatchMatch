import React from "react";
import { btnStyle, selectStyle } from "../../styles/ui";

export default function StepPrefs({ pref, setPref, onBack, onSubmit }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>⚙️ Tercihler</h2>

            <select
                value={pref.sex}
                onChange={(e) => setPref({ ...pref, sex: e.target.value })}
                style={{ ...selectStyle, width: "100%" }}
            >
                <option value="">Cinsiyet (opsiyonel)</option>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
                <option value="other">Diğer</option>
            </select>

            <select
                value={pref.language}
                onChange={(e) => setPref({ ...pref, language: e.target.value })}
                style={{ ...selectStyle, width: "100%" }}
            >
                <option value="">Dil (opsiyonel)</option>
                <option value="TR">TR</option>
                <option value="EN">EN</option>
                <option value="DE">DE</option>
                <option value="FR">FR</option>
            </select>

            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                    onClick={onBack}
                    style={{ ...btnStyle, background: "rgba(255,255,255,0.15)" }}
                >
                    Geri
                </button>
                <button
                    onClick={onSubmit}
                    style={{ ...btnStyle, flex: 1 }}
                >
                    Kaydı Tamamla
                </button>
            </div>
        </div>
    );
}
