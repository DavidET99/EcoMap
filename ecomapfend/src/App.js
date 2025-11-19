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
        {/* Página de inicio: Principal */}
        <Route path="/" element={<Principal />} />

        {/* Login y Registro */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas protegidas - requieren login */}
        <Route
          path="/perfil"
          element={isAuthenticated() ? <Perfil /> : <Navigate to="/login" />}
        />
        
        {/* Mapa individual */}
        <Route path="/mapa" element={<Mapa />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;