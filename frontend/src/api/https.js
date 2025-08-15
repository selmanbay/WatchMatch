// src/api/http.js
const BASE_URL = "http://localhost:8080";

export function getAuthToken() {
    return localStorage.getItem("authToken");
}

export function authHeaders(extra = {}) {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        ...(extra || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

/**
 * authFetch: otomatik Authorization header ekler (token varsa).
 * usage: authFetch("/api/movies").then(r => r.json())
 */
export function authFetch(path, options = {}) {
    const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
    const headers = authHeaders(options.headers);
    return fetch(url, { ...options, headers });
}

/**
 * Küçük yardımcılar
 */
export const http = {
    get: (path) => authFetch(path),
    post: (path, body) =>
        authFetch(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) =>
        authFetch(path, { method: "PUT", body: JSON.stringify(body) }),
    del: (path) => authFetch(path, { method: "DELETE" })
};
