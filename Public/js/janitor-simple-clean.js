// Simple Janitor Bin Monitoring
console.log('Simple Janitor Bin Monitoring Loaded');

const BINS = ['bin1', 'bin2', 'bin3'];
const UPDATE_INTERVAL = 3000; // 3 seconds

let isRunning = false;
let updateTimer = null;

// Start when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Starting bin monitoring...');
  startMonitoring();
});

function startMonitoring() {
  if (isRunning) return;
  
  isRunning = true;
  
  // First update
  updateBins();
  
  // Set interval for updates
  updateTimer = setInterval(updateBins, UPDATE_INTERVAL);
  
  console.log('Monitoring started');
}

function stopMonitoring() {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
  isRunning = false;
  console.log('Monitoring stopped');
}

async function updateBins() {
  try {
    showStatus('Updating...', 'yellow');
    
    const response = await fetch('/api/latest-data');
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json();
    console.log('Data received:', data);
    
    // Update each bin
    BINS.forEach(binId => {
      updateBinCard(binId, data);
    });
    
    showStatus('Connected', 'green');
    
  } catch (error) {
    console.error('Update error:', error);
    showErrorState();
    showStatus('Error', 'red');
  }
}

function updateBinCard(binId, espData) {
  const binCard = document.querySelector(`[data-bin="${binId}"]`);
  if (!binCard) {
    console.warn('Bin card not found:', binId);
    return;
  }
  
  // Get bin data from ESP32
  const binData = espData[binId];
  
  if (!binData) {
    console.warn('No data for bin:', binId);
    showNoBinData(binCard);
    return;
  }
  
  // Calculate percentage
  const percentage = calculateBinLevel(binData);
  
  // Update display
  updateBinDisplay(binCard, percentage);
  
  console.log(`${binId}: ${percentage}%`);
}

function calculateBinLevel(binData) {
  if (!binData || typeof binData !== 'object') {
    console.warn('Invalid bin data:', binData);
    return 0;
  }
  
  const height = parseFloat(binData.height);
  const weight = parseFloat(binData.weight);
  
  if (isNaN(height) || isNaN(weight)) {
    console.warn('Invalid height or weight:', { height: binData.height, weight: binData.weight });
    return 0;
  }
  
  // Height calculation (inverted: 11cm=100%, 35cm=0%)
  let heightPercent = 0;
  if (height <= 11) {
    heightPercent = 100;
  } else if (height >= 35) {
    heightPercent = 0;
  } else {
    heightPercent = Math.round(((35 - height) / (35 - 11)) * 100);
  }
  
  // Weight calculation (0g=0%, 5000g=100%)
  let weightPercent = 0;
  if (weight >= 5000) {
    weightPercent = 100;
  } else if (weight <= 0) {
    weightPercent = 0;
  } else {
    weightPercent = Math.round((weight / 5000) * 100);
  }
  
  // Average
  const average = Math.round((heightPercent + weightPercent) / 2);
  
  console.log(`Calculation for bin: height=${height}cm (${heightPercent}%), weight=${weight}g (${weightPercent}%), average=${average}%`);
  
  // Ensure it's between 0-100
  return Math.max(0, Math.min(100, average));
}

function updateBinDisplay(binCard, percentage) {
  // Update percentage text
  const percentageSpan = binCard.querySelector('.percentage');
  if (percentageSpan) {
    percentageSpan.textContent = percentage + '%';
  }
  
  // Update progress bar
  const progressFill = binCard.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = percentage + '%';
  }
  
  // Update status text
  const statusText = binCard.querySelector('.bin-status-text');
  if (statusText) {
    const now = new Date();
    statusText.textContent = `Updated ${now.toLocaleTimeString()}`;
  }
  
  // Update colors
  const colorClass = getColorClass(percentage);
  binCard.className = `bin-card ${colorClass}`;
}

function getColorClass(percentage) {
  if (percentage >= 80) return 'red';
  if (percentage >= 50) return 'yellow';
  return 'green';
}

function showNoBinData(binCard) {
  const percentageSpan = binCard.querySelector('.percentage');
  if (percentageSpan) {
    percentageSpan.textContent = 'N/A';
  }
  
  const progressFill = binCard.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = '0%';
  }
  
  const statusText = binCard.querySelector('.bin-status-text');
  if (statusText) {
    statusText.textContent = 'No data';
  }
  
  binCard.className = 'bin-card';
}

function showErrorState() {
  BINS.forEach(binId => {
    const binCard = document.querySelector(`[data-bin="${binId}"]`);
    if (binCard) {
      const percentageSpan = binCard.querySelector('.percentage');
      if (percentageSpan) {
        percentageSpan.textContent = 'ERROR';
      }
      
      const statusText = binCard.querySelector('.bin-status-text');
      if (statusText) {
        statusText.textContent = 'Connection error';
      }
      
      binCard.className = 'bin-card red';
    }
  });
}

function showStatus(message, color) {
  let indicator = document.getElementById('bin-connection-status');
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'bin-connection-status';
    document.body.appendChild(indicator);
  }
  
  indicator.textContent = message;
  indicator.style.background = getStatusColor(color);
  indicator.style.color = 'white';
  indicator.style.opacity = '1';
  
  // Hide success message after 2 seconds
  if (color === 'green') {
    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }
}

function getStatusColor(color) {
  switch(color) {
    case 'green': return '#28a745';
    case 'yellow': return '#ffc107';
    case 'red': return '#dc3545';
    default: return '#6c757d';
  }
}

// Stop monitoring when page is hidden
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    stopMonitoring();
  } else if (!isRunning) {
    startMonitoring();
  }
});

// Export for debugging
window.binMonitoring = {
  start: startMonitoring,
  stop: stopMonitoring,
  updateNow: updateBins,
  isRunning: () => isRunning
}; 