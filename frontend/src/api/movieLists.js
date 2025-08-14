// src/api/movieLists.js
const BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

// Genel JSON yanıt yardımcısı
async function j(res) {
    const text = await res.text();
    if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
    return text ? JSON.parse(text) : null;
}

// Header yardımcıları (opsiyonel Authorization)
function headers(includeJson = false) {
    const h = { Accept: "application/json" };
    if (includeJson) h["Content-Type"] = "application/json";
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
}

/* =======================
   MOVIE LISTS ENDPOINTS
   ======================= */

// Kullanıcının tüm listeleri
export async function getUserLists(userId) {
    return j(
        await fetch(`${BASE}/api/movie-lists/user/${userId}`, {
            headers: headers(),
        })
    );
}

// 🔎 Liste detayını getir (içindeki movies'i görmek/kontrol etmek için)
export async function getListById(listId) {
    return j(
        await fetch(`${BASE}/api/movie-lists/${listId}`, {
            headers: headers(),
        })
    );
}

// ✅ Yeni liste oluştur — BE şeması:
// { listName, listDescription, listImage, listRating, user: { id } }
export async function createList({ userId, name, description, image, rating }) {
    const url = `${BASE}/api/movie-lists`;

    const asNum = Number(userId);
    const idValue = Number.isFinite(asNum) ? asNum : userId;

    const payload = {
        listName: name,
        listDescription: (description ?? "").trim() || `Kullanıcı listesi: ${name}`, // NOT NULL
        listImage: (image ?? "").trim() || "/images/list-placeholder.png",          // NOT NULL
        listRating: (typeof rating === "number" && !Number.isNaN(rating)) ? rating : 0,
        user: { id: idValue },                                                      // user.id ZORUNLU
    };

    const res = await fetch(url, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify(payload),
    });
    return j(res);
}

// TMDb’den gelen içeriği listeye ekle
export async function addTmdbToList(listId, tmdbId) {
    return j(
        await fetch(`${BASE}/api/movie-lists/${listId}/tmdb/${tmdbId}`, {
            method: "POST",
            headers: headers(),
        })
    );
}

// DB’deki filmi listeye ekle
export async function addMovieToList(listId, movieId) {
    return j(
        await fetch(`${BASE}/api/movie-lists/${listId}/movies/${movieId}`, {
            method: "POST",
            headers: headers(),
        })
    );
}

// Listeden film çıkar
export async function removeMovieFromList(listId, movieId) {
    return j(
        await fetch(`${BASE}/api/movie-lists/${listId}/movies/${movieId}`, {
            method: "DELETE",
            headers: headers(),
        })
    );
}
