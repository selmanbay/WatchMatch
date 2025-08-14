// src/styles/ui.js

export const headerStyle = {
    background: "rgba(15, 20, 25, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "15px 0",
    position: "fixed",
    width: "100%",
    top: 0,
    zIndex: 1000
};

export const navContainerStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px"
};

export const logoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "white"
};

export const logoIconStyle = {
    width: "40px",
    height: "40px",
    background: "#dc2626",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
    fontFamily: "'Segoe UI', sans-serif",
    letterSpacing: "-1px"
};

export const mainContentStyle = {
    marginTop: "40px",
    padding: "40px 0",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f1419 0%, #1a2332 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "white"
};

export const containerStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 20px"
};

export const sectionHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
};

export const sectionTitleStyle = {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "10px"
};

export const movieGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "25px",
    marginBottom: "60px"
};

export const movieCardStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "15px",
    overflow: "visible",
    transition: "all 0.3s",
    position: "relative", // ⬅️ Hover butonu ve menü için gerekli
    cursor: "pointer",
    border: "1px solid rgba(255, 255, 255, 0.1)"
};

export const moviePosterStyle = {
    width: "100%",
    height: "300px",
    background: "linear-gradient(135deg, #1a2332, #0f1419)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden"
};

export const movieInfoStyle = { padding: "20px" };

export const movieTitleStyle = {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "8px",
    color: "white"
};

export const movieMetaStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
};

export const movieYearStyle = { color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" };

export const movieRatingStyle = {
    background: "linear-gradient(45deg, #dc2626, #991b1b)",
    color: "white",
    padding: "4px 8px",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "600"
};

export const movieGenreStyle = {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "0.85rem",
    marginBottom: "15px"
};

export const movieActionsStyle = { display: "flex", gap: "8px" };

export const actionBtnStyle = {
    flex: 1,
    padding: "8px 12px",
    border: "none",
    borderRadius: "20px",
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all 0.3s",
    fontWeight: "500"
};

export const wishlistBtnStyle = {
    ...actionBtnStyle,
    background: "rgba(59, 130, 246, 0.2)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.3)"
};

export const watchedBtnStyle = {
    ...actionBtnStyle,
    background: "rgba(34, 197, 94, 0.2)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.3)"
};

export const formStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "15px",
    padding: "30px",
    marginBottom: "40px"
};

export const formRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px"
};

export const formInputStyle = {
    width: "100%",
    boxSizing: "border-box", // taşmayı engeller, select ile aynı genişlikte kalır
    padding: "15px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "white",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s"
};

export const selectStyle = {
    ...formInputStyle,
    appearance: "none",
    cursor: "pointer"
};

export const btnStyle = {
    background: "linear-gradient(45deg, #dc2626, #991b1b)",
    color: "white",
    border: "none",
    padding: "15px 30px",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s",
    textDecoration: "none",
    display: "inline-block"
};

/**
 * Tam ekran arka plan + koyu perde
 * Not: Buraya backgroundColor ekledik; fazla scroll'da altta beyaz görünmesin diye.
 * Ayrıca modern cihazlarda daha güvenilir yükseklik için minHeight'e 100dvh fallback'i de verdik.
 */
