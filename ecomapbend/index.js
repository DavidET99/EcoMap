require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const authenticateToken = require("./middleware/auth");

const app = express();

// CORS actualizado para producción
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ecomapmobile.netlify.app/',
    'https://*.netlify.app'
  ],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 4000;

/* ---------------------------
   HEALTH CHECK PARA RENDER (NUEVO)
--------------------------- */

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ 
      status: 'OK', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

/* ---------------------------
   RUTAS PÚBLICAS BÁSICAS
--------------------------- */

app.get("/", (req, res) => {
  res.send("API EcoMap funcionando 🚀");
});

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

app.post("/auth/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ error: "Todos los campos son obligatorios" });

    const existing = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Email ya registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email, creado_en`,
      [nombre, email, hashedPassword]
    );

    res.status(201).json({ message: "Usuario registrado con éxito", user: result.rows[0] });
  } catch (err) {
    console.error("Error en /auth/register:", err);
    res.status(500).json({ error: "Error registrando usuario" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email y contraseña requeridos" });

    const userRes = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (userRes.rows.length === 0)
      return res.status(401).json({ error: "Usuario no encontrado" });

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      usuario: { id: user.id, nombre: user.nombre, email: user.email },
    });
  } catch (err) {
    console.error("Error en /auth/login:", err);
    res.status(500).json({ error: "Error en login" });
  }
});

/* ---------------------------
   RUTAS DE PUNTOS (CRUD)
--------------------------- */

app.get("/puntos", async (req, res) => {
  try {
    const q = `
      SELECT p.id, p.usuario_id, p.nombre, p.tipo_residuo, p.direccion, p.lat, p.lon, p.creado_en,
             u.nombre AS creador_nombre, u.email AS creador_email,
             COALESCE(ROUND(avg_com.avg_calificacion::numeric,2),0) AS avg_calificacion,
             COALESCE(avg_com.comentarios_count, 0) AS comentarios_count
      FROM puntos_reciclaje p
      JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN (
        SELECT punto_id, AVG(calificacion) AS avg_calificacion, COUNT(*) AS comentarios_count
        FROM comentarios
        GROUP BY punto_id
      ) avg_com ON avg_com.punto_id = p.id
      ORDER BY p.creado_en DESC
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo /puntos:", err);
    res.status(500).json({ error: "Error obteniendo puntos" });
  }
});

