import React, { useEffect, useState } from "react";

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [puntos, setPuntos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/me", {
          headers: { Authorization: `Bearer ${token}` }
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

  // 🔹 Nueva función para eliminar un punto
  const eliminarPunto = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("¿Seguro que deseas eliminar este punto?")) return;

    try {
      const res = await fetch(`http://localhost:4000/puntos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert("Punto eliminado ✅");
        setPuntos(puntos.filter((p) => p.id !== id)); // ❌ lo borra de la lista sin recargar
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
      <p><b>Email:</b> {usuario.email}</p>
      <p><b>Miembro desde:</b> {new Date(usuario.creado_en).toLocaleDateString()}</p>

      <h3 style={{ marginTop: "24px" }}>Mis puntos de reciclaje:</h3>
      {puntos.length === 0 ? (
        <p>No has creado puntos aún.</p>
      ) : (
        <ul>
          {puntos.map((p) => (
            <li key={p.id} style={{ marginBottom: "8px" }}>
              <b>{p.nombre}</b> - {p.tipo_residuo} ({p.direccion || "Sin dirección"})
              <button
                onClick={() => eliminarPunto(p.id)}
                style={{
                  marginLeft: "10px",
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Perfil;

