import React, { useEffect, useState } from "react";
import { FaTrash, FaUserCircle, FaMapMarkerAlt, FaCommentDots, FaRecycle } from "react-icons/fa";
import apiService from "../services/api";

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [puntos, setPuntos] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar perfil y puntos
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const data = await apiService.getPerfil();
        setUsuario(data.usuario);
        setPuntos(data.puntos);
      } catch (error) {
        setError(error.message || "Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, []);

  // 🔹 Cargar comentarios
  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const data = await apiService.getMisComentarios();
        setComentarios(data);
      } catch (err) {
        console.error("Error obteniendo comentarios:", err);
      }
    };
    fetchComentarios();
  }, []);

  // 🗑️ Eliminar punto
  const eliminarPunto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este punto?")) return;
    try {
      await apiService.deletePunto(id);
      setPuntos(puntos.filter((p) => p.id !== id));
      alert("Punto eliminado ✅");
    } catch (error) {
      alert(error.message || "Error al eliminar");
    }
  };

  // 🗑️ Eliminar comentario
  const eliminarComentario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este comentario?")) return;
    try {
      await apiService.deleteComentario(id);
      setComentarios(comentarios.filter((c) => c.id !== id));
      alert("Comentario eliminado ✅");
    } catch (error) {
      alert(error.message || "Error al eliminar");
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "20px", fontSize: "clamp(1rem, 3vw, 1.2rem)" }}>Cargando perfil...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", padding: "20px", fontSize: "clamp(1rem, 3vw, 1.2rem)" }}>{error}</p>;
  if (!usuario) return <p style={{ textAlign: "center", padding: "20px", fontSize: "clamp(1rem, 3vw, 1.2rem)" }}>No se pudo cargar el perfil</p>;

  return (
    <>
      {/* Meta viewport para móviles */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      
      <div
        style={{
          padding: "clamp(16px, 3vw, 32px)",
          maxWidth: "900px",
          margin: "0 auto",
          fontFamily: "Arial, sans-serif",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Encabezado del perfil - RESPONSIVE */}
        <div
          style={{
            background: "#f5f7fa",
            borderRadius: "12px",
            padding: "clamp(16px, 3vw, 24px)",
            display: "flex",
            flexDirection: window.innerWidth < 768 ? "column" : "row",
            alignItems: window.innerWidth < 768 ? "center" : "flex-start",
            textAlign: window.innerWidth < 768 ? "center" : "left",
            marginBottom: "clamp(24px, 4vw, 32px)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            gap: "clamp(16px, 3vw, 20px)",
          }}
        >
          <FaUserCircle 
            size={window.innerWidth < 768 ? 60 : 80} 
            color="#2a78c8" 
            style={{ 
              marginRight: window.innerWidth < 768 ? "0" : "20px" 
            }} 
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              margin: 0, 
              color: "#2a78c8",
              fontSize: "clamp(1.3rem, 4vw, 1.6rem)"
            }}>
              Hola, {usuario.nombre}
            </h2>
            <p style={{ 
              margin: "6px 0",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
            }}>
              <b>Email:</b> {usuario.email}
            </p>
            <p style={{ 
              margin: 0,
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
            }}>
              <b>Miembro desde:</b>{" "}
              {new Date(usuario.creado_en).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* PUNTOS - RESPONSIVE */}
        <section>
          <h3 style={{ 
            color: "#2a78c8", 
            display: "flex", 
            alignItems: "center",
            fontSize: "clamp(1.1rem, 3.5vw, 1.3rem)",
            marginBottom: "clamp(12px, 2vw, 16px)"
          }}>
            <FaRecycle style={{ marginRight: "8px" }} /> Mis puntos de reciclaje
          </h3>
          {puntos.length === 0 ? (
            <p style={{ 
              color: "#555",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              textAlign: "center",
              padding: "20px"
            }}>
              Aún no has creado puntos.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "clamp(12px, 2vw, 16px)",
                marginTop: "12px",
              }}
            >
              {puntos.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "clamp(12px, 2vw, 16px)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <h4 style={{ 
                    marginBottom: "8px", 
                    color: "#333",
                    fontSize: "clamp(1rem, 3vw, 1.1rem)"
                  }}>
                    {p.nombre}
                  </h4>
                  <p style={{ 
                    margin: "4px 0",
                    fontSize: "clamp(0.85rem, 2.5vw, 0.9rem)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FaMapMarkerAlt color="#2a78c8" /> {p.direccion || "Sin dirección"}
                  </p>
                  <p style={{ 
                    margin: "4px 0",
                    fontSize: "clamp(0.85rem, 2.5vw, 0.9rem)"
                  }}>
                    ♻️ <b>{p.tipo_residuo}</b>
                  </p>
                  <button
                    onClick={() => eliminarPunto(p.id)}
                    style={{
                      marginTop: "8px",
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      padding: "clamp(6px, 2vw, 8px) clamp(10px, 2vw, 12px)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                      minHeight: "36px",
                      width: "100%",
                    }}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COMENTARIOS - RESPONSIVE */}
        <section style={{ marginTop: "clamp(30px, 5vw, 40px)" }}>
          <h3 style={{ 
            color: "#2a78c8", 
            display: "flex", 
            alignItems: "center",
            fontSize: "clamp(1.1rem, 3.5vw, 1.3rem)",
            marginBottom: "clamp(12px, 2vw, 16px)"
          }}>
            <FaCommentDots style={{ marginRight: "8px" }} /> Mis comentarios
          </h3>
          {comentarios.length === 0 ? (
            <p style={{ 
              color: "#555",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              textAlign: "center",
              padding: "20px"
            }}>
              Aún no has hecho comentarios.
            </p>
          ) : (
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(10px, 2vw, 12px)",
              }}
            >
              {comentarios.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "clamp(12px, 2vw, 14px)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <p style={{ 
                    margin: "4px 0",
                    fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
                  }}>
                    <b>Punto:</b> {c.punto_nombre}
                  </p>
                  <p style={{ 
                    margin: "4px 0",
                    fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
                  }}>
                    <b>Calificación:</b> ⭐ {c.calificacion}/5
                  </p>
                  <p style={{ 
                    margin: "4px 0",
                    fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
                  }}>
                    <b>Comentario:</b> {c.comentario || "(sin texto)"}
                  </p>
                  <button
                    onClick={() => eliminarComentario(c.id)}
                    style={{
                      marginTop: "8px",
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      padding: "clamp(6px, 2vw, 8px) clamp(10px, 2vw, 12px)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                      minHeight: "36px",
                      width: "100%",
                    }}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default Perfil;