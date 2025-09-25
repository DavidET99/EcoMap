const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const app = express();

app.use(cors());
app.use(express.json());

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API EcoMap funcionando 🚀");
});

// Ruta para probar conexión a BD
app.get("/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "Conexión exitosa", time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error conectando a la base de datos" });
  }
});

// Obtener todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo usuarios:", err.message);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

// Crear un usuario
app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING *",
      [nombre, email, password]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creando usuario:", err.message);
    res.status(500).json({ error: "Error creando usuario" });
  }
});

// Obtener un usuario por ID
app.get("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error obteniendo usuario:", err.message);
    res.status(500).json({ error: "Error obteniendo usuario" });
  }
});

// Eliminar un usuario
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado", usuario: result.rows[0] });
  } catch (err) {
    console.error("Error eliminando usuario:", err.message);
    res.status(500).json({ error: "Error eliminando usuario" });
  }
});


// ==================
// SERVIDOR
// ==================
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


// ==================
// REGISTRO DE USUARIO
// ==================
app.post("/auth/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email, creado_en",
      [nombre, email, hashedPassword]
    );

    res.status(201).json({ message: "Usuario registrado con éxito", user: result.rows[0] });
  } catch (err) {
    console.error("Error en registro:", err.message);
    res.status(500).json({ error: "Error registrando usuario" });
  }
});

// ==================
// LOGIN DE USUARIO
// ==================
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login exitoso", token, user: { id: user.id, nombre: user.nombre, email: user.email } });
  } catch (err) {
    console.error("Error en login:", err.message);
    res.status(500).json({ error: "Error en login" });
  }
});