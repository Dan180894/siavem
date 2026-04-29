import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import vehicleRoutes from "./routes/vehiclesRoute.js";
import workshopRoutes from "./routes/workshopRoutes.js";
import tripRequestRoutes from "./routes/tripRequestRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/trip-requests", tripRequestRoutes);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SIAVEM API funcionando" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
