// src/components/register/StepAccount.jsx
import React, { useMemo, useState } from "react";
import { btnStyle, formInputStyle, errorTextStyle, withError } from "../../styles/ui";

export default function StepAccount({ values, onChange, onNext, onCancel }) {
    // Input altı hata metinleri için
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false
    });

    // Alan bazlı doğrulamalar
    const errors = useMemo(() => {
        const e = {};
        if (touched.username && !values.username.trim()) e.username = "Kullanıcı adı zorunludur.";
        if (touched.email) {
            const email = values.email.trim();
            if (!email) e.email = "Email zorunludur.";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Geçerli bir email giriniz.";
        }
        if (touched.password) {
            const pwd = values.password;
            if (!pwd.trim()) e.password = "Şifre zorunludur.";
            else if (pwd.length < 6) e.password = "Şifre en az 6 karakter olmalı.";
        }
        return e;
    }, [values, touched]);

    // İlerlemeden önce asgari koşullar
    const localCanNext =
        values.username.trim() &&
        values.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) &&
        values.password.trim().length >= 6;

    // İlerleme kontrolü (mutlaka buradan geçsin)
    const handleNext = () => {
        if (!localCanNext) {
            setTouched({ username: true, email: true, password: true });
            return;
        }
        onNext?.();
    };

    // Enter ile de ilerleyebilmek için
    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleNext();
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>🧾 Hesap Bilgileri</h2>

            {/* Kullanıcı adı */}
            <input
                type="text"
                placeholder="Kullanıcı adı"
                value={values.username}
                onChange={(e) => onChange({ username: e.target.value })}
                onBlur={() => setTouched((s) => ({ ...s, username: true }))}
                onKeyDown={onKeyDown}
                style={withError(
                    { ...formInputStyle, width: "100%" },
                    touched.username && !values.username.trim()
                )}
            />
            {errors.username && <div style={errorTextStyle}>{errors.username}</div>}

            {/* Email */}
            <input
                type="email"
                placeholder="Email"
                value={values.email}
                onChange={(e) => onChange({ email: e.target.value })}
                onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                onKeyDown={onKeyDown}
                style={withError(
                    { ...formInputStyle, width: "100%" },
                    touched.email &&
                    (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
                )}
            />
            {errors.email && <div style={errorTextStyle}>{errors.email}</div>}

            {/* Şifre */}
            <input
                type="password"
                placeholder="Şifre"
                value={values.password}
                onChange={(e) => onChange({ password: e.target.value })}
                onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                onKeyDown={onKeyDown}
                style={withError(
                    { ...formInputStyle, width: "100%" },
                    touched.password && (!values.password.trim() || values.password.length < 6)
                )}
            />
            {errors.password && <div style={errorTextStyle}>{errors.password}</div>}

            {/* Butonlar */}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{ ...btnStyle, background: "rgba(255,255,255,0.15)" }}
                >
                    İptal
                </button>
                {/* İlerleme sadece handleNext ile yapılır */}
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!localCanNext}
                    style={{ ...btnStyle, flex: 1, opacity: localCanNext ? 1 : 0.6 }}
                >
                    Devam Et
                </button>
            </div>
        </div>
    );
}