export const authPageStyle = (bg = "/images/auth-bg.webp") => ({
    minHeight: "100vh",
    backgroundColor: "#0f1419", // 👈 BEYAZ ALTI ÖNLER
    backgroundImage: `linear-gradient(135deg, rgba(10,12,16,.78), rgba(10,12,16,.62)), url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed", // iOS'ta titreme olursa bu satırı sil
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "white",
    overflowX: "hidden" // yatay taşmalarda alt beyaz çizgiyi engeller
});

/* ===========================
   ✅ Form Hata Görünümleri
   - Input altında küçük kırmızı yazı
   - Hatalı alanda kırmızı kenarlık
   =========================== */

export const errorTextStyle = {
    color: "#ef4444", // tailwind red-500
    fontSize: "0.8rem",
    marginTop: 4
};

export const inputErrorStyle = {
    ...formInputStyle,
    borderColor: "#ef4444",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.25)" // hafif kırmızı parıltı
};

export const selectErrorStyle = {
    ...selectStyle,
    borderColor: "#ef4444",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.25)"
};

/* İstersen kullanım kolaylığı için yardımcı fonksiyonlar: */
export const withError = (base, hasError) =>
    hasError
        ? { ...base, borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.25)" }
        : base;

/* =========================================================
   🆕 Hover'da görünen kırmızı "ADD TO LIST" butonu stilleri
   ve tıklandığında yukarı doğru açılan menü stilleri
   ========================================================= */

export const addToListHoverBtnStyle = {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#dc2626",        // kırmızı
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "10px 18px",
    fontWeight: 700,
    fontSize: "14px",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(220,38,38,0.35)",
    transition: "opacity .2s ease, transform .2s ease",
    zIndex: 5
};

export const expandMenuStyle = {
    position: "absolute",
    bottom: 64,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 6,
    transition: "opacity .2s ease, transform .2s ease"
};

export const expandMenuItemStyle = {
    background: "#0b0b0b",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    cursor: "pointer",
};

// ▶️ Statü rozeti (göz) ve kitap ayracı (ribbon) overlay stilleri

export const statusWrapStyle = {
    position: "absolute",
    top: 10,
    right: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 7,
    pointerEvents: "none" // Hover/tıklamayı engellemesin
};

export const statusBadgeStyle = {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#0b0b0b",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    zIndex: 8,
    pointerEvents: "none"
};

export const ribbonWrapStyle = {
    position: "absolute",
    top: 0,
    right: 10,         // karta çok yaslanmasın diye 10px içeriden
    width: 24,
    height: 36,
    zIndex: 7,
    pointerEvents: "none"
};
// === Movie Detail Modal ===
export const detailOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(3px)",
    zIndex: 2000,
    overflowY: "auto"
};

export const detailContainerStyle = {
    maxWidth: "1200px",
    margin: "40px auto",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 30px 120px rgba(0,0,0,0.6)"
};

export const detailHeaderStyle = {
    position: "relative",
    height: "360px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
};

export const detailHeaderShadeStyle = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.6) 45%, rgba(15,20,25,.95) 100%)"
};

export const detailCloseBtnStyle = {
    position: "absolute",
    top: 16,
    right: 16,
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    zIndex: 1
};

export const detailBodyStyle = {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "24px",
    padding: "24px",
    background: "linear-gradient(180deg, rgba(15,20,25,1) 0%, rgba(15,20,25,.98) 100%)"
};

export const detailPosterLargeStyle = {
    width: "260px",
    height: "390px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)"
};

export const detailTitleStyle = {
    margin: "0 0 8px 0",
    fontSize: "32px",
    lineHeight: 1.15,
    fontWeight: 800
};

export const detailMetaRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    color: "rgba(255,255,255,.8)",
    marginBottom: "12px"
};

export const userScorePillStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(34,197,94,.18)",
    color: "#86efac",
    border: "1px solid rgba(34,197,94,.35)",
    fontWeight: 700
};

export const chipRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    margin: "10px 0 16px 0"
};

export const chipStyle = {
    padding: "4px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "#fff",
    fontSize: "12px"
};

export const detailActionsRowStyle = {
    display: "flex",
    gap: "10px",
    margin: "6px 0 18px 0"
};

export const detailActionBtnStyle = {
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,.15)",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer"
};

export const detailOverviewStyle = {
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "12px",
    padding: "14px"
};
// Kart + başlık sarmalayıcı (poster üstte, isim altta)
export const movieCardWrapStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 10
};

// Başlık, kartın ALTINDA gözüksün
export const movieCaptionStyle = {
    fontSize: "1rem",
    fontWeight: 600,
    color: "white",
    textAlign: "left",
    padding: "4px 2px",
    lineHeight: 1.3,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,      // iki satırda kes
    WebkitBoxOrient: "vertical",
    wordBreak: "break-word",
    opacity: 0.95
};
// === Film Listesi seçici panel ===
export const listPickerStyle = {
    position: "absolute",
    bottom: 56,              // add-to-list butonunun hemen üstü
    right: 8,                // kartın sağına hizala
    left: "auto",
    transform: "none",
    width: 280,
    background: "rgba(15,20,25,0.98)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
    zIndex: 50
};

export const listPickerHeaderStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontWeight: 700
};

export const listCloseBtnStyle = {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8,
    padding: "2px 8px",
    cursor: "pointer"
};

export const listPickerBodyStyle = {
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10
};

export const listInputRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8
};

export const listInputStyle = {
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    outline: "none"
};

export const listCreateBtnStyle = {
    background: "linear-gradient(45deg, #dc2626, #991b1b)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 700
};

export const listItemStyle = {
    textAlign: "left",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer"
};

export const listEmptyTextStyle = {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    padding: "8px 0"
};



