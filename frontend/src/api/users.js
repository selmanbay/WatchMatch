// src/api/users.js
import { request } from "./client";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

export const usersApi = {
    // Ülkeler
    countries: () => request("/countries"),

    // Auth
    login: (email, password) =>
        request("/users/login", { method: "POST", body: { email, password } }),
    register: (payload) =>
        request("/users/register", { method: "POST", body: payload }),

    // Tercihler
    savePreference: (userId, pref) =>
        request(`/users/${userId}/preference`, { method: "POST", body: pref }),
    getPreference: (userId) => request(`/users/${userId}/preference`),

    // Kullanıcı
    getUser: (userId) => request(`/users/${userId}`),

    // Ülke güncelle
    updateCountry: (userId, countryId) =>
        request(`/users/${userId}/country/${countryId}`, { method: "PUT" }),

    // Avatarı URL ile güncelle (JSON): PATCH /users/{userId}/avatar  { avatarUrl }
    setAvatarUrl: (userId, avatarUrl) =>
        request(`/users/${userId}/avatar`, {
            method: "PATCH",
            body: { avatarUrl },
        }),

    // Avatar dosya yükleme (multipart/form-data)
    // Dönen değer: BE tarafında UserDto (avatarUrl/ppLink içerir)
    uploadAvatar: async (userId, file) => {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(`${API_BASE}/users/${userId}/avatar`, {
            method: "POST",
            body: fd,
        });

        if (!res.ok) {
            let msg = "Avatar yükleme başarısız";
            try {
                msg = await res.text();
            } catch (_) {}
            throw new Error(msg);
        }
        return res.json(); // UserDto veya { avatarUrl } döner
    },
};

// İsteğe bağlı named export’lar
export const {
    countries,
    login,
    register,
    savePreference,
    getPreference,
    getUser,
    updateCountry,
    setAvatarUrl,
    uploadAvatar,
} = usersApi;
