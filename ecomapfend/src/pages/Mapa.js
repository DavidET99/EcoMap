import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Modal from "react-modal";

// Icono de marcador
const icon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
});

// Componente para capturar clicks en el mapa
function AddPoint({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lon: lng });
    },
  });
  return null;
}

function Mapa() {
  const [puntos, setPuntos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newPoint, setNewPoint] = useState(null);

  // Cargar puntos desde el backend
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

  // Guardar punto con dirección automática
  const handleSavePoint = async () => {
    try {
      // Obtener dirección automática desde Nominatim
      const resGeo = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newPoint.lat}&lon=${newPoint.lon}`
      );
      const geoData = await resGeo.json();
      const direccion = geoData.display_name || "Dirección desconocida";

      const punto = {
        ...newPoint,
        direccion,
      };

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/puntos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(punto),
      });

      const data = await res.json();
      if (res.ok) {
        const updatedRes = await fetch("http://localhost:4000/puntos");
        const updatedData = await updatedRes.json();
        setPuntos(updatedData);
        setModalIsOpen(false);
        setNewPoint(null);
      } else {
        alert(data.error || "Error creando punto");
      }
    } catch {
      alert("Error obteniendo dirección automática");
    }
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={[-33.45, -70.66]} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AddPoint
          onMapClick={(coords) => {
            setNewPoint({ ...coords, nombre: "", tipo_residuo: "" });
            setModalIsOpen(true);
          }}
        />
        {puntos.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lon]} icon={icon}>
            <Popup>
              <b>{p.nombre}</b> <br />
              Tipo: {p.tipo_residuo} <br />
              Dirección: {p.direccion || "Sin dirección"} <br />
              Creado por: {p.creador_nombre}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Modal para ingresar datos del punto */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 2000, // 🔹 más alto que Leaflet
          },
          content: {
            maxWidth: "400px",
            margin: "auto",
            borderRadius: "12px",
            padding: "20px",
            position: "relative",
            zIndex: 2001, // 🔹 aún más alto que el overlay
          },
        }}
      >

        <h3>Crear Punto de Reciclaje</h3>
        <input
          type="text"
          placeholder="Nombre"
          value={newPoint?.nombre || ""}
          onChange={(e) => setNewPoint({ ...newPoint, nombre: e.target.value })}
          style={{ width: "100%", marginBottom: "8px", padding: "8px" }}
        />
        <input
          type="text"
          placeholder="Tipo de residuo"
          value={newPoint?.tipo_residuo || ""}
          onChange={(e) => setNewPoint({ ...newPoint, tipo_residuo: e.target.value })}
          style={{ width: "100%", marginBottom: "8px", padding: "8px" }}
        />
        <button onClick={handleSavePoint} style={{ marginRight: "8px" }}>
          Guardar
        </button>
        <button onClick={() => setModalIsOpen(false)}>Cancelar</button>
      </Modal>
    </div>
  );
}

export default Mapa;
