// Display Dashboard Real-time Bin Monitoring
// Dedicated JavaScript for display.ejs page

// Global variables
let connectionStatusDiv;
let isConnectedToESP32 = false;
let retryCount = 0;
const maxRetries = 5;

// Calculation constants based on user specifications
const HEIGHT_CALCULATIONS = {
  FULL_HEIGHT: 11,    // 100% = 11cm (shortest distance = fullest bin)
  EMPTY_HEIGHT: 35,   // 0% = 35cm (longest distance = emptiest bin)
};

const WEIGHT_CALCULATIONS = {
  MAX_WEIGHT: 5000    // 100% = 5000 grams
};

// Calculate height percentage (inverted: shorter distance = higher percentage)
function calculateHeightPercentage(heightCm) {
  if (heightCm <= HEIGHT_CALCULATIONS.FULL_HEIGHT) return 100;
  if (heightCm >= HEIGHT_CALCULATIONS.EMPTY_HEIGHT) return 0;
  
  // Inverted calculation: shorter distance = higher fill level
  const range = HEIGHT_CALCULATIONS.EMPTY_HEIGHT - HEIGHT_CALCULATIONS.FULL_HEIGHT;
  const position = HEIGHT_CALCULATIONS.EMPTY_HEIGHT - heightCm;
  return Math.round((position / range) * 100);
}

// Calculate weight percentage
function calculateWeightPercentage(weightGrams) {
  if (weightGrams <= 0) return 0;
  if (weightGrams >= WEIGHT_CALCULATIONS.MAX_WEIGHT) return 100;
  
  return Math.round((weightGrams / WEIGHT_CALCULATIONS.MAX_WEIGHT) * 100);
}

// Calculate average as specified: (Height% + Weight%) / 2
function calculateAveragePercentage(heightPercent, weightPercent) {
  return Math.round((heightPercent + weightPercent) / 2);
}

// Floor selection functionality
let floorSelect, floorImage, floorTitle;

// Initialize DOM elements when page loads
function initializeElements() {
  connectionStatusDiv = document.getElementById('connectionStatus');
  floorSelect = document.getElementById('floorSelect');
  floorImage = document.getElementById('floorImage');
  floorTitle = document.getElementById('floorTitle');
  
  if (floorSelect) {
    floorSelect.addEventListener('change', function () {
      const selectedFloor = this.value;
      // Properly encode the URL to handle spaces in filename
      floorImage.src = `/image/Floor%20Plan%20${selectedFloor}.png`;
      floorTitle.textContent = `Floor ${selectedFloor}`;
      
      // Reset image display in case it was hidden due to error
      floorImage.style.display = 'block';
      floorImage.nextElementSibling.style.display = 'none';
      
      // Update bin names based on floor
      updateBinNames(selectedFloor);
    });
  }
}

function updateBinNames(floor) {
  const binNames = document.querySelectorAll('.bin-name');
  const binTypes = ['Biodegradable', 'Non-Biodegradable', 'Food Waste'];
  binNames.forEach((binName, index) => {
    binName.textContent = `S${floor}Bin${index + 1} (${binTypes[index]})`;
  });
}

function updateConnectionStatus(status, message) {
  if (connectionStatusDiv) {
    connectionStatusDiv.className = `connection-status ${status}`;
    connectionStatusDiv.textContent = message;
    console.log(`🔗 Connection Status: ${status} - ${message}`);
  }
}

