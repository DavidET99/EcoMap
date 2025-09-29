import React from "react";
import { useNavigate } from "react-router-dom";

function Principal() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "linear-gradient(120deg, #b2c47fff 15%, #a39cceff 100%)",
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      {/* Barra lateral */}
      <nav style={{
        width: "220px",
        background: "#ffffffd6",
        color: "#0765a3ff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 0",
        boxShadow: "2px 0 12px rgba(0,0,0,0.08)"
      }}>
        <img
          src={require("../assets/ecomapplaneta.png")}
          alt="EcoMap"
          style={{ width: "56px", height: "56px", marginBottom: "32px" }}
        />
        <h3 style={{ marginBottom: "40px", fontWeight: 600 }}>EcoMap</h3>
        <ul style={{ listStyle: "none", padding: 0, width: "80%", textAlign: "center" }}>
          <li
            style={menuItemStyle}
            onClick={() => navigate("/principal")}
          >
            Inicio
          </li>
          <li
            style={menuItemStyle}
            onClick={() => navigate("/mapa")}
          >
            Mapa
          </li>
          <li
            style={menuItemStyle}
            onClick={() => navigate("/perfil")}
          >
            Perfil
          </li>
        </ul>
        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            marginBottom: "24px",
            padding: "12px 32px",
            borderRadius: "8px",
            background: "#ce4f69ff",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            fontSize: "1rem",
            cursor: "pointer",
            width: "80%"
          }}
        >
          Cerrar sesión
        </button>
      </nav>

      {/* Contenido principal */}
      <main style={{
        flex: 1,
        padding: "48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <h2 style={{ fontWeight: 700, fontSize: "2.2rem", color: "#222f3e" }}>
          Bienvenido a EcoMap
        </h2>
        <p style={{
          fontSize: "1.1rem",
          color: "#222f3e",
          background: "#ffffffcc",
          padding: "24px 32px",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
        }}>
          Página principal (En construcción🔨👷‍♂️)
        </p>
      </main>
    </div>
  );
}

const menuItemStyle = {
  padding: "12px 32px",
  borderRadius: "8px",
  marginBottom: "8px",
  background: "#21429dff",
  opacity: 0.8,
  color: "#ffffffd6",
  cursor: "pointer"
};

export default Principal;
