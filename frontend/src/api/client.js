const BASE_URL = "http://localhost:8080/api";

async function request(path, { method = "GET", body, headers = {} } = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
        let msg;
        try { msg = await res.text(); } catch {}
        throw new Error(msg || `HTTP ${res.status}`);
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : null;
}

export { request };