app.get("/puntos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      SELECT p.id, p.usuario_id, p.nombre, p.tipo_residuo, p.direccion, p.lat, p.lon, p.creado_en,
             u.nombre AS creador_nombre, u.email AS creador_email,
             COALESCE(ROUND(avg_com.avg_calificacion::numeric,2),0) AS avg_calificacion,
             COALESCE(avg_com.comentarios_count, 0) AS comentarios_count
      FROM puntos_reciclaje p
      JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN (
        SELECT punto_id, AVG(calificacion) AS avg_calificacion, COUNT(*) AS comentarios_count
        FROM comentarios
        GROUP BY punto_id
      ) avg_com ON avg_com.punto_id = p.id
      WHERE p.id = $1
    `;
    const result = await pool.query(q, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Punto no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error obteniendo /puntos/:id:", err);
    res.status(500).json({ error: "Error obteniendo punto" });
  }
});

app.post("/puntos", authenticateToken, async (req, res) => {
  try {
    const { nombre, tipo_residuo, direccion, lat, lon } = req.body;
    if (!nombre || !tipo_residuo)
      return res.status(400).json({ error: "Nombre y tipo de residuo son obligatorios" });

    const insert = await pool.query(
      `INSERT INTO puntos_reciclaje (usuario_id, nombre, tipo_residuo, direccion, lat, lon)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [req.user.id, nombre, tipo_residuo, direccion, lat, lon]
    );

    const nuevoId = insert.rows[0].id;

    const result = await pool.query(
      `SELECT p.id, p.usuario_id, p.nombre, p.tipo_residuo, p.direccion, p.lat, p.lon, p.creado_en,
              u.nombre AS creador_nombre, u.email AS creador_email,
              0 AS avg_calificacion, 0 AS comentarios_count
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

app.delete("/puntos/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query("SELECT * FROM puntos_reciclaje WHERE id = $1", [id]);
    if (check.rows.length === 0)
      return res.status(404).json({ error: "Punto no encontrado" });

    if (check.rows[0].usuario_id !== parseInt(req.user.id, 10))
      return res.status(403).json({ error: "No tienes permiso para borrar este punto" });

    await pool.query("DELETE FROM puntos_reciclaje WHERE id = $1", [id]);
    res.json({ message: "Punto eliminado con éxito" });
  } catch (err) {
    console.error("Error eliminando /puntos/:id:", err);
    res.status(500).json({ error: "Error eliminando punto" });
  }
});

/* ---------------------------
   RUTAS DE COMENTARIOS
--------------------------- */

app.get("/comentarios/:punto_id", async (req, res) => {
  try {
    const puntoId = parseInt(req.params.punto_id, 10);
    const q = `
      SELECT c.id, c.comentario, c.calificacion, c.creado_en,
             u.id AS usuario_id, u.nombre AS usuario_nombre
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.punto_id = $1
      ORDER BY c.creado_en DESC
    `;
    const result = await pool.query(q, [puntoId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo comentarios:", err);
    res.status(500).json({ error: "Error obteniendo comentarios" });
  }
});

app.post("/comentarios", authenticateToken, async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id, 10);
    const { punto_id, comentario, calificacion } = req.body;
    const puntoId = parseInt(punto_id, 10);

    if (!puntoId || !calificacion)
      return res.status(400).json({ error: "punto_id y calificación son obligatorios" });

    if (calificacion < 1 || calificacion > 5)
      return res.status(400).json({ error: "calificación debe estar entre 1 y 5" });

    const check = await pool.query("SELECT id FROM puntos_reciclaje WHERE id = $1", [puntoId]);
    if (check.rows.length === 0)
      return res.status(404).json({ error: "Punto no encontrado" });

    const insertQ = `
      INSERT INTO comentarios (usuario_id, punto_id, comentario, calificacion)
      VALUES ($1, $2, $3, $4) RETURNING id
    `;
    const insertRes = await pool.query(insertQ, [usuarioId, puntoId, comentario || null, calificacion]);
    const newCommentId = insertRes.rows[0].id;

    const commentQ = `
      SELECT c.id, c.comentario, c.calificacion, c.creado_en,
             u.id AS usuario_id, u.nombre AS usuario_nombre
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = $1
    `;
    const commentRes = await pool.query(commentQ, [newCommentId]);

    const statsQ = `
      SELECT COALESCE(ROUND(AVG(calificacion)::numeric,2),0) AS avg_calificacion,
             COUNT(*) AS comentarios_count
      FROM comentarios
      WHERE punto_id = $1
    `;
    const statsRes = await pool.query(statsQ, [puntoId]);

    res.status(201).json({
      comment: commentRes.rows[0],
      avg_calificacion: Number(statsRes.rows[0].avg_calificacion),
      comentarios_count: Number(statsRes.rows[0].comentarios_count),
    });
  } catch (err) {
    console.error("Error creando comentario:", err);
    res.status(500).json({ error: "Error creando comentario" });
  }
});

app.get("/mis-comentarios", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const q = `
      SELECT c.id, c.comentario, c.calificacion, c.creado_en,
             p.nombre AS punto_nombre, p.id AS punto_id
      FROM comentarios c
      JOIN puntos_reciclaje p ON c.punto_id = p.id
      WHERE c.usuario_id = $1
      ORDER BY c.creado_en DESC
    `;
    const result = await pool.query(q, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo /mis-comentarios:", err);
    res.status(500).json({ error: "Error obteniendo tus comentarios" });
  }
});

app.delete("/comentarios/:id", authenticateToken, async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id, 10);
    const commentId = parseInt(req.params.id, 10);

    if (isNaN(commentId)) {
      return res.status(400).json({ error: "ID de comentario inválido" });
    }

    const check = await pool.query(
      "SELECT usuario_id, punto_id FROM comentarios WHERE id = $1",
      [commentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    const row = check.rows[0];
    if (row.usuario_id !== usuarioId) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para eliminar este comentario" });
    }

    await pool.query("DELETE FROM comentarios WHERE id = $1", [commentId]);

    const statsQ = `
      SELECT COALESCE(ROUND(AVG(calificacion)::numeric,2),0) AS avg_calificacion,
             COUNT(*) AS comentarios_count
      FROM comentarios
      WHERE punto_id = $1
    `;
    const statsRes = await pool.query(statsQ, [row.punto_id]);

    res.json({
      message: "Comentario eliminado",
      avg_calificacion: Number(statsRes.rows[0].avg_calificacion),
      comentarios_count: Number(statsRes.rows[0].comentarios_count),
    });
  } catch (err) {
    console.error("Error eliminando comentario:", err.message);
    res.status(500).json({ error: "Error interno al eliminar comentario" });
  }
});

/* ---------------------------
   RUTAS DE USUARIOS
--------------------------- */

app.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const userRes = await pool.query("SELECT id, nombre, email, creado_en FROM usuarios WHERE id = $1", [userId]);
    if (userRes.rows.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

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

/* ---------------------------
   INICIO SERVIDOR
--------------------------- */

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Health check disponible en: http://localhost:${PORT}/health`);
});