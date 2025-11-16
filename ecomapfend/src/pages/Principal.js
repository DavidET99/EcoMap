import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaMapMarkedAlt, FaUser, FaSignOutAlt, FaRecycle, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import Mapa from "./Mapa";
import Perfil from "./Perfil";

function Principal() {
  const navigate = useNavigate();
  const [view, setView] = useState("inicio");
  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload(); // Recargar para actualizar el estado de autenticación
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/registro");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #b0c9ff 0%, #d8e2f1 100%)",
        fontFamily: "Segoe UI, Arial, sans-serif",
        color: "#1e2a38",
      }}
    >
      {/* 🌿 Barra lateral */}
      <nav
        style={{
          width: "240px",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 0",
          boxShadow: "2px 0 15px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={require("../assets/ecomapplaneta.png")}
          alt="EcoMap"
          style={{
            width: "70px",
            height: "70px",
            marginBottom: "20px",
            borderRadius: "50%",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        />
        <h2 style={{ marginBottom: "32px", fontWeight: 700, color: "#21429d" }}>
          EcoMap
        </h2>

        <ul style={{ listStyle: "none", padding: 0, width: "100%" }}>
          <MenuItem
            icon={<FaHome />}
            text="Inicio"
            active={view === "inicio"}
            onClick={() => setView("inicio")}
          />
          <MenuItem
            icon={<FaMapMarkedAlt />}
            text="Mapa"
            active={view === "mapa"}
            onClick={() => setView("mapa")}
          />
          {isAuthenticated && (
            <MenuItem
              icon={<FaUser />}
              text="Perfil"
              active={view === "perfil"}
              onClick={() => setView("perfil")}
            />
          )}
        </ul>

        <div style={{ marginTop: "auto", marginBottom: "24px", width: "100%", padding: "0 16px" }}>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: "8px",
                background: "#e74c3c",
                color: "#fff",
                fontWeight: 600,
                border: "none",
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#c0392b")}
              onMouseLeave={(e) => (e.target.style.background = "#e74c3c")}
            >
              <FaSignOutAlt /> Cerrar sesión
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              <button
                onClick={handleLogin}
                style={{
                  width: "90%",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#21429d",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.2s ease",
                }}
              >
                <FaSignInAlt /> Iniciar sesión
              </button>
              <button
                onClick={handleRegister}
                style={{
                  width: "90%",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#27ae60",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.2s ease",
                }}
              >
                <FaUserPlus /> Registrarse
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 🌎 Contenido principal */}
      <main
        style={{
          flex: 1,
          padding: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
        }}
      >
        {view === "inicio" && (
          <div
            style={{
              background: "rgba(255,255,255,0.85)",
              borderRadius: "16px",
              padding: "48px",
              maxWidth: "900px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              backdropFilter: "blur(6px)",
              animation: "fadeIn 0.6s ease",
            }}
          >
            <FaRecycle size={60} color="#2ecc71" />
            <h1 style={{ marginTop: "20px", color: "#21429d" }}>Bienvenido a EcoMap</h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#2d3436",
                marginTop: "16px",
              }}
            >
              Tu herramienta para encontrar, registrar y valorar puntos de reciclaje
              en tu comunidad. 🌍♻️
            </p>
            
            {!isAuthenticated && (
              <div style={{ 
                background: "#fffae6", 
                border: "1px solid #ffd166",
                borderRadius: "8px",
                padding: "16px",
                margin: "20px 0",
              }}>
                <p style={{ margin: 0, color: "#8a6d3b" }}>
                  💡 <b>Inicia sesión</b> para crear puntos de reciclaje y comentar en los existentes
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {/* SOLO BOTÓN DE IR AL MAPA */}
              <button
                onClick={() => setView("mapa")}
                style={buttonStyle("#21429d")}
              >
                Ir al mapa
              </button>
            </div>
          </div>
        )}

        {view === "mapa" && (
          <div
            style={{
              width: "100%",
              maxWidth: "1500px",
              height: "500px",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              animation: "fadeIn 0.4s ease",
            }}
          >
            <Mapa />
          </div>
        )}

        {view === "perfil" && isAuthenticated && (
          <div
            style={{
              width: "100%",
              maxWidth: "950px",
              background: "rgba(255,255,255,0.85)",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              animation: "fadeIn 0.4s ease",
            }}
          >
            <Perfil />
          </div>
        )}
      </main>
    </div>
  );
}

/* 🔹 Componente reutilizable para los ítems del menú */
function MenuItem({ icon, text, active, onClick }) {
  return (
    <li
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "12px",
        padding: "12px 32px",
        margin: "6px 16px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 600,
        background: active ? "#21429d" : "transparent",
        color: active ? "#fff" : "#21429d",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(33,66,157,0.15)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{icon}</span> {text}
    </li>
  );
}

/* 🔹 Botón con estilo */
const buttonStyle = (color) => ({
  background: color,
  color: "white",
  border: "none",
  padding: "12px 28px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
  transition: "0.2s",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
});

export default Principal;