const express = require("express");
const path = require("path"); 
const connectDB = require("./config/db");
const initAdmin = require("./config/initialAdmin");
const authMiddleware = require("./middlewares/auth");
const cors = require("cors");

// Cargar modelos
require("./models/User");
require("./models/Asset");
require("./models/Scene");
require("./models/Procer");
require("./models/ARModel");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta raíz con documentación completa de la API
app.get("/", (req, res) => {
  res.json({
    status: "API funcionando",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        register: "POST /api/auth/register",
        profile: "GET /api/auth/me (requiere autenticación)"
      },
      proceres: {
        list: "GET /api/proceres",
        detail: "GET /api/proceres/:id",
        create: "POST /api/proceres (requiere admin)",
        update: "PUT /api/proceres/:id (requiere admin)",
        delete: "DELETE /api/proceres/:id (requiere admin)"
      },
      realidad_aumentada: {
        modelos: {
          list: "GET /api/ar/models",
          detail: "GET /api/ar/models/:id",
          create: "POST /api/ar/models (requiere autenticación)",
          update: "PUT /api/ar/models/:id (requiere autenticación)",
          delete: "DELETE /api/ar/models/:id (requiere autenticación)"
        },
        escenas: {
          list: "GET /api/ar/scenes",
          detail: "GET /api/ar/scenes/:id",
          create: "POST /api/ar/scenes (requiere autenticación)",
          update: "PUT /api/ar/scenes/:id (requiere autenticación)",
          delete: "DELETE /api/ar/scenes/:id (requiere autenticación)"
        }
      },
      usuarios: {
        list: "GET /api/users (requiere admin)",
        detail: "GET /api/users/:id (requiere admin)",
        update: "PUT /api/users/:id (requiere admin o propio usuario)",
        delete: "DELETE /api/users/:id (requiere admin)"
      },
      assets: {
        list: "GET /api/assets",
        upload: "POST /api/assets (requiere autenticación)",
        delete: "DELETE /api/assets/:id (requiere autenticación)"
      }
    }
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await initAdmin();

    if (process.env.RUN_INITIAL_SETUP === "true") {
      try {
        const InitialSetup = require(path.join(__dirname, "./scripts/initialSetup"));
        const initialSetup = new InitialSetup();
        await initialSetup.initialize();
        console.log("✅ Setup inicial completado");
      } catch (setupError) {
        console.error("❌ Error en initialSetup:", setupError.message);
      }
    }

    // Rutas de autenticación (públicas)
    app.use("/api/auth", require("./routes/authRoutes"));

    // Rutas de próceres (públicas para lectura, protegidas para escritura)
    app.use("/api/proceres", require("./routes/procerRoutes"));

    // Rutas de realidad aumentada (protegidas)
    app.use("/api/ar/models", authMiddleware.authenticate, require("./routes/arModelRoutes"));
    app.use("/api/ar/scenes", authMiddleware.authenticate, require("./routes/sceneRoutes"));

    // Rutas de usuarios (protegidas y con control de roles)
    app.use("/api/users", 
      authMiddleware.authenticate, 
      authMiddleware.checkRole(['admin']), 
      require("./routes/userRoutes"));

    // Rutas de assets (protegidas)
    app.use("/api/assets", 
      authMiddleware.authenticate, 
      require("./routes/assetRoutes"));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📚 Documentación API disponible en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error crítico al iniciar:", err);
    process.exit(1);
  }
};

startServer();