function updateBinStatus(binId, percentage, weight, height) {
  const percentageElement = document.getElementById(`${binId}-percentage`);
  const progressElement = document.getElementById(`${binId}-progress`);
  
  console.log(`📊 Updating ${binId}: ${percentage}% (Weight: ${weight}kg, Height: ${height}cm)`);
  
  if (percentageElement && progressElement) {
    percentageElement.textContent = `${percentage}%`;
    progressElement.style.width = `${percentage}%`;
    
    // Update color classes based on percentage
    percentageElement.className = 'bin-percentage';
    progressElement.className = 'progress-bar';
    
    if (percentage < 50) {
      percentageElement.classList.add('low');
      progressElement.classList.add('progress-green');
    } else if (percentage < 85) {
      percentageElement.classList.add('medium');
      progressElement.classList.add('progress-yellow');
    } else {
      percentageElement.classList.add('high');
      progressElement.classList.add('progress-red');
    }
  }
  
  // Update last updated timestamp
  const lastUpdatedEl = document.getElementById('lastUpdated');
  if (lastUpdatedEl) {
    lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  }
}

// Fetch real-time data from ESP32 server via proxy
async function fetchESP32Data() {
  try {
    updateConnectionStatus('connecting', 'Connecting to ESP32...');
    
    // Use the proxy endpoint (same port as the main app) to avoid CORS issues
    console.log('🌐 Fetching ESP32 data via proxy...');
    const response = await fetch('/api/latest-data', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📦 ESP32 Data received:', data);
    
    // Check if the server is offline or no data
    if (data.message && (data.message.includes("server offline") || data.message === "No data received yet" || data.message.includes("timeout"))) {
      updateConnectionStatus('disconnected', data.message);
      return null;
    }

    // Update connection status
    updateConnectionStatus('connected', 'ESP32 Connected');
    isConnectedToESP32 = true;
    retryCount = 0;

    // Update bin statuses with correctly calculated data
    if (data.bin1) {
      const heightPercent = calculateHeightPercentage(data.bin1.height);
      const weightPercent = calculateWeightPercentage(data.bin1.weight);
      const averagePercent = calculateAveragePercentage(heightPercent, weightPercent);
      console.log(`📊 Bin1 calculations: H=${data.bin1.height}cm (${heightPercent}%), W=${data.bin1.weight}g (${weightPercent}%), Avg=${averagePercent}%`);
      updateBinStatus('bin1', averagePercent, data.bin1.weight, data.bin1.height);
    }
    if (data.bin2) {
      const heightPercent = calculateHeightPercentage(data.bin2.height);
      const weightPercent = calculateWeightPercentage(data.bin2.weight);
      const averagePercent = calculateAveragePercentage(heightPercent, weightPercent);
      console.log(`📊 Bin2 calculations: H=${data.bin2.height}cm (${heightPercent}%), W=${data.bin2.weight}g (${weightPercent}%), Avg=${averagePercent}%`);
      updateBinStatus('bin2', averagePercent, data.bin2.weight, data.bin2.height);
    }
    if (data.bin3) {
      const heightPercent = calculateHeightPercentage(data.bin3.height);
      const weightPercent = calculateWeightPercentage(data.bin3.weight);
      const averagePercent = calculateAveragePercentage(heightPercent, weightPercent);
      console.log(`📊 Bin3 calculations: H=${data.bin3.height}cm (${heightPercent}%), W=${data.bin3.weight}g (${weightPercent}%), Avg=${averagePercent}%`);
      updateBinStatus('bin3', averagePercent, data.bin3.weight, data.bin3.height);
    }

    return data;

  } catch (error) {
    console.error('❌ Error fetching ESP32 data:', error);
    isConnectedToESP32 = false;
    retryCount++;
    
    if (retryCount <= maxRetries) {
      updateConnectionStatus('disconnected', `Connection failed (retry ${retryCount}/${maxRetries})`);
      console.log(`🔄 Retry ${retryCount}/${maxRetries} in 5 seconds...`);
    } else {
      updateConnectionStatus('disconnected', 'ESP32 Server offline');
      console.log('💔 Max retries reached, marking as offline');
    }
    
    return null;
  }
}

async function fetchBinData() {
  try {
    const response = await fetch('/api/bin-data');
    const data = await response.json();

    const tbody = document.querySelector('#binTable tbody');
    if (tbody) {
      tbody.innerHTML = ''; // Clear existing rows

      data.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML = `
          <td>${item.data_id}</td>
          <td>${new Date(item.timestamp).toLocaleString()}</td>
          <td>${item.height ?? ''}</td>
          <td>${item.weight ?? ''}</td>
          <td>${item.type}</td>
          <td>${item.fillLevel.toFixed(1)}</td>
          <td>${item.fullbin_time ? new Date(item.fullbin_time).toLocaleString() : ''}</td>
        `;

        tbody.appendChild(row);
      });
      
      console.log(`📋 Loaded ${data.length} bin records to table`);
    }

  } catch (err) {
    console.error('❌ Error fetching bin data:', err);
  }
}

