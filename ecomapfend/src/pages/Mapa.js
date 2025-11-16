import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Modal from "react-modal";

Modal.setAppElement("#root");

// 🧭 Iconos personalizados
const iconDefault = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
});

const iconDuoc = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/167/167707.png",
  iconSize: [36, 36],
});

const iconUserLocation = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [28, 28],
});

// ⭐ Componente estrellas visual
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

// 🔔 Componente Toast para notificaciones
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Desaparece después de 3 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const backgroundColor = type === "error" ? "#e74c3c" : "#21429d";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: backgroundColor,
        color: "white",
        padding: "12px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 4000,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        animation: "slideIn 0.3s ease-out",
        maxWidth: "300px",
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>
        {type === "error" ? "⚠️" : "💡"}
      </span>
      <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
        {message}
      </span>
    </div>
  );
}

// 🎯 Captura clicks en el mapa
function AddPoint({ onMapClick, isAuthenticated, onShowToast }) {
  useMapEvents({
    click(e) {
      // Verificar si el clic fue en el botón de ubicación
      const target = e.originalEvent.target;
      const isLocateButton = target.closest('button[title="Ir a mi ubicación"]');
      
      if (!isLocateButton) {
        const { lat, lng } = e.latlng;
        
        // Verificar si el usuario está autenticado
        if (!isAuthenticated) {
          onShowToast("Debes iniciar sesión para crear puntos", "error");
          return;
        }
        
        onMapClick({ lat, lon: lng });
      }
    },
  });
  return null;
}

// 📍 Botón para volver a la ubicación del usuario
function LocateButton({ userPosition }) {
  const map = useMap();

  const handleClick = (e) => {
    if (userPosition) {
      map.flyTo(userPosition, 15, { duration: 1.2 });
    } else {
      alert("Ubicación no disponible todavía");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        zIndex: 3000,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "50%",
        width: 44,
        height: 44,
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      }}
      title="Ir a mi ubicación"
    >
      📍
    </button>
  );
}

