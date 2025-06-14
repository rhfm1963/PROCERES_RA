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

// Documentación de la API
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
        modelos: "GET /api/ar/models",
        escenas: "GET /api/ar/scenes"
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
    
    // Rutas de próceres (públicas para lectura, protegidas para escritura)
    app.use("/api/proceres", require("./routes/procerRoutes"));
    
    // Rutas de realidad aumentada (protegidas)
    app.use("/api/ar", 
      authMiddleware.authenticate, 
      require("./routes/arRoutes"));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📚 Documentación API: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error crítico al iniciar:", err);
    process.exit(1);
  }
};

startServer();