// src/components/MatchUsersRail.jsx
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

const API = process.env.REACT_APP_API_BASE || "http://localhost:8080";

/* ============ helpers ============ */
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Number(n) || 0));

function ringGradient(score = 0) {
    const s = clamp(score);
    const hue = 12 + s * 1.2; // kırmızı→yeşil
    return `conic-gradient(hsl(${hue}, 80%, 52%) ${s * 3.6}deg, rgba(255,255,255,.10) 0)`;
}

function Avatar({ username, avatarUrl, size = 110 }) {
    const initials = useMemo(() => {
        if (!username) return "U";
        return username
            .replace(/[_\-.]/g, " ")
            .split(" ")
            .filter(Boolean)
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }, [username]);

    const base = {
        width: size,
        height: size,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,.18)",
        background:
            "radial-gradient(60% 60% at 50% 30%, rgba(255,255,255,.12), rgba(255,255,255,.04))",
        display: "grid",
        placeItems: "center",
        fontWeight: 900,
        fontSize: 34,
        color: "rgba(255,255,255,.9)",
        overflow: "hidden",
        boxShadow: "0 12px 32px rgba(0,0,0,.35) inset",
    };

    if (avatarUrl) {
        const url = avatarUrl.startsWith("/uploads/") ? `${API}${avatarUrl}` : avatarUrl;
        return <img src={url} alt={username} style={{ ...base, objectFit: "cover" }} />;
    }
    return <div style={base}>{initials}</div>;
}

function ScoreRing({ score = 0, size = 96 }) {
    const s = clamp(score);
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: ringGradient(s),
                display: "grid",
                placeItems: "center",
                border: "1px solid rgba(255,255,255,.14)",
            }}
            title={`Uyum: %${s}`}
            aria-label={`Uyum yüzde ${s}`}
        >
            <div
                style={{
                    width: size - 18,
                    height: size - 18,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,.65)",
                    border: "1px solid rgba(255,255,255,.16)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#d1fae5",
                }}
            >
                %{s}
            </div>
        </div>
    );
}

const btnGlass = {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
};

/* ============ toolbar ============ */
function Toolbar({ sameCountry, setSameCountry, limit, setLimit, onRefresh, loading }) {
    return (
        <div
            style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                justifyContent: "flex-end",
                margin: "8px 0 14px",
            }}
        >
            <label
                style={{
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 14,
                    opacity: 0.95,
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,.16)",
                    background: "rgba(255,255,255,.06)",
                }}
            >
                <input
                    type="checkbox"
                    checked={sameCountry}
                    onChange={(e) => setSameCountry(e.target.checked)}
                    style={{ accentColor: "#7dd3fc" }}
                />
                Aynı ülke
            </label>

            <div
                style={{
                    position: "relative",
                    border: "1px solid rgba(255,255,255,.16)",
                    borderRadius: 12,
                    background: "rgba(255,255,255,.06)",
                    padding: "0 10px",
                }}
            >
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    style={{
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        background: "transparent",
                        color: "#fff",
                        border: "none",
                        padding: "10px 28px 10px 6px",
                        cursor: "pointer",
                        fontSize: 14,
                    }}
                >
                    {[10, 20, 30, 40, 50].map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>
                <span style={{ position: "absolute", right: 10, top: 8, opacity: 0.8 }}>▾</span>
            </div>

            <button
                onClick={onRefresh}
                disabled={loading}
                style={{ ...btnGlass, opacity: loading ? 0.75 : 1 }}
            >
                {loading ? "Yükleniyor..." : "Yenile"}
            </button>
        </div>
    );
}

/* ============ BIG CENTER CARD ============ */
function BigUserCard({ u, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick?.(u)}
            title={u.username}
            style={{
                textAlign: "left",
                width: "min(980px, 92vw)",
                height: 260,
                padding: 24,
                borderRadius: 26,
                background:
                    "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))",
                border: "1px solid rgba(255,255,255,.15)",
                color: "#fff",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                alignItems: "center",
                gap: 22,
                cursor: "pointer",
                boxShadow: "0 28px 100px rgba(0,0,0,.55)",
            }}
        >
            <Avatar username={u.username} avatarUrl={u.avatarUrl} size={110} />

            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: 28,
                        letterSpacing: 0.2,
                        marginBottom: 12,
                    }}
                >
                    {u.username}
                </div>

                {/* tagline – ülke kodu YOK */}
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderRadius: 999,
                        background:
                            "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.2))",
                        border: "1px solid rgba(255,255,255,.12)",
                        fontSize: 14,
                        opacity: 0.95,
                    }}
                >
                    Sizinle yüksek uyum
                </div>
            </div>

            <ScoreRing score={u.score} size={96} />
        </button>
    );
}

function SkeletonBigCard() {
    return (
        <div
            style={{
                width: "min(980px, 92vw)",
                height: 260,
                borderRadius: 26,
                background:
                    "linear-gradient(90deg, rgba(255,255,255,.06) 0, rgba(255,255,255,.12) 50%, rgba(255,255,255,.06) 100%)",
                backgroundSize: "200% 100%",
                animation: "wm-skel 1.1s linear infinite",
                border: "1px solid rgba(255,255,255,.1)",
                boxShadow: "0 28px 100px rgba(0,0,0,.45)",
            }}
        />
    );
}

