require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db"); // tu archivo db.js que exporta Pool
const authenticateToken = require("./middleware/auth"); // tu middleware JWT

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

/* ---------------------------
   RUTAS PÚBLICAS BÁSICAS
   --------------------------- */

// Ruta raíz
app.get("/", (req, res) => {
  res.send("API EcoMap funcionando 🚀");
});

// Comprobar conexión a BD
app.get("/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "Conexión exitosa", time: result.rows[0].now });
  } catch (err) {
    console.error("db-check error:", err);
    res.status(500).json({ error: "Error conectando a la base de datos" });
  }
});

/* ---------------------------
   AUTH: REGISTER / LOGIN
   --------------------------- */

// Registro
app.post("/auth/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // verificar si email ya existe
    const existing = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQ = `
      INSERT INTO usuarios (nombre, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, nombre, email, creado_en
    `;
    const result = await pool.query(insertQ, [nombre, email, hashedPassword]);

    res.status(201).json({ message: "Usuario registrado con éxito", user: result.rows[0] });
  } catch (err) {
    console.error("Error en /auth/register:", err);
    res.status(500).json({ error: "Error registrando usuario" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email y contraseña requeridos" });

    const userQ = "SELECT * FROM usuarios WHERE email = $1";
    const userRes = await pool.query(userQ, [email]);

    if (userRes.rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login exitoso",
      token,
      usuario: { id: user.id, nombre: user.nombre, email: user.email }
    });
  } catch (err) {
    console.error("Error en /auth/login:", err);
    res.status(500).json({ error: "Error en login" });
  }
});

/* ---------------------------
   RUTAS DE PUNTOS (CRUD)
   --------------------------- */

// Obtener todos los puntos (con nombre del creador)
app.get("/puntos", async (req, res) => {
  try {
    const q = `
      SELECT p.id, p.usuario_id, p.nombre, p.tipo_residuo, p.direccion, p.lat, p.lon, p.creado_en,
             u.nombre AS creador_nombre, u.email AS creador_email
      FROM puntos_reciclaje p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.creado_en DESC
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo /puntos:", err);
    res.status(500).json({ error: "Error obteniendo puntos" });
  }
});

// Obtener un punto por id (con creador)
app.get("/puntos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      SELECT p.id, p.usuario_id, p.nombre, p.tipo_residuo, p.direccion, p.lat, p.lon, p.creado_en,
             u.nombre AS creador_nombre, u.email AS creador_email
      FROM puntos_reciclaje p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(q, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Punto no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error obteniendo /puntos/:id:", err);
    res.status(500).json({ error: "Error obteniendo punto" });
  }
});

// Crear un punto (protegida) ✅ corregido
app.post("/puntos", authenticateToken, async (req, res) => {
  try {
    const { nombre, tipo_residuo, direccion, lat, lon } = req.body;

    if (!nombre || !tipo_residuo) {
      return res.status(400).json({ error: "Nombre y tipo de residuo son obligatorios" });
    }

    // Insertar punto
    const insert = await pool.query(
      `INSERT INTO puntos_reciclaje (usuario_id, nombre, tipo_residuo, direccion, lat, lon)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [req.user.id, nombre, tipo_residuo, direccion, lat, lon]
    );

    const nuevoId = insert.rows[0].id;

    // Devolver punto con JOIN
    const result = await pool.query(
      `SELECT p.id, p.usuario_id, p.nombre, p.tipo_residuo, p.direccion, p.lat, p.lon, p.creado_en,
              u.nombre AS creador_nombre, u.email AS creador_email
       FROM puntos_reciclaje p
       JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = $1`,
      [nuevoId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creando punto:", err.message);
    res.status(500).json({ error: "Error creando punto" });
  }
});

// Eliminar punto (solo dueño)
app.delete("/puntos/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query("SELECT * FROM puntos_reciclaje WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Punto no encontrado" });

    if (check.rows[0].usuario_id !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ error: "No tienes permiso para borrar este punto" });
    }

    await pool.query("DELETE FROM puntos_reciclaje WHERE id = $1", [id]);
    res.json({ message: "Punto eliminado con éxito" });
  } catch (err) {
    console.error("Error eliminando /puntos/:id:", err);
    res.status(500).json({ error: "Error eliminando punto" });
  }
});

/* ---------------------------
   RUTAS DE USUARIO / PERFIL
   --------------------------- */

// Perfil propio + puntos (protegida)
app.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const userRes = await pool.query("SELECT id, nombre, email, creado_en FROM usuarios WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const puntosRes = await pool.query(
      "SELECT id, nombre, tipo_residuo, direccion, lat, lon, creado_en FROM puntos_reciclaje WHERE usuario_id = $1 ORDER BY creado_en DESC",
      [userId]
    );

    res.json({ usuario: userRes.rows[0], puntos: puntosRes.rows });
  } catch (err) {
    console.error("Error en /me:", err);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
});

// Usuario público y sus puntos (por id)
app.get("/usuarios/:id/puntos", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const userRes = await pool.query("SELECT id, nombre, email, creado_en FROM usuarios WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const puntosRes = await pool.query(
      "SELECT id, nombre, tipo_residuo, direccion, lat, lon, creado_en FROM puntos_reciclaje WHERE usuario_id = $1 ORDER BY creado_en DESC",
      [userId]
    );

    res.json({ usuario: userRes.rows[0], puntos: puntosRes.rows });
  } catch (err) {
    console.error("Error en /usuarios/:id/puntos:", err);
    res.status(500).json({ error: "Error obteniendo datos del usuario" });
  }
});

// Obtener puntos del usuario autenticado
app.get("/mis-puntos", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM puntos_reciclaje WHERE usuario_id = $1 ORDER BY creado_en DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo tus puntos" });
  }
});

/* ---------------------------
   INICIO SERVIDOR
   --------------------------- */
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
