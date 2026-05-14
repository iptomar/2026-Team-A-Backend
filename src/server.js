require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const formRoutes = require("./routes/forms");

const app = express();

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:2026/team_a_db";

mongoose
  .connect(mongoURI)
  .then(() => console.log("Conectado ao MongoDB com sucesso!"))
  .catch((err) => {
    console.error("Erro ao ligar ao MongoDB:", err.message);
    process.exit(1);
  });

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);

app.get("/", (req, res) => {
  res.send("Backend Online - 2026 Team A com MongoDB");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
