import React from "react";
import { btnStyle, formInputStyle } from "../../styles/ui";

export default function StepAccount({ values, onChange, onNext, canNext, onCancel }) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <h2 style={{ marginTop: 0, marginBottom: 8 }}>🧾 Hesap Bilgileri</h2>

                    <input
                        type="text"
                        placeholder="Kullanıcı adı"
                        value={values.username}
                        onChange={(e) => onChange({ username: e.target.value })}
                        style={{ ...formInputStyle, width: "100%" }}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={values.email}
                        onChange={(e) => onChange({ email: e.target.value })}
                        style={{ ...formInputStyle, width: "100%" }}
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={values.password}
                        onChange={(e) => onChange({ password: e.target.value })}
                        style={{ ...formInputStyle, width: "100%" }}
                    />

                    {/* Buton satırı: solda küçük, sağda tam genişlik */}
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                            <button
                                onClick={onCancel}
                                style={{ ...btnStyle, background: "rgba(255,255,255,0.15)" }}
                            >
                                    İptal
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
