import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/principal');
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
        <div
        className="eco-bg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0
        }}
      />
      <div style={{
        background: '#ffffffd6',
        padding: '40px 32px',
        borderRadius: '8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '360px',
        zIndex: 1,
        position: 'relative'
      }}>
        <div style={{textAlign: 'center', marginBottom: '24px', position: 'relative', height: '80px'}}>
          {/* Logo planeta */}
          <img
            src={require('../assets/ecomapplaneta.png')}
            alt="Planeta"
            className="planeta-rotatorio"
            style={{
              width: '64px',
              height: '64px',
              position: 'absolute',
              left: '50%',
              top: '-100px',
              transform: 'translateX(-50%)',
              zIndex: 2
            }}
          />
          <h2 style={{fontWeight: 600, color: '#24292f', marginTop: '80px'}}>Bienvenidoヾ(•ω•`)o</h2>
        </div>
        <style>
          {`
            .eco-bg {
            background: linear-gradient(270deg, #b2c47fff, #a39cceff, #3ec6e0, #6a82fb, #be586dff, #f9ea8f, #43e97b);
            background-size: 1200% 1200%;
            animation: eco-gradient 16s ease infinite;
          }
          @keyframes eco-gradient {
            0% {background-position:0% 50%}
            50% {background-position:100% 50%}
            100% {background-position:0% 50%}
          }
            .planeta-rotatorio {
              animation: rotar-planeta 6s linear infinite;
              transform-style: preserve-3d;
            }
            @keyframes rotar-planeta {
              0% { transform: translateX(-50%) rotateY(0deg);}
              100% { transform: translateX(-50%) rotateY(360deg);}
            }
          `}
        </style>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '16px'}}>
            <label style={{display: 'block', fontWeight: 500, marginBottom: '6px', color: '#24292f'}}>Email</label>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #d0d7de',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{marginBottom: '16px'}}>
            <label style={{display: 'block', fontWeight: 500, marginBottom: '6px', color: '#24292f'}}>Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #d0d7de',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
          <button type="submit" style={{
            width: '100%',
            padding: '10px',
            background: '#5ea1cbff',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}>
            Entrar
          </button>
        </form>
        <button
          onClick={() => navigate('/registro')}
          style={{
            width: '100%',
            padding: '10px',
            background: '#649c4eff',
            color:'#f4f3f3ff' ,
            fontWeight: 600,
            border: '1px solid #2ea44f',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Registro
        </button>
        {error && <p style={{color:'red', marginTop:'16px', textAlign:'center'}}>{error}</p>}
      </div>
    </div>
  );
}

export default Login;