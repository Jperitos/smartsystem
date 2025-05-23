// server.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT_HTTP = 9000;
const PORT_WS = 9001;
const { saveBinData } = require('./middlewares/dbHandler');

// Import routers
const staffRouter = require('./routers/staffRouter');

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', staffRouter);

// Store latest bin data for frontend retrieval
let latestBinData = null;
const binTypes = {
  bin1: 'biodegradable',
  bin2: 'non-biodegradable',
  bin3: 'foodwaste',
};
// Get local IP address (LAN)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const ifaceName in interfaces) {
    for (const iface of interfaces[ifaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Convert distance to height percentage (0-100%)
function getHeightPercentage(distance) {
  const minDistance = 11;
  const maxDistance = 35;

  if (distance == null) return 0;
  if (distance <= minDistance) return 100;
  if (distance >= maxDistance) return 0;

  return Math.round(((maxDistance - distance) / (maxDistance - minDistance)) * 100);
}

// Convert weight to percentage capped at 100%
function getWeightPercentage(weight) {
  const maxWeight = 150; // Max kg capacity
  if (typeof weight !== 'number' || weight <= 0) return 0;
  return Math.min((weight / maxWeight) * 100, 100);
}

// HTTP endpoint - check server status
app.get('/', (req, res) => {
  res.send('🟢 Bin Monitoring Backend is running.');
});

// HTTP endpoint - latest bin data for frontend
app.get('/api/latest-data', (req, res) => {
  if (latestBinData) {
    res.json(latestBinData);
  } else {
    res.json({ message: "No data received yet" });
  }
});

// Start HTTP server
app.listen(PORT_HTTP, () => {
  console.log(`🚀 HTTP API running at http://${getLocalIP()}:${PORT_HTTP}`);
});

// Start WebSocket server on all interfaces
const wss = new WebSocket.Server({ port: PORT_WS }, () => {
  console.log(`🔌 WebSocket server running on ws://${getLocalIP()}:${PORT_WS}`);
});

// On new WebSocket connection from ESP32
wss.on('connection', (ws, req) => {
  console.log('✅ ESP32 connected via WebSocket from', req.socket.remoteAddress);

ws.on('message', async (message) => {
  const msgStr = message.toString();
  console.log('📥 Raw data received from ESP32:\n', msgStr);

  try {
    const data = JSON.parse(msgStr);

    // Validate payload structure (now expects 'average' field from Arduino)
    const isValidPayload =
      data?.bin1 && data?.bin2 && data?.bin3 &&
      typeof data.bin1.weight === 'number' &&
      typeof data.bin1.height === 'number' &&
      typeof data.bin1.average === 'number' &&
      typeof data.bin2.weight === 'number' &&
      typeof data.bin2.height === 'number' &&
      typeof data.bin2.average === 'number' &&
      typeof data.bin3.weight === 'number' &&
      typeof data.bin3.height === 'number' &&
      typeof data.bin3.average === 'number';

    if (!isValidPayload) {
      console.warn("⚠️ Invalid payload structure or missing fields");
      return;
    }

    // Assign latestBinData directly from Arduino values
    latestBinData = {
      bin1: {
        weight: data.bin1.weight,
        height: data.bin1.height,
        average: data.bin1.average
      },
      bin2: {
        weight: data.bin2.weight,
        height: data.bin2.height,
        average: data.bin2.average
      },
      bin3: {
        weight: data.bin3.weight,
        height: data.bin3.height,
        average: data.bin3.average
      },
      timestamp: new Date(),
    };

    // Log bin status for debug
    console.log("\n===== BIN STATUS RECEIVED =====");
    ['bin1', 'bin2', 'bin3'].forEach(binKey => {
      const b = latestBinData[binKey];
      console.log(
        `${binKey.toUpperCase()} -> Weight: ${b.weight} | Height: ${b.height} | Avg: ${b.average}`
      );
    });
    console.log("================================\n");

    // Save each bin's data (optional: update saveBinData to accept the new structure)
    for (const binKey of ['bin1', 'bin2', 'bin3']) {
      await saveBinData(binKey, latestBinData[binKey], binTypes[binKey]);
    }

  } catch (err) {
    console.error('❌ Failed to parse incoming JSON:', err.message);
  }
});


  ws.on('close', () => {
    console.log('❌ ESP32 disconnected from WebSocket');
  });

  ws.on('error', (err) => {
    console.error('⚠️ WebSocket error:', err.message);
  });
});
