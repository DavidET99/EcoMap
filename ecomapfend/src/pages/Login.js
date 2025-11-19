import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await apiService.login(email, password);
      localStorage.setItem('token', result.token);
      navigate('/principal');
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/*Meta viewport*/}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '16px', 
        }}
      >
        <div
          className="eco-bg"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0
          }}
        />
        
        <div style={{
          background: '#ffffff',
          padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', 
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          width: '100%',
          maxWidth: 'min(400px, 90vw)', 
          zIndex: 1,
          position: 'relative',
          border: '1px solid #f0f0f0'
        }}>
          
          {/* Logo */}
          <div style={{
            textAlign: 'center', 
            marginBottom: 'clamp(20px, 4vw, 24px)', 
            position: 'relative', 
            height: 'clamp(60px, 12vw, 80px)'
          }}>
            <img
              src={require('../assets/ecomapplaneta.png')}
              alt="Planeta"
              className="planeta-rotatorio"
              style={{
                width: 'clamp(48px, 10vw, 64px)', 
                height: 'clamp(48px, 10vw, 64px)',
                position: 'absolute',
                left: '50%',
                top: 'clamp(-70px, -12vw, -100px)',
                transform: 'translateX(-50%)',
                zIndex: 2
              }}
            />
            <h2 style={{
              fontWeight: 600, 
              color: '#24292f', 
              marginTop: 'clamp(60px, 12vw, 80px)',
              fontSize: 'clamp(1.3rem, 4vw, 1.5rem)' 
            }}>
              Bienvenidoヾ(•ω•`)o
            </h2>
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
              
              button {
                min-height: 44px; 
              }
              input {
                font-size: 16px; 
                min-height: 44px;
              }
            `}
          </style>

          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: 'clamp(12px, 3vw, 16px)'}}>
              <label style={{
                display: 'block', 
                fontWeight: 500, 
                marginBottom: '6px', 
                color: '#24292f',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)'
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'clamp(10px, 3vw, 12px)',
                  borderRadius: '8px',
                  border: '1px solid #d0d7de',
                  fontSize: 'clamp(16px, 4vw, 18px)', 
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{marginBottom: 'clamp(16px, 4vw, 20px)'}}>
              <label style={{
                display: 'block', 
                fontWeight: 500, 
                marginBottom: '6px', 
                color: '#24292f',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'clamp(10px, 3vw, 12px)',
                  borderRadius: '8px',
                  border: '1px solid #d0d7de',
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: 'clamp(12px, 3vw, 14px)',
                background: loading ? '#cccccc' : '#5ea1cbff',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(16px, 4vw, 18px)',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: 'clamp(10px, 2vw, 12px)',
                opacity: loading ? 0.7 : 1,
                minHeight: '44px'
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>
          
          <button
            onClick={() => navigate('/registro')}
            style={{
              width: '100%',
              padding: 'clamp(12px, 3vw, 14px)',
              background: '#649c4eff',
              color: '#f4f3f3ff',
              fontWeight: 600,
              border: '1px solid #2ea44f',
              borderRadius: '8px',
              fontSize: 'clamp(16px, 4vw, 18px)',
              cursor: 'pointer',
              minHeight: '44px'
            }}
          >
            Registro
          </button>
          
          {error && (
            <p style={{
              color: 'red', 
              marginTop: 'clamp(12px, 3vw, 16px)', 
              textAlign: 'center',
              fontSize: 'clamp(0.8rem, 3vw, 0.9rem)'
            }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Login;