function Mapa() {
  const [puntos, setPuntos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newPoint, setNewPoint] = useState(null);
  const [selectedPunto, setSelectedPunto] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [calificacion, setCalificacion] = useState(5);
  const [promedioGeneral, setPromedioGeneral] = useState(0);
  const [userPosition, setUserPosition] = useState(null);
  const [toast, setToast] = useState(null);
  const mapRef = useRef(null);
  
  const isAuthenticated = !!localStorage.getItem("token");

  // 🔔 Función para mostrar toast
  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  // 🧮 Calcular promedio general
  const calcularPromedioGeneral = (data) => {
    if (!data || data.length === 0) return setPromedioGeneral(0);
    const conCalificaciones = data.filter((p) => Number(p.comentarios_count) > 0);
    if (conCalificaciones.length === 0) return setPromedioGeneral(0);
    const total = conCalificaciones.reduce((sum, p) => sum + (Number(p.avg_calificacion) || 0), 0);
    setPromedioGeneral(Number((total / conCalificaciones.length).toFixed(1)));
  };

  // 🧭 Obtener ubicación una sola vez
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserPosition(coords);
          if (mapRef.current) mapRef.current.setView(coords, 14);
        },
        (err) => console.warn("No se pudo obtener ubicación:", err.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // 🔄 Cargar puntos desde backend
  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        const res = await fetch("http://localhost:4000/puntos");
        if (!res.ok) throw new Error("Error fetching puntos");
        const data = await res.json();
        setPuntos(data);
        calcularPromedioGeneral(data);
      } catch (err) {
        console.error("Error cargando puntos:", err);
      }
    };
    fetchPuntos();
  }, []);

  // 💾 Guardar punto con geocodificación inversa
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
        showToast("Punto creado exitosamente", "success");
      } else {
        const errData = await res.json();
        showToast(errData.error || "Error creando punto", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error obteniendo dirección automática", "error");
    }
  };

  // 🗨️ Obtener comentarios
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

  // 💬 Enviar comentario
  const handleComentarioSubmit = async () => {
    if (!selectedPunto) return;
    
    // Verificar autenticación para comentarios también
    if (!isAuthenticated) {
      showToast("Debes iniciar sesión para comentar", "error");
      return;
    }
    
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
        showToast("Comentario enviado exitosamente", "success");
      } else {
        showToast(data.error || "Error al enviar comentario", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al enviar comentario", "error");
    }
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* 📊 Indicador superior */}
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
          <b>{puntos.length}</b> puntos activos · Promedio general:{" "}
          <StarRating value={promedioGeneral} /> <small>({promedioGeneral})</small>
          {!isAuthenticated && (
            <div style={{ fontSize: "0.8rem", color: "#e74c3c", marginTop: 4 }}>
              ⓘ Inicia sesión para crear puntos y comentar
            </div>
          )}
        </div>
      </div>

      {/* 🗺️ Mapa principal */}
      <MapContainer
        center={[-33.45, -70.66]}
        zoom={12}
        whenCreated={(map) => (mapRef.current = map)}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AddPoint
          onMapClick={(coords) => {
            setNewPoint({ ...coords, nombre: "", tipo_residuo: "" });
            setModalIsOpen(true);
          }}
          isAuthenticated={isAuthenticated}
          onShowToast={showToast}
        />

        {/* 🔹 Puntos del mapa */}
        {puntos.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lon]}
            icon={p.creador_nombre?.toLowerCase().includes("duoc") ? iconDuoc : iconDefault}
          >
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
                  onClick={() => {
                    setSelectedPunto(p);
                    fetchComentarios(p.id);
                  }}
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

        {/* 📍 Marcador de ubicación del usuario */}
        {userPosition && <Marker position={userPosition} icon={iconUserLocation}></Marker>}

        {/* 🔘 Botón volver a mi ubicación */}
        <LocateButton userPosition={userPosition} />
      </MapContainer>

      {/* 🔔 Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 🧩 Modal crear punto - NUEVO DISEÑO MEJORADO */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: { 
            backgroundColor: "rgba(0,0,0,0.6)", 
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          content: { 
            maxWidth: "450px",
            width: "90%",
            margin: "auto",
            borderRadius: "16px",
            padding: "0",
            border: "none",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 2001,
            position: "relative",
            overflow: "hidden",
          },
        }}
      >
        <div style={{
          background: "linear-gradient(135deg, #21429d 0%, #2a78c8 100%)",
          padding: "24px",
          color: "white",
          textAlign: "center",
        }}>
          <h3 style={{ 
            margin: "0 0 8px 0", 
            fontSize: "1.4rem",
            fontWeight: "700",
          }}>
            🗺️ Crear Punto de Reciclaje
          </h3>
          <p style={{ 
            margin: "0",
            opacity: "0.9",
            fontSize: "0.9rem",
          }}>
            Agrega un nuevo punto al mapa de reciclaje
          </p>
        </div>

        <div style={{ padding: "28px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#2d3436",
              fontSize: "0.95rem",
            }}>
              📝 Nombre del punto
            </label>
            <input
              type="text"
              placeholder="Ej: Punto de reciclaje comunitario"
              value={newPoint?.nombre || ""}
              onChange={(e) => setNewPoint({ ...newPoint, nombre: e.target.value })}
              style={{ 
                width: "100%", 
                padding: "12px 16px",
                border: "2px solid #e1e8ed",
                borderRadius: "10px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "#21429d"}
              onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#2d3436",
              fontSize: "0.95rem",
            }}>
              ♻️ Tipo de residuo
            </label>
            <input
              type="text"
              placeholder="Ej: Plástico, Vidrio, Papel, Orgánico..."
              value={newPoint?.tipo_residuo || ""}
              onChange={(e) => setNewPoint({ ...newPoint, tipo_residuo: e.target.value })}
              style={{ 
                width: "100%", 
                padding: "12px 16px",
                border: "2px solid #e1e8ed",
                borderRadius: "10px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "#21429d"}
              onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
            />
          </div>

          <div style={{ 
            background: "#f8f9fa", 
            padding: "16px",
            borderRadius: "10px",
            marginBottom: "24px",
            border: "1px solid #e9ecef",
          }}>
            <p style={{ 
              margin: "0", 
              fontSize: "0.85rem",
              color: "#6c757d",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              📍 <span><b>Ubicación seleccionada:</b> Lat: {newPoint?.lat?.toFixed(4)}, Lng: {newPoint?.lon?.toFixed(4)}</span>
            </p>
          </div>

          <div style={{ 
            display: "flex", 
            gap: "12px",
            justifyContent: "flex-end",
          }}>
            <button 
              onClick={() => setModalIsOpen(false)}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                border: "2px solid #6c757d",
                background: "transparent",
                color: "#6c757d",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#6c757d";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#6c757d";
              }}
            >
              Cancelar
            </button>
            <button 
              onClick={handleSavePoint}
              style={{
                padding: "12px 28px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
                color: "white",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.95rem",
                boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(39, 174, 96, 0.3)";
              }}
            >
              ✅ Guardar Punto
            </button>
          </div>
        </div>
      </Modal>

      {/* 💬 Modal comentarios */}
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

            {isAuthenticated ? (
              <>
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
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <p>💡 Debes iniciar sesión para comentar y calificar</p>
                <button 
                  onClick={() => window.location.href = "/login"}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#2a78c8",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Ir a Login
                </button>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* 🎨 Estilos para la animación del toast */}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Mapa;