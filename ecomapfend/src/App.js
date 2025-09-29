import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Principal from "./pages/Principal";
import Perfil from "./pages/Perfil";
import Mapa from "./pages/Mapa";

function App() {
  // Verificar si el usuario está logueado
  const isAuthenticated = () => !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Página de inicio: login */}
        <Route path="/" element={<Login />} />

        {/* Registro */}
        <Route path="/registro" element={<Registro />} />

        {/* Rutas protegidas */}
        <Route
          path="/principal"
          element={isAuthenticated() ? <Principal /> : <Navigate to="/" />}
        />
        <Route
          path="/perfil"
          element={isAuthenticated() ? <Perfil /> : <Navigate to="/" />}
        />
        <Route
          path="/mapa"
          element={isAuthenticated() ? <Mapa /> : <Navigate to="/" />}
        />

        {/* Cualquier otra ruta redirige al login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
