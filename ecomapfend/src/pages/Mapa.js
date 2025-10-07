import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Modal from "react-modal";

Modal.setAppElement("#root"); // evita warnings de accesibilidad en el modal

// Icono del marcador
const icon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
});

// Captura el click en el mapa para crear puntos
function AddPoint({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lon: lng });
    },
  });
  return null;
}

// Render de estrellas (visual)
const StarRating = ({ value }) => {
  const v = Number(value) || 0;
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ color: "#FFD700", fontSize: "0.95rem" }}>
      {"★".repeat(full)}
      {half ? "⯨" : ""}
      {"☆".repeat(empty)}
    </span>
  );
};

function Mapa() {
  const [puntos, setPuntos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newPoint, setNewPoint] = useState(null);

  const [selectedPunto, setSelectedPunto] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [calificacion, setCalificacion] = useState(5);

  const [promedioGeneral, setPromedioGeneral] = useState(0);

  // calcular promedio general a partir del array de puntos
  const calcularPromedioGeneral = (data) => {
  if (!data || data.length === 0) {
    setPromedioGeneral(0);
    return;
  }
  const conCalificaciones = data.filter((p) => Number(p.comentarios_count) > 0);
  if (conCalificaciones.length === 0) {
    setPromedioGeneral(0);
    return;
  }
  const total = conCalificaciones.reduce((sum, p) => sum + (Number(p.avg_calificacion) || 0), 0);
  const avg = total / conCalificaciones.length;
  setPromedioGeneral(Number(avg.toFixed(1)));
  };

  // useEffect: carga los puntos desde el backend
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const fetchPuntos = async () => {
      try {
        const res = await fetch("http://localhost:4000/puntos", { signal: controller.signal });
        if (!res.ok) throw new Error("Error fetching puntos");
        const data = await res.json();
        if (mounted) {
          setPuntos(data);
          calcularPromedioGeneral(data);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error cargando puntos:", err);
      }
    };

    fetchPuntos();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // Guardar punto con geocodificación inversa (Nominatim)
  const handleSavePoint = async () => {
    try {
      if (!newPoint) return;
      const resGeo = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newPoint.lat}&lon=${newPoint.lon}`
      );
      const geoData = await resGeo.json();
      const direccion = geoData.display_name || "Dirección desconocida";

      const punto = { ...newPoint, direccion };
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/puntos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(punto),
      });

      if (res.ok) {
        const refreshed = await fetch("http://localhost:4000/puntos");
        const data = await refreshed.json();
        setPuntos(data);
        calcularPromedioGeneral(data);
        setModalIsOpen(false);
        setNewPoint(null);
      } else {
        const errData = await res.json();
        alert(errData.error || "Error creando punto");
      }
    } catch (err) {
      console.error(err);
      alert("Error obteniendo dirección automática");
    }
  };

  // Obtener comentarios de un punto
  const fetchComentarios = async (puntoId) => {
    try {
      const res = await fetch(`http://localhost:4000/comentarios/${puntoId}`);
      if (!res.ok) throw new Error("Error fetching comentarios");
      const data = await res.json();
      setComentarios(data);
    } catch (err) {
      console.error("Error obteniendo comentarios:", err);
      setComentarios([]);
    }
  };

  // Guardar comentario
  const handleComentarioSubmit = async () => {
    if (!selectedPunto) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/comentarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          punto_id: selectedPunto.id,
          comentario: nuevoComentario,
          calificacion,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNuevoComentario("");
        setCalificacion(5);
        await fetchComentarios(selectedPunto.id);
        const refreshed = await fetch("http://localhost:4000/puntos");
        const pdata = await refreshed.json();
        setPuntos(pdata);
        calcularPromedioGeneral(pdata);
      } else {
        alert(data.error || "Error al enviar comentario");
      }
    } catch (err) {
      console.error(err);
      alert("Error al enviar comentario");
    }
  };

  const handleVerComentarios = async (punto) => {
    setSelectedPunto(punto);
    await fetchComentarios(punto.id);
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Indicador superior */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3000,
          backgroundColor: "white",
          padding: "10px 18px",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          textAlign: "center",
        }}
      >
        <div>
          <b>{puntos.length}</b> puntos activos · Promedio general: <StarRating value={promedioGeneral} />{" "}
          <small>({promedioGeneral})</small>
        </div>
      </div>

      {/* 🗺️ Mapa principal */}
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
              <div style={{ textAlign: "center", minWidth: 180 }}>
                <b>{p.nombre}</b>
                <br />
                Tipo: {p.tipo_residuo}
                <br />
                Dirección: {p.direccion || "Sin dirección"}
                <br />
                <small>
                  Creado por: <b>{p.creador_nombre}</b>
                </small>
                <br />
                <div style={{ marginTop: 6 }}>
                  <StarRating value={p.avg_calificacion || 0} /> <small>({p.comentarios_count || 0})</small>
                </div>
                <button
                  onClick={() => handleVerComentarios(p)}
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    backgroundColor: "#2a78c8",
                    border: "none",
                    color: "white",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Ver comentarios
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Modal crear punto */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.4)", zIndex: 2000 },
          content: { maxWidth: 420, margin: "auto", borderRadius: 12, padding: 20, zIndex: 2001 },
        }}
      >
        <h3>Crear Punto de Reciclaje</h3>
        <input
          type="text"
          placeholder="Nombre"
          value={newPoint?.nombre || ""}
          onChange={(e) => setNewPoint({ ...newPoint, nombre: e.target.value })}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="text"
          placeholder="Tipo de residuo"
          value={newPoint?.tipo_residuo || ""}
          onChange={(e) => setNewPoint({ ...newPoint, tipo_residuo: e.target.value })}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <div>
          <button onClick={handleSavePoint} style={{ marginRight: 8 }}>
            Guardar
          </button>
          <button onClick={() => setModalIsOpen(false)}>Cancelar</button>
        </div>
      </Modal>

      {/* Modal comentarios */}
      <Modal
        isOpen={!!selectedPunto}
        onRequestClose={() => setSelectedPunto(null)}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.4)", zIndex: 2100 },
          content: {
            maxWidth: 520,
            margin: "auto",
            borderRadius: 12,
            padding: 20,
            zIndex: 2101,
            maxHeight: "90vh",
            overflowY: "auto",
          },
        }}
      >
        {selectedPunto && (
          <>
            <h3>{selectedPunto.nombre}</h3>
            <p>
              <b>Tipo:</b> {selectedPunto.tipo_residuo} <br />
              <b>Dirección:</b> {selectedPunto.direccion} <br />
              <b>Creado por:</b> {selectedPunto.creador_nombre}
            </p>
            <hr />
            <h4>Comentarios y calificaciones</h4>

            {comentarios.length === 0 ? (
              <p>No hay comentarios todavía.</p>
            ) : (
              comentarios.map((c) => (
                <div key={c.id} style={{ marginBottom: 12 }}>
                  <b>{c.usuario_nombre}</b> — <StarRating value={c.calificacion} />
                  <br />
                  {c.comentario || <i>Sin texto</i>}
                  <hr />
                </div>
              ))
            )}

            <textarea
              placeholder="Escribe un comentario (opcional)"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 8, height: 80, resize: "none" }}
            />
            <div style={{ marginTop: 8 }}>
              <label>
                Calificación:
                <select
                  value={calificacion}
                  onChange={(e) => setCalificacion(Number(e.target.value))}
                  style={{ marginLeft: 8 }}
                >
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={handleComentarioSubmit} style={{ marginRight: 8 }}>
                Enviar
              </button>
              <button onClick={() => setSelectedPunto(null)}>Cerrar</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Mapa;
