const express = require("express");
const path = require("path"); 
const connectDB = require("./config/db");
const initAdmin = require("./config/initialAdmin");
const authMiddleware = require("./middlewares/auth");
const cors = require("cors"); // Añade esta línea

// Cargar modelos
require("./models/User");
require("./models/Asset");
require("./models/Scene");
require("./models/Procer");
require(path.join(__dirname, "./models/ARModel"));

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());

// Añade esta ruta básica
app.get("/", (req, res) => {
  res.json({
    status: "API funcionando",
    endpoints: {
      auth: "/api/auth",
      ar: "/api/ar"
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
    app.use("/api/ar", authMiddleware.authenticate, require("./routes/arRoutes"));

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