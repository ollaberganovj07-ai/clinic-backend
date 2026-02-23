require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTE ULASH
app.use("/api/users", userRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log("FILE IS RUNNING");
  console.log(`Server ${PORT} portda ishlayapti`);
});