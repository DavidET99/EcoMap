import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Mapa from "./Mapa";
import Perfil from "./Perfil";

function Principal() {
  const navigate = useNavigate();
  const [view, setView] = useState("inicio"); // controla la vista actual

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
        boxShadow: "2px 0 12px rgba(0,0,0,0.08)",
        zIndex: 10
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
            onClick={() => setView("inicio")}
          >
            Inicio
          </li>
          <li
            style={menuItemStyle}
            onClick={() => setView("mapa")}
          >
            Mapa
          </li>
          <li
            style={menuItemStyle}
            onClick={() => setView("perfil")}
          >
            Perfil
          </li>
        </ul>
        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
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
        justifyContent: "flex-start",
        alignItems: "center"
      }}>
        {view === "inicio" && (
          <>
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
          </>
        )}

        {view === "mapa" && (
          <div style={{
            width: "100%",
            maxWidth: "1500px",
            height: "500px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)"
          }}>
            <Mapa />
          </div>
        )}

        {view === "perfil" && (
          <div style={{
            width: "100%",
            maxWidth: "900px",
            background: "#ffffffcc",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
          }}>
            <Perfil />
          </div>
        )}
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

const logoutButtonStyle = {
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
};

export default Principal;
