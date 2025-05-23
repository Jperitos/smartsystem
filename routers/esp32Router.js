const express = require('express');
const http = require('http');
const router = express.Router();

// Proxy endpoint for ESP32 real-time data
router.get('/latest-data', async (req, res) => {
  // Set CORS headers for cross-origin requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  try {
    console.log('🔌 Proxy: Fetching ESP32 data from port 9000...');
    
    // Use native http module to get data from ESP32 server
    const options = {
      hostname: 'localhost',
      port: 9000,
      path: '/api/latest-data',
      method: 'GET',
      timeout: 3000, // Reduced timeout for faster response
      headers: {
        'Accept': 'application/json'
      }
    };

    const request = http.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ ESP32 Data proxied successfully:', {
            bin1: `${jsonData.bin1?.average}%`,
            bin2: `${jsonData.bin2?.average}%`, 
            bin3: `${jsonData.bin3?.average}%`,
            timestamp: jsonData.timestamp
          });
          res.json(jsonData);
        } catch (parseErr) {
          console.error('❌ Error parsing ESP32 response:', parseErr);
          console.error('Raw response:', data);
          res.json({
            message: "ESP32 data parsing error",
            timestamp: new Date(),
            bin1: { weight: 0, height: 0, average: 0 },
            bin2: { weight: 0, height: 0, average: 0 },
            bin3: { weight: 0, height: 0, average: 0 }
          });
        }
      });
    });

    request.on('error', (err) => {
      console.error('❌ ESP32 server connection error:', err.message);
      res.json({
        message: "ESP32 server offline",
        timestamp: new Date(),
        bin1: { weight: 0, height: 0, average: 0 },
        bin2: { weight: 0, height: 0, average: 0 },
        bin3: { weight: 0, height: 0, average: 0 }
      });
    });

    request.on('timeout', () => {
      console.error('⏰ ESP32 server request timeout');
      request.destroy();
      res.json({
        message: "ESP32 server timeout",
        timestamp: new Date(),
        bin1: { weight: 0, height: 0, average: 0 },
        bin2: { weight: 0, height: 0, average: 0 },
        bin3: { weight: 0, height: 0, average: 0 }
      });
    });

    request.setTimeout(3000); // Set timeout
    request.end();
  } catch (err) {
    console.error('❌ Error in latest-data proxy endpoint:', err);
    res.status(500).json({
      message: "Internal server error",
      timestamp: new Date(),
      bin1: { weight: 0, height: 0, average: 0 },
      bin2: { weight: 0, height: 0, average: 0 },
      bin3: { weight: 0, height: 0, average: 0 }
    });
  }
});

// Add OPTIONS handler for preflight requests
router.options('/latest-data', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

module.exports = router; 