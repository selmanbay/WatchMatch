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
    marginTop: "80px",
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
    overflow: "hidden",
    transition: "all 0.3s",
    position: "relative",
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
