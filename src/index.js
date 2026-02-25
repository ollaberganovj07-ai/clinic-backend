require("dotenv").config();

const express = require("express");
const cors = require("cors");

const userRoutes = require("./modules/users/users.routes");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTE ULASH
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portda ishlayapti`);
});