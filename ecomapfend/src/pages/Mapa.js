import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Modal from "react-modal";
import apiService from "../services/api";

Modal.setAppElement("#root");

// Iconos personalizados
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

// Componente estrellas visual
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

// Componente Toast para notificaciones
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); 

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

// Captura clicks en el mapa
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

// Botón para volver a la ubicación del usuario
function LocateButton({ userPosition, isMobile }) {
  const map = useMap();

  const handleClick = (e) => {
    e.stopPropagation(); 
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
        bottom: isMobile ? "35px" : "45px", 
        right: "20px",
        zIndex: 3000,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        fontSize: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "44px",
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const mapRef = useRef(null);
  
  const isAuthenticated = !!localStorage.getItem("token");

  //  Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //  Función para mostrar toast
  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  //  Calcular promedio general
  const calcularPromedioGeneral = (data) => {
    if (!data || data.length === 0) return setPromedioGeneral(0);
    const conCalificaciones = data.filter((p) => Number(p.comentarios_count) > 0);
    if (conCalificaciones.length === 0) return setPromedioGeneral(0);
    const total = conCalificaciones.reduce((sum, p) => sum + (Number(p.avg_calificacion) || 0), 0);
    setPromedioGeneral(Number((total / conCalificaciones.length).toFixed(1)));
  };

  //  Obtener ubicación una sola vez
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

  //  Cargar puntos desde backend
  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        const data = await apiService.getPuntos();
        setPuntos(data);
        calcularPromedioGeneral(data);
      } catch (err) {
        console.error("Error cargando puntos:", err);
      }
    };
    fetchPuntos();
  }, []);

  // Guardar punto con geocodificación inversa
  const handleSavePoint = async () => {
  try {
    if (!newPoint) return;
    
    const resGeo = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newPoint.lat}&lon=${newPoint.lon}`
    );
    const geoData = await resGeo.json();
    const direccion = geoData.display_name || "Dirección desconocida";

    const puntoData = {
      nombre: newPoint.nombre || "",
      tipo_residuo: newPoint.tipo_residuo || "",
      direccion: direccion,
      lat: newPoint.lat,
      lon: newPoint.lon
    };

    console.log("Enviando datos:", puntoData); 

    await apiService.createPunto(puntoData);
    
    // Recargar puntos
    const data = await apiService.getPuntos();
    setPuntos(data);
    calcularPromedioGeneral(data);
    setModalIsOpen(false);
    setNewPoint(null);
    showToast("Punto creado exitosamente", "success");
  } catch (err) {
    console.error("Error detallado creando punto:", err);
    showToast("Error creando punto: " + err.message, "error");
  }
};

  // Obtener comentarios
  const fetchComentarios = async (puntoId) => {
    try {
      const data = await apiService.getComentarios(puntoId);
      setComentarios(data);
    } catch (err) {
      console.error("Error obteniendo comentarios:", err);
      setComentarios([]);
    }
  };

  // Enviar comentario
  const handleComentarioSubmit = async () => {
    if (!selectedPunto) return;
    if (!isAuthenticated) {
      showToast("Debes iniciar sesión para comentar", "error");
      return;
    }
    
    try {
      const comentarioData = {
        punto_id: Number(selectedPunto.id),        
        comentario: nuevoComentario || "",         
        calificacion: Number(calificacion)         
      };

      console.log("Enviando comentario:", comentarioData);

      await apiService.createComentario(comentarioData);
      
      setNuevoComentario("");
      setCalificacion(5);
      await fetchComentarios(selectedPunto.id);
      
      // Recargar puntos para actualizar promedios
      const data = await apiService.getPuntos();
      setPuntos(data);
      calcularPromedioGeneral(data);
      showToast("Comentario enviado exitosamente", "success");
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      showToast("Error al enviar comentario: " + err.message, "error");
    }
  };

  return (
    <>
      {/* Meta viewport para móviles */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      
      <div className="map-container" style={{ 
        height: isMobile ? "calc(100vh - 60px)" : "100vh", 
        width: "100%", 
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Indicador superior*/}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "70px" : "10px", 
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3000,
            backgroundColor: "white",
            padding: "clamp(8px, 2vw, 12px) clamp(12px, 3vw, 18px)",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            textAlign: "center",
            width: isMobile ? "95%" : "90%",
            maxWidth: "400px",
            fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
          }}
        >
          <div>
            <b>{puntos.length}</b> puntos activos · Promedio:{" "}
            <StarRating value={promedioGeneral} /> <small>({promedioGeneral})</small>
            {!isAuthenticated && (
              <div style={{ fontSize: "clamp(0.7rem, 2.5vw, 0.8rem)", color: "#e74c3c", marginTop: "4px" }}>
                ⓘ Inicia sesión para crear puntos y comentar
              </div>
            )}
          </div>
        </div>

        {/*  Mapa principal */}
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

          {/* Puntos del mapa */}
          {puntos.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lon]}
              icon={p.creador_nombre?.toLowerCase().includes("duoc") ? iconDuoc : iconDefault}
            >
              <Popup>
                <div style={{ textAlign: "center", minWidth: "180px", maxWidth: "min(250px, 80vw)" }}>
                  <b style={{ fontSize: "clamp(1rem, 3vw, 1.1rem)" }}>{p.nombre}</b>
                  <br />
                  Tipo: {p.tipo_residuo}
                  <br />
                  <small>
                    {p.direccion || "Sin dirección"}
                    <br />
                    Creado por: <b>{p.creador_nombre}</b>
                  </small>
                  <br />
                  <div style={{ marginTop: "6px" }}>
                    <StarRating value={p.avg_calificacion || 0} /> <small>({p.comentarios_count || 0})</small>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPunto(p);
                      fetchComentarios(p.id);
                    }}
                    style={{
                      marginTop: "8px",
                      padding: "clamp(6px, 2vw, 8px) clamp(10px, 2vw, 12px)",
                      backgroundColor: "#2a78c8",
                      border: "none",
                      color: "white",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                      minHeight: "36px",
                    }}
                  >
                    Ver comentarios
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Marcador de ubicación del usuario */}
          {userPosition && <Marker position={userPosition} icon={iconUserLocation}></Marker>}

          {/* Botón volver a mi ubicación */}
          <LocateButton userPosition={userPosition} />
        </MapContainer>

        {/* Toast notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Modal crear punto*/}
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
              padding: "16px",
            },
            content: { 
              maxWidth: "min(450px, 90vw)",
              width: "90%",
              margin: "auto",
              borderRadius: "16px",
              padding: "0",
              border: "none",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              maxHeight: "90vh",
              overflowY: "auto",
            },
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #21429d 0%, #2a78c8 100%)",
            padding: "clamp(20px, 4vw, 24px)",
            color: "white",
            textAlign: "center",
          }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "clamp(1.2rem, 4vw, 1.4rem)",
              fontWeight: "700",
            }}>
              🗺️ Crear Punto de Reciclaje
            </h3>
            <p style={{ 
              margin: "0",
              opacity: "0.9",
              fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
            }}>
              Agrega un nuevo punto al mapa de reciclaje
            </p>
          </div>

          <div style={{ padding: "clamp(20px, 4vw, 28px)" }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#2d3436",
                fontSize: "clamp(0.9rem, 3vw, 0.95rem)",
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
                  padding: "clamp(10px, 3vw, 12px) clamp(12px, 3vw, 16px)",
                  border: "2px solid #e1e8ed",
                  borderRadius: "10px",
                  fontSize: "clamp(14px, 3vw, 16px)",
                  transition: "all 0.3s ease",
                  outline: "none",
                  boxSizing: "border-box",
                  minHeight: "44px",
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
                fontSize: "clamp(0.9rem, 3vw, 0.95rem)",
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
                  padding: "clamp(10px, 3vw, 12px) clamp(12px, 3vw, 16px)",
                  border: "2px solid #e1e8ed",
                  borderRadius: "10px",
                  fontSize: "clamp(14px, 3vw, 16px)",
                  transition: "all 0.3s ease",
                  outline: "none",
                  boxSizing: "border-box",
                  minHeight: "44px",
                }}
                onFocus={(e) => e.target.style.borderColor = "#21429d"}
                onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
              />
            </div>

            <div style={{ 
              background: "#f8f9fa", 
              padding: "clamp(12px, 3vw, 16px)",
              borderRadius: "10px",
              marginBottom: "24px",
              border: "1px solid #e9ecef",
            }}>
              <p style={{ 
                margin: "0", 
                fontSize: "clamp(0.75rem, 2.5vw, 0.85rem)",
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
              flexWrap: "wrap",
            }}>
              <button 
                onClick={() => setModalIsOpen(false)}
                style={{
                  padding: "clamp(10px, 3vw, 12px) clamp(16px, 3vw, 24px)",
                  borderRadius: "10px",
                  border: "2px solid #6c757d",
                  background: "transparent",
                  color: "#6c757d",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "clamp(0.85rem, 3vw, 0.95rem)",
                  transition: "all 0.3s ease",
                  minHeight: "44px",
                  flex: "1",
                  minWidth: "120px",
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
                  padding: "clamp(10px, 3vw, 12px) clamp(20px, 3vw, 28px)",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
                  color: "white",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "clamp(0.85rem, 3vw, 0.95rem)",
                  boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)",
                  transition: "all 0.3s ease",
                  minHeight: "44px",
                  flex: "1",
                  minWidth: "140px",
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

        {/*Modal comentarios*/}
        <Modal
          isOpen={!!selectedPunto}
          onRequestClose={() => setSelectedPunto(null)}
          style={{
            overlay: { 
              backgroundColor: "rgba(0,0,0,0.4)", 
              zIndex: 2100,
              padding: "16px",
            },
            content: {
              maxWidth: "min(520px, 95vw)",
              margin: "auto",
              borderRadius: "12px",
              padding: "clamp(16px, 3vw, 20px)",
              zIndex: 2101,
              maxHeight: "90vh",
              overflowY: "auto",
            },
          }}
        >
          {selectedPunto && (
            <>
              <h3 style={{ fontSize: "clamp(1.2rem, 4vw, 1.4rem)", marginBottom: "12px" }}>
                {selectedPunto.nombre}
              </h3>
              <p style={{ fontSize: "clamp(0.9rem, 3vw, 1rem)", marginBottom: "16px" }}>
                <b>Tipo:</b> {selectedPunto.tipo_residuo} <br />
                <b>Dirección:</b> {selectedPunto.direccion} <br />
                <b>Creado por:</b> {selectedPunto.creador_nombre}
              </p>
              <hr />
              <h4 style={{ fontSize: "clamp(1.1rem, 3.5vw, 1.2rem)" }}>Comentarios y calificaciones</h4>
              {comentarios.length === 0 ? (
                <p>No hay comentarios todavía.</p>
              ) : (
                comentarios.map((c) => (
                  <div key={c.id} style={{ marginBottom: "12px", fontSize: "clamp(0.9rem, 3vw, 1rem)" }}>
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
                    style={{ 
                      width: "100%", 
                      marginTop: "8px", 
                      padding: "12px", 
                      height: "80px", 
                      resize: "none",
                      fontSize: "clamp(14px, 3vw, 16px)",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <label style={{ fontSize: "clamp(0.9rem, 3vw, 1rem)" }}>
                      Calificación:
                      <select
                        value={calificacion}
                        onChange={(e) => setCalificacion(Number(e.target.value))}
                        style={{ 
                          marginLeft: "8px", 
                          padding: "8px",
                          fontSize: "clamp(14px, 3vw, 16px)",
                          minHeight: "40px",
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button 
                      onClick={handleComentarioSubmit} 
                      style={{ 
                        marginRight: "8px",
                        padding: "10px 20px",
                        backgroundColor: "#2a78c8",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "clamp(0.9rem, 3vw, 1rem)",
                        minHeight: "44px",
                        flex: "1",
                      }}
                    >
                      Enviar
                    </button>
                    <button 
                      onClick={() => setSelectedPunto(null)}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "clamp(0.9rem, 3vw, 1rem)",
                        minHeight: "44px",
                        flex: "1",
                      }}
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <p style={{ fontSize: "clamp(0.9rem, 3vw, 1rem)" }}>
                    💡 Debes iniciar sesión para comentar y calificar
                  </p>
                  <button 
                    onClick={() => window.location.href = "/login"}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#2a78c8",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "clamp(0.9rem, 3vw, 1rem)",
                      minHeight: "44px",
                      marginTop: "10px",
                    }}
                  >
                    Ir a Login
                  </button>
                </div>
              )}
            </>
          )}
        </Modal>

        {/* Estilos para la animación del toast */}
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
            
            button {
              min-height: 44px;
            }
            input, select, textarea {
              font-size: 16px;
            }
          `}
        </style>
      </div>
    </>
  );
}

export default Mapa;