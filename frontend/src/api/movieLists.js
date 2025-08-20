// src/api/movieLists.js
const BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

/* -------------------- ortak yardımcılar -------------------- */

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

// Liste detayını getir (içindeki movies için)
export async function getListById(listId) {
    return j(
        await fetch(`${BASE}/api/movie-lists/${listId}`, {
            headers: headers(),
        })
    );
}

// Yeni liste oluştur — BE şeması: { listName, listDescription, listImage, listRating, user: { id } }
export async function createList({ userId, name, description, image, rating }) {
    const url = `${BASE}/api/movie-lists`;

    const asNum = Number(userId);
    const idValue = Number.isFinite(asNum) ? asNum : userId;

    const payload = {
        listName: name,
        listDescription: (description ?? "").trim() || `Kullanıcı listesi: ${name}`,
        listImage: (image ?? "").trim() || "/images/list-placeholder.png",
        listRating: typeof rating === "number" && !Number.isNaN(rating) ? rating : 0,
        user: { id: idValue },
    };

    const res = await fetch(url, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify(payload),
    });
    return j(res);
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

// TMDb’den gelen içeriği (tmdbId) listeye ekle
export async function addTmdbToList(listId, tmdbId) {
    return j(
        await fetch(`${BASE}/api/movie-lists/${listId}/tmdb/${tmdbId}`, {
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

/* -------------------- liste meta / kapak güncelleme -------------------- */

// Listede ad/açıklama/kapak/rating güncelle
// patch: { name?, description?, image?, rating? }
export async function updateListMeta(listId, patch = {}) {
    const payload = {};
    if (patch.name != null) payload.listName = patch.name;
    if (patch.description != null) payload.listDescription = patch.description;
    if (patch.image != null) payload.listImage = patch.image; // BE "image" ve "listImage" ikisini de kabul ediyor
    if (patch.rating != null) payload.listRating = patch.rating;

    const res = await fetch(`${BASE}/api/movie-lists/${listId}`, {
        method: "PUT",
        headers: headers(true),
        body: JSON.stringify(payload),
    });
    return j(res);
}

// Sadece kapak görselini URL ile güncelle (syntactic sugar)
export function changeListCover(listId, imageUrl) {
    return updateListMeta(listId, { image: imageUrl });
}

/* -------------------- dosya upload (kapak) -------------------- */

// Kapak dosyası yükle (multipart/form-data)
// ✅ Backend: POST /api/movie-lists/{listId}/cover
export async function uploadListCover(listId, file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${BASE}/api/movie-lists/${listId}/cover`, {
        method: "POST",
        body: fd,
    });

    if (!res.ok) {
        let msg = "Kapak yükleme başarısız";
        try { msg = await res.text(); } catch {}
        throw new Error(msg);
    }
    return res.json(); // MovieList; listImage içinde /uploads/covers/... döner
}
