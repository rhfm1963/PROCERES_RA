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

// Ruta raíz que muestra todos los endpoints disponibles
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
        create: "POST /api/proceres (requiere admin)"
      },
      ar: {
        models: {
          list: "GET /api/ar/models",
          create: "POST /api/ar/models (requiere autenticación)"
        },
        scenes: {
          list: "GET /api/ar/scenes",
          create: "POST /api/ar/scenes (requiere autenticación)"
        }
      },
      assets: {
        list: "GET /api/assets",
        upload: "POST /api/assets (requiere autenticación)"
      },
      users: {
        list: "GET /api/users (requiere admin)",
        detail: "GET /api/users/:id (requiere admin)"
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

    // Rutas API
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/proceres", require("./routes/procerRoutes"));
    app.use("/api/ar/models", authMiddleware.authenticate, require("./routes/arModelRoutes"));
    app.use("/api/ar/scenes", authMiddleware.authenticate, require("./routes/sceneRoutes"));
    app.use("/api/assets", authMiddleware.authenticate, require("./routes/assetRoutes"));
    app.use("/api/users", authMiddleware.authenticate, authMiddleware.checkRole(['admin']), require("./routes/userRoutes"));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error crítico al iniciar:", err);
    process.exit(1);
  }
};

startServer();