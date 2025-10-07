import React, { useEffect, useState } from "react";

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

  // 🔹 Cargar comentarios propios
  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/mis-comentarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setComentarios(data);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Error obteniendo comentarios:", err);
      }
    };
    fetchComentarios();
  }, []);

  // Eliminar punto
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
        alert("Punto eliminado ✅");
        setPuntos(puntos.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Error al eliminar");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  // Eliminar comentario (ajustado para seguir la lógica de eliminarPunto)
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
        alert("Comentario eliminado ✅");
        setComentarios(comentarios.filter((c) => c.id !== id));
      } else {
        alert(data.error || "Error al eliminar");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!usuario) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "32px" }}>
      <h2>Perfil de {usuario.nombre}</h2>
      <p>
        <b>Email:</b> {usuario.email}
      </p>
      <p>
        <b>Miembro desde:</b>{" "}
        {new Date(usuario.creado_en).toLocaleDateString()}
      </p>

      {/* Sección PUNTOS */}
      <h3 style={{ marginTop: "24px" }}>Mis puntos de reciclaje:</h3>
      {puntos.length === 0 ? (
        <p>No has creado puntos aún.</p>
      ) : (
        <ul>
          {puntos.map((p) => (
            <li key={p.id} style={{ marginBottom: "8px" }}>
              <b>{p.nombre}</b> - {p.tipo_residuo} (
              {p.direccion || "Sin dirección"})
              <button
                onClick={() => eliminarPunto(p.id)}
                style={{
                  marginLeft: "10px",
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Sección COMENTARIOS */}
      <h3 style={{ marginTop: "32px" }}>Mis comentarios:</h3>
      {comentarios.length === 0 ? (
        <p>No has hecho comentarios aún.</p>
      ) : (
        <ul>
          {comentarios.map((c) => (
            <li
              key={c.id}
              style={{
                marginBottom: "10px",
                borderBottom: "1px solid #ccc",
                paddingBottom: "6px",
              }}
            >
              <div>
                <b>En punto:</b> {c.punto_nombre} <br />
                <b>Calificación:</b> ⭐ {c.calificacion}/5
                <br />
                <b>Comentario:</b> {c.comentario || "(sin texto)"}
              </div>
              <button
                onClick={() => eliminarComentario(c.id)}
                style={{
                  marginTop: "6px",
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Perfil;
