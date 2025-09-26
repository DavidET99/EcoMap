import React, { useState } from 'react';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registro exitoso');
      } else {
        setMessage(data.message || 'Error al registrar');
      }
    } catch {
      setMessage('Error de conexión');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro</h2>
      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password}
        onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Registrar</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default Register;