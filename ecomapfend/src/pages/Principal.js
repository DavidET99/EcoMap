import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaMapMarkedAlt, FaUser, FaSignOutAlt, FaRecycle, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";
import Mapa from "./Mapa";
import Perfil from "./Perfil";

function Principal() {
  const navigate = useNavigate();
  const [view, setView] = useState("inicio");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/registro");
  };

  const handleViewChange = (newView) => {
    setView(newView);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Meta viewport para móviles */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #b0c9ff 0%, #d8e2f1 100%)",
          fontFamily: "Segoe UI, Arial, sans-serif",
          color: "#1e2a38",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* Botón para móviles */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: "fixed",
              top: "16px",
              left: "16px",
              zIndex: 1000,
              background: "#21429d",
              color: "white",
              flexShrink: 0,
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              cursor: "pointer",
              fontSize: "20px",
              minHeight: "44px",
              minWidth: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}

        {/* Barra lateral*/}
        <nav
          style={{
            width: isMobile ? (sidebarOpen ? "100%" : "0") : "240px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexShrink: 0,
            flexDirection: "column",
            alignItems: "center",
            padding: isMobile ? "80px 0 30px 0" : "40px 0",
            boxShadow: isMobile ? "none" : "2px 0 15px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
            overflow: isMobile ? "auto" : "hidden",
            position: isMobile ? "fixed" : "relative",
            height: isMobile ? "100vh" : "auto",
            zIndex: 999,
            ...(isMobile && !sidebarOpen && { transform: "translateX(-100%)" }),
          }}
        >
          <img
            src={require("../assets/ecomapplaneta.png")}
            alt="EcoMap"
            style={{
              width: isMobile ? "80px" : "70px",
              height: isMobile ? "80px" : "70px",
              marginBottom: "20px",
              borderRadius: "50%",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          />
          <h2 style={{ 
            marginBottom: "32px", 
            fontWeight: 700, 
            color: "#21429d",
            fontSize: isMobile ? "1.5rem" : "1.3rem",
            textAlign: "center"
          }}>
            EcoMap
          </h2>

          <ul style={{ 
            listStyle: "none", 
            padding: 0, 
            width: "100%",
            flex: 1
          }}>
            <MenuItem
              icon={<FaHome />}
              text="Inicio"
              active={view === "inicio"}
              onClick={() => handleViewChange("inicio")}
              isMobile={isMobile}
            />
            <MenuItem
              icon={<FaMapMarkedAlt />}
              text="Mapa"
              active={view === "mapa"}
              onClick={() => handleViewChange("mapa")}
              isMobile={isMobile}
            />
            {isAuthenticated && (
              <MenuItem
                icon={<FaUser />}
                text="Perfil"
                active={view === "perfil"}
                onClick={() => handleViewChange("perfil")}
                isMobile={isMobile}
              />
            )}
          </ul>

          {/* botones horizontales */}
          <div style={{ 
            marginTop: "auto", 
            marginBottom: "24px", 
            width: "100%", 
            padding: "0 16px",
            flexShrink: 0,
          }}>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "#e74c3c",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  fontSize: "clamp(0.9rem, 3vw, 1rem)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  minHeight: "44px",
                }}
              >
                <FaSignOutAlt /> Cerrar sesión
              </button>
            ) : (
              // BOTONES (Login + Registro) Versión compacta
              <div style={{ 
                display: "flex", 
                flexDirection: isMobile ? "row" : "column",
                gap: "8px", 
                alignItems: "center",
                flexShrink: 0,
                justifyContent: "center",
              }}>
                <button
                  onClick={handleLogin}
                  style={{
                    flex: isMobile ? 1 : "auto",
                    width: isMobile ? "auto" : "100%",
                    padding: isMobile ? "10px 12px" : "12px 16px",
                    borderRadius: "8px",
                    background: "#21429d",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    fontSize: isMobile ? "0.85rem" : "clamp(0.9rem, 3vw, 1rem)",
                    cursor: "pointer",
                     display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    flexShrink: 0,
                    minHeight: "40px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FaSignInAlt /> {isMobile ? "Entrar" : "Iniciar sesión"}
                </button>
                <button
                  onClick={handleRegister}
                  style={{
                    flex: isMobile ? 1 : "auto",
                    width: isMobile ? "auto" : "100%",
                    padding: isMobile ? "10px 12px" : "12px 16px",
                    borderRadius: "8px",
                    background: "#27ae60",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    fontSize: isMobile ? "0.85rem" : "clamp(0.9rem, 3vw, 1rem)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    flexShrink: 0,
                    minHeight: "40px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FaUserPlus /> {isMobile ? "Registro" : "Registrarse"}
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Overlay para móviles cuando sidebar está abierto */}
        {isMobile && sidebarOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 998,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? "clamp(60px, 5vw, 80px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px)" : "clamp(32px, 4vw, 48px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {view === "inicio" && (
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: "16px",
                padding: "clamp(24px, 4vw, 48px)",
                maxWidth: "900px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                backdropFilter: "blur(6px)",
                animation: "fadeIn 0.6s ease",
                width: "100%",
              }}
            >
              <FaRecycle size={isMobile ? 50 : 60} color="#2ecc71" />
              <h1 style={{ 
                marginTop: "20px", 
                color: "#21429d",
                fontSize: "clamp(1.5rem, 5vw, 2rem)"
              }}>
                Bienvenido a EcoMap
              </h1>
              <p
                style={{
                  fontSize: "clamp(1rem, 3vw, 1.1rem)",
                  color: "#2d3436",
                  marginTop: "16px",
                  lineHeight: "1.5",
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
                  padding: "clamp(12px, 2vw, 16px)",
                  margin: "20px 0",
                }}>
                  <p style={{ 
                    margin: 0, 
                    color: "#8a6d3b",
                    fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
                  }}>
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
                <button
                  onClick={() => handleViewChange("mapa")}
                  style={{
                    background: "#21429d",
                    color: "white",
                    border: "none",
                    padding: "clamp(12px, 3vw, 14px) clamp(20px, 3vw, 28px)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "0.2s",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    fontSize: "clamp(1rem, 3vw, 1.1rem)",
                    minHeight: "44px",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#1a3579"}
                  onMouseLeave={(e) => e.target.style.background = "#21429d"}
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
                height: isMobile ? "calc(100vh - 120px)" : "500px",
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
                padding: "clamp(16px, 3vw, 24px)",
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

      {/* Estilos de animación */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
}

/* ítems del menú */
function MenuItem({ icon, text, active, onClick, isMobile }) {
  return (
    <li
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "center" : "flex-start",
        gap: "12px",
        padding: isMobile ? "16px 32px" : "12px 32px",
        margin: "6px 16px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 600,
        background: active ? "#21429d" : "transparent",
        color: active ? "#fff" : "#21429d",
        transition: "all 0.2s ease",
        fontSize: isMobile ? "1.1rem" : "1rem",
        minHeight: "44px",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(33,66,157,0.15)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: isMobile ? "1.3rem" : "1.2rem" }}>{icon}</span> {text}
    </li>
  );
}

export default Principal;