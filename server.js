// server.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const PORT_HTTP = 9000;
const PORT_WS = 9001;

// Enable CORS and JSON parsing for HTTP server
app.use(cors());
app.use(express.json());

// In-memory store for latest processed bin data
let latestBinData = null;

// Map raw distance (cm) to height % (0% empty at maxDistance, 100% full at minDistance)
function getHeightPercentage(distance) {
  const minDistance = 11;
  const maxDistance = 35;

  if (distance === null || distance === undefined) return 0;
  if (distance <= minDistance) return 100;
  if (distance >= maxDistance) return 0;

  return Math.round(((maxDistance - distance) / (maxDistance - minDistance)) * 100);
}

// Calculate weight % capped at 100%
function getWeightPercentage(weight) {
  const maxWeight = 150; // kg
  if (typeof weight !== 'number' || weight <= 0) return 0;
  return Math.min((weight / maxWeight) * 100, 100);
}

// HTTP test route
app.get('/', (req, res) => {
  res.send('🟢 Bin Monitoring Backend is running.');
});

// HTTP API route to get latest processed bin data
app.get('/api/latest-data', (req, res) => {
  if (latestBinData) {
    res.json(latestBinData);
  } else {
    res.json({ message: "No data received yet" });
  }
});

// Start HTTP server
app.listen(PORT_HTTP, () => {
  console.log(`🚀 HTTP API running at http://localhost:${PORT_HTTP}`);
});

// Start WebSocket server for ESP32
const wss = new WebSocket.Server({ port: PORT_WS }, () => {
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT_WS}`);
});

wss.on('connection', (ws) => {
  console.log('✅ ESP32 connected via WebSocket');

  ws.on('message', (message) => {
    const msgStr = message.toString();
    console.log('📥 Raw data received from ESP32:\n', msgStr);

    try {
      const data = JSON.parse(msgStr);

      // Basic validation of expected structure
      const isValidPayload =
        data?.bin1 && data?.bin2 && data?.bin3 &&
        typeof data.bin1.weight === 'number' &&
        typeof data.bin1.height === 'number' &&
        typeof data.bin2.weight === 'number' &&
        typeof data.bin2.height === 'number' &&
        typeof data.bin3.weight === 'number' &&
        typeof data.bin3.height === 'number';

      if (!isValidPayload) {
        console.warn("⚠️ Invalid payload structure or missing fields");
        return;
      }

      // Process each bin: convert raw height (distance) to height %, calculate weight %, and avg %
      function processBin(bin) {
        const weightPct = getWeightPercentage(bin.weight);
        const heightPct = getHeightPercentage(bin.height);
        const avg = (weightPct + heightPct) / 2;
        return {
          weight: bin.weight,
          weightPct,
          height: bin.height,
          heightPct,
          avg,
        };
      }

      const processedBin1 = processBin(data.bin1);
      const processedBin2 = processBin(data.bin2);
      const processedBin3 = processBin(data.bin3);

      latestBinData = {
        bin1: processedBin1,
        bin2: processedBin2,
        bin3: processedBin3,
        timestamp: new Date().toISOString(),
      };

      // Log processed bin data
      console.log("\n===== BIN STATUS RECEIVED =====");
      ['bin1', 'bin2', 'bin3'].forEach((binKey) => {
        const b = latestBinData[binKey];
        console.log(
          `${binKey.toUpperCase()} -> Weight: ${b.weight.toFixed(2)} kg (${b.weightPct.toFixed(1)}%) | Height: ${b.height} cm (${b.heightPct}%) | Avg: ${b.avg.toFixed(1)}%`
        );
      });
      console.log("================================\n");

    } catch (err) {
      console.error('❌ Failed to parse incoming JSON:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('❌ ESP32 disconnected from WebSocket');
  });
});
