require("dotenv").config();


const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "MONGO_URI = mongodb+srv://jamesarpilang04:KnCcxkCLH8KVIBy4@cluster0.yammk.mongodb.net/authExample?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// ✅ MongoDB Schema
const binSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  bin1: { weight: Number, height: Number, avg: Number },
  bin2: { weight: Number, height: Number, avg: Number },
  bin3: { weight: Number, height: Number, avg: Number },
});
const BinLive = mongoose.model("BinLive", binSchema);

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ WebSocket Client Connection
io.on("connection", (socket) => {
  console.log("📡 Dashboard client connected");
});

// ✅ Health Check Route
app.get("/api/ping", (req, res) => {
  
  res.send("pong 🏓");
  res.json({ message: "ESP32 data server running 🏓" });
});

// ✅ POST from ESP32
app.post("/api/upload-sensor-data", async (req, res) => {
  try {
    console.log("Incoming ESP32 Data:", req.body);

    const newEntry = new BinLive(req.body);
    await newEntry.save();

    io.emit("newData", req.body); // Broadcast to live dashboards

    res.status(200).json({ message: "Data stored in MongoDB" });
  } catch (err) {
    console.error("Failed to store data:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

// ✅ Start Server
const PORT = 9000;
server.listen(PORT, () => {
  console.log(`ESP Data Server listening at http://localhost:${PORT}`);
});
