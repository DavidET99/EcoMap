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
          {puntos.map(p => (
            <li key={p.id}>
              <b>{p.nombre}</b> - {p.tipo_residuo} ({p.direccion || "Sin dirección"})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Perfil;