// Notifications logic
async function fetchNotifications() {
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const notifications = await res.json();

    const notifContainer = document.getElementById('notifications-list');
    if (notifContainer) {
      if (notifications.length === 0) {
        notifContainer.innerHTML = '<p>No notifications</p>';
        return;
      }

      notifContainer.innerHTML = notifications.map(notif => `
        <div class="notification">
          <strong>${notif.notif_type}</strong><br>
          <small>${new Date(notif.created_at).toLocaleString()}</small>
          <p>${notif.message}</p>
          <small><em>Bin: ${notif.bin_id?.bin_code || 'Unknown'}</em></small>
        </div>
      `).join('');
      
      console.log(`🔔 Loaded ${notifications.length} notifications`);
    }
  } catch (error) {
    const notifContainer = document.getElementById('notifications-list');
    if (notifContainer) {
      notifContainer.innerHTML = `<p style="color:red;">Failed to load notifications</p>`;
    }
    console.error('❌ Error fetching notifications:', error);
  }
}

// Socket.io setup for real-time notifications
function setupSocket() {
  if (typeof io !== 'undefined') {
    const socket = io();

    socket.on('connect', () => {
      console.log('🔌 Connected to notification server');
    });

    socket.on('pushNotification', (data) => {
      console.log('🔔 Notification received:', data);

      const notifContainer = document.getElementById('notifications-list');
      if (notifContainer) {
        const notifElement = document.createElement('div');
        notifElement.classList.add('notification');
        notifElement.innerHTML = `
          <strong>${data.notif_type || 'Notification'}</strong><br>
          <small>${new Date(data.created_at || Date.now()).toLocaleString()}</small>
          <p>${data.message}</p>
          <small><em>Bin: ${data.bin_code || 'Unknown'}</em></small>
        `;

        notifContainer.prepend(notifElement);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
    });
  }
}

// Initialize the dashboard
async function initializeDashboard() {
  console.log('🚀 Initializing Smart Bin Dashboard...');
  console.log('📏 Height calculation: 11cm=100%, 35cm=0% (inverted)');
  console.log('⚖️ Weight calculation: 5000g=100%');
  console.log('📊 Average: (Height% + Weight%) / 2');
  
  // Initialize DOM elements
  initializeElements();
  
  // Initial data fetch
  console.log('📊 Loading initial data...');
  await fetchBinData();
  await fetchNotifications();
  
  // First ESP32 data fetch
  console.log('🔌 Connecting to ESP32...');
  await fetchESP32Data();
  
  // Set up real-time socket
  setupSocket();
  
  // Set up periodic updates with more aggressive polling for ESP32 data
  const esp32Interval = setInterval(fetchESP32Data, 3000); // ESP32 data every 3 seconds
  const binDataInterval = setInterval(fetchBinData, 30000);  // Database data every 30 seconds
  
  console.log('⏰ Set up periodic updates - ESP32: 3s, DB: 30s');
  console.log('✅ Dashboard initialized successfully');
  
  // Add visibility change listener to resume polling when tab becomes active
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('👁️ Tab became visible, refreshing data...');
      fetchESP32Data();
    }
  });
}

// Start the dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Also handle the old window.onload event for compatibility
window.addEventListener('load', () => {
  console.log('🖼️ Page loaded, testing image path:', floorImage?.src);
}); 