/* local CSS */
const localCss = `
@keyframes wm-skel { 0%{ background-position: 200% 0 } 100%{ background-position: -200% 0 } }
@keyframes slideInR { 0%{ opacity:.0; transform: translateX(40px) } 100%{ opacity:1; transform: translateX(0) } }
@keyframes slideInL { 0%{ opacity:.0; transform: translateX(-40px) } 100%{ opacity:1; transform: translateX(0) } }
`;

/* ============ main ============ */
const MatchUsersRail = forwardRef(function MatchUsersRail(
    { userId, defaultLimit = 20, defaultSameCountry = true, onUserClick },
    ref
) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sameCountry, setSameCountry] = useState(!!defaultSameCountry);
    const [limit, setLimit] = useState(defaultLimit);

    const [idx, setIdx] = useState(0);
    const [dir, setDir] = useState(1); // 1→right, -1→left
    const touchRef = useRef({ x: 0, y: 0 });

    const next = useCallback(() => {
        if (!items.length) return;
        setDir(1);
        setIdx((i) => (i + 1) % items.length);
    }, [items.length]);

    const prev = useCallback(() => {
        if (!items.length) return;
        setDir(-1);
        setIdx((i) => (i - 1 + items.length) % items.length);
    }, [items.length]);

    const fetchData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const url = `${API}/api/match/${encodeURIComponent(
                userId
            )}?limit=${encodeURIComponent(limit)}&sameCountry=${encodeURIComponent(
                sameCountry
            )}`;
            const res = await fetch(url, { headers: { accept: "*/*" } });
            const data = res.ok ? await res.json() : [];
            const arr = Array.isArray(data) ? data : [];
            const normalized = arr.map((x) => ({
                userId: x.userId ?? x.id ?? x.uid,
                username: x.username ?? x.name ?? "Kullanıcı",
                avatarUrl: x.avatarUrl ?? x.avatar ?? null,
                score: clamp(x.score),
            }));
            setItems(normalized);
            setIdx(0);
        } catch {
            setItems([]);
            setIdx(0);
        } finally {
            setLoading(false);
        }
    }, [userId, limit, sameCountry]);

    useImperativeHandle(ref, () => ({ refresh: fetchData }), [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Klavye okları
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") next();
            else if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [next, prev]);

    // Touch swipe
    const onTouchStart = (e) => {
        const t = e.touches?.[0];
        if (!t) return;
        touchRef.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = (e) => {
        const t = e.changedTouches?.[0];
        if (!t) return;
        const dx = t.clientX - touchRef.current.x;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    };

    const current = items[idx];

    return (
        <div style={{ position: "relative", marginTop: 4 }}>
            <style>{localCss}</style>

            <Toolbar
                sameCountry={sameCountry}
                setSameCountry={setSameCountry}
                limit={limit}
                setLimit={setLimit}
                onRefresh={fetchData}
                loading={loading}
            />

            {/* Stage */}
            <div
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                style={{
                    display: "grid",
                    placeItems: "center",
                    minHeight: 300,
                    position: "relative",
                }}
            >
                {loading ? (
                    <SkeletonBigCard />
                ) : current ? (
                    <div
                        style={{
                            animation: dir === 1 ? "slideInR .32s ease" : "slideInL .32s ease",
                        }}
                    >
                        <BigUserCard u={current} onClick={onUserClick} />
                    </div>
                ) : (
                    <div style={{ opacity: 0.75, padding: "22px 8px" }}>Eşleşme bulunamadı.</div>
                )}

                {/* Nav arrows */}
                {items.length > 1 && (
                    <>
                        <button
                            aria-label="Geri"
                            onClick={prev}
                            style={{
                                ...btnGlass,
                                position: "absolute",
                                left: "calc(50% - min(980px, 92vw)/2 - 6px)",
                                top: "50%",
                                transform: "translate(-12px,-50%)",
                                fontSize: 20,
                            }}
                        >
                            ‹
                        </button>
                        <button
                            aria-label="İleri"
                            onClick={next}
                            style={{
                                ...btnGlass,
                                position: "absolute",
                                right: "calc(50% - min(980px, 92vw)/2 - 6px)",
                                top: "50%",
                                transform: "translate(12px,-50%)",
                                fontSize: 20,
                            }}
                        >
                            ›
                        </button>
                    </>
                )}

                {/* Dots */}
                {items.length > 1 && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: -6,
                            display: "flex",
                            gap: 6,
                            justifyContent: "center",
                            width: "100%",
                        }}
                    >
                        {items.map((_, i) => (
                            <span
                                key={i}
                                style={{
                                    width: i === idx ? 26 : 10,
                                    height: 10,
                                    borderRadius: 999,
                                    background: i === idx ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.35)",
                                    border: "1px solid rgba(255,255,255,.6)",
                                    transition: "all .2s ease",
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default MatchUsersRail;
