import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Icono de marcador
const icon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32]
});

// Componente para agregar punto en el click
function AddPoint({ onAdd }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const nombre = prompt("Nombre del punto:");
      const tipo = prompt("Tipo de residuo:");
      if (nombre && tipo) {
        onAdd({ nombre, tipo_residuo: tipo, lat, lon: lng });
      }
    }
  });
  return null;
}

function Mapa() {
  const [puntos, setPuntos] = useState([]);

  // cargar puntos
  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        const res = await fetch("http://localhost:4000/puntos");
        const data = await res.json();
        if (res.ok) setPuntos(data);
      } catch (err) {
        console.error("Error cargando puntos:", err);
      }
    };
    fetchPuntos();
  }, []);

  const handleAdd = async (punto) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/puntos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(punto)
      });
      const data = await res.json();
      if (res.ok) {
        setPuntos([data, ...puntos]);
      } else {
        alert(data.error || "Error creando punto");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={[-33.45, -70.66]} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AddPoint onAdd={handleAdd} />
        {puntos.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lon]} icon={icon}>
            <Popup>
              <b>{p.nombre}</b> <br />
              Tipo: {p.tipo_residuo} <br />
              Creado por: {p.creador_nombre}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Mapa;
