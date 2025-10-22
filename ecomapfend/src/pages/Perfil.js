import React, { useEffect, useState } from "react";
import { FaTrash, FaUserCircle, FaMapMarkerAlt, FaCommentDots, FaRecycle } from "react-icons/fa";

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [puntos, setPuntos] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [error, setError] = useState("");

  // 🔹 Cargar perfil y puntos
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUsuario(data.usuario);
          setPuntos(data.puntos);
        } else {
          setError(data.error || "Error al cargar perfil");
        }
      } catch {
        setError("Error de conexión");
      }
    };
    fetchPerfil();
  }, []);

  // 🔹 Cargar comentarios
  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/mis-comentarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setComentarios(data);
      } catch (err) {
        console.error("Error obteniendo comentarios:", err);
      }
    };
    fetchComentarios();
  }, []);

  // 🗑️ Eliminar punto
  const eliminarPunto = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("¿Seguro que deseas eliminar este punto?")) return;
    try {
      const res = await fetch(`http://localhost:4000/puntos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPuntos(puntos.filter((p) => p.id !== id));
        alert("Punto eliminado ✅");
      } else alert(data.error || "Error al eliminar");
    } catch {
      alert("Error de conexión");
    }
  };

  // 🗑️ Eliminar comentario
  const eliminarComentario = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("¿Seguro que deseas eliminar este comentario?")) return;
    try {
      const res = await fetch(`http://localhost:4000/comentarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setComentarios(comentarios.filter((c) => c.id !== id));
        alert("Comentario eliminado ✅");
      } else alert(data.error || "Error al eliminar");
    } catch {
      alert("Error de conexión");
    }
  };

  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!usuario) return <p style={{ textAlign: "center" }}>Cargando perfil...</p>;

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Encabezado del perfil */}
      <div
        style={{
          background: "#f5f7fa",
          borderRadius: "12px",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          marginBottom: "32px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <FaUserCircle size={80} color="#2a78c8" style={{ marginRight: "20px" }} />
        <div>
          <h2 style={{ margin: 0, color: "#2a78c8" }}>Hola, {usuario.nombre}</h2>
          <p style={{ margin: "6px 0" }}>
            <b>Email:</b> {usuario.email}
          </p>
          <p style={{ margin: 0 }}>
            <b>Miembro desde:</b>{" "}
            {new Date(usuario.creado_en).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* PUNTOS */}
      <section>
        <h3 style={{ color: "#2a78c8", display: "flex", alignItems: "center" }}>
          <FaRecycle style={{ marginRight: 8 }} /> Mis puntos de reciclaje
        </h3>
        {puntos.length === 0 ? (
          <p style={{ color: "#555" }}>Aún no has creado puntos.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
              marginTop: "12px",
            }}
          >
            {puntos.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#fff",
                  borderRadius: "10px",
                  padding: "16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <h4 style={{ marginBottom: "8px", color: "#333" }}>{p.nombre}</h4>
                <p style={{ margin: "4px 0" }}>
                  <FaMapMarkerAlt color="#2a78c8" /> {p.direccion || "Sin dirección"}
                </p>
                <p style={{ margin: "4px 0" }}>
                  ♻️ <b>{p.tipo_residuo}</b>
                </p>
                <button
                  onClick={() => eliminarPunto(p.id)}
                  style={{
                    marginTop: "8px",
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COMENTARIOS */}
      <section style={{ marginTop: "40px" }}>
        <h3 style={{ color: "#2a78c8", display: "flex", alignItems: "center" }}>
          <FaCommentDots style={{ marginRight: 8 }} /> Mis comentarios
        </h3>
        {comentarios.length === 0 ? (
          <p style={{ color: "#555" }}>Aún no has hecho comentarios.</p>
        ) : (
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {comentarios.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "#fff",
                  borderRadius: "10px",
                  padding: "14px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <b>Punto:</b> {c.punto_nombre}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <b>Calificación:</b> ⭐ {c.calificacion}/5
                </p>
                <p style={{ margin: "4px 0" }}>
                  <b>Comentario:</b> {c.comentario || "(sin texto)"}
                </p>
                <button
                  onClick={() => eliminarComentario(c.id)}
                  style={{
                    marginTop: "8px",
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
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
  );
}

export default Perfil;
