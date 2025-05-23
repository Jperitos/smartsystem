// Admin Real-time Bin Monitoring
console.log('Admin Real-time Bin Monitoring Loaded');

const ADMIN_BINS = ['bin1', 'bin2', 'bin3'];
const ADMIN_UPDATE_INTERVAL = 3000; // 3 seconds

let adminMonitoringActive = false;
let adminUpdateTimer = null;

// Start monitoring when dashboard panel is active
document.addEventListener('DOMContentLoaded', function() {
  console.log('Starting admin bin monitoring...');
  
  // Check if we're on the dashboard panel
  const dashboardPanel = document.getElementById('dashboard');
  if (dashboardPanel && dashboardPanel.classList.contains('active')) {
    startAdminMonitoring();
  }
  
  // Listen for menu changes to start/stop monitoring
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      if (target === 'dashboard') {
        setTimeout(() => startAdminMonitoring(), 100);
      } else {
        stopAdminMonitoring();
      }
    });
  });
});

function startAdminMonitoring() {
  if (adminMonitoringActive) return;
  
  // Check if bin status container exists
  const binStatus = document.getElementById('admin-bin-status');
  if (!binStatus) {
    console.warn('Admin bin status container not found');
    return;
  }
  
  adminMonitoringActive = true;
  
  // First update
  updateAdminBins();
  
  // Set interval for updates
  adminUpdateTimer = setInterval(updateAdminBins, ADMIN_UPDATE_INTERVAL);
  
  console.log('Admin monitoring started');
}

function stopAdminMonitoring() {
  if (adminUpdateTimer) {
    clearInterval(adminUpdateTimer);
    adminUpdateTimer = null;
  }
  adminMonitoringActive = false;
  console.log('Admin monitoring stopped');
}

async function updateAdminBins() {
  try {
    showAdminStatus('Updating...', 'yellow');
    
    const response = await fetch('/api/latest-data');
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json();
    console.log('Admin - ESP32 data received:', data);
    
    // Update each bin
    ADMIN_BINS.forEach(binId => {
      updateAdminBinItem(binId, data);
    });
    
    showAdminStatus('Connected', 'green');
    
  } catch (error) {
    console.error('Admin update error:', error);
    showAdminErrorState();
    showAdminStatus('Error', 'red');
  }
}

function updateAdminBinItem(binId, espData) {
  const binItem = document.querySelector(`[data-bin="${binId}"]`);
  if (!binItem) {
    console.warn('Admin bin item not found:', binId);
    return;
  }
  
  // Get bin data from ESP32
  const binData = espData[binId];
  
  if (!binData) {
    console.warn('No data for admin bin:', binId);
    showAdminNoBinData(binItem);
    return;
  }
  
  // Calculate percentage using same formulas as janitor
  const percentage = calculateAdminBinLevel(binData);
  
  // Update display
  updateAdminBinDisplay(binItem, percentage);
  
  console.log(`Admin ${binId}: ${percentage}%`);
}

function calculateAdminBinLevel(binData) {
  if (!binData || typeof binData !== 'object') {
    console.warn('Invalid admin bin data:', binData);
    return 0;
  }
  
  const height = parseFloat(binData.height);
  const weight = parseFloat(binData.weight);
  
  if (isNaN(height) || isNaN(weight)) {
    console.warn('Invalid admin height or weight:', { height: binData.height, weight: binData.weight });
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
  
  console.log(`Admin calculation for bin: height=${height}cm (${heightPercent}%), weight=${weight}g (${weightPercent}%), average=${average}%`);
  
  // Ensure it's between 0-100
  return Math.max(0, Math.min(100, average));
}

function updateAdminBinDisplay(binItem, percentage) {
  // Update percentage text
  const progressSpan = binItem.querySelector('.progress');
  if (progressSpan) {
    progressSpan.textContent = percentage + '%';
    progressSpan.setAttribute('data-progress', percentage);
  }
  
  // Update progress bar
  const progressBar = binItem.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.style.width = percentage + '%';
    
    // Update color classes based on percentage
    const colorClass = getAdminColorClass(percentage);
    progressBar.className = `progress-bar progress-${colorClass}`;
    
    // Update span color class too
    if (progressSpan) {
      progressSpan.className = `progress ${colorClass}`;
    }
  }
  
  // Update last update time
  const lastUpdate = binItem.querySelector('.last-update');
  if (lastUpdate) {
    const now = new Date();
    lastUpdate.textContent = `Updated ${now.toLocaleTimeString()}`;
  }
}

function getAdminColorClass(percentage) {
  if (percentage >= 85) return 'red';      // Full/Critical
  if (percentage >= 50) return 'yellow';   // Medium/Warning  
  return 'green';                          // Low/OK
}

function showAdminNoBinData(binItem) {
  const progressSpan = binItem.querySelector('.progress');
  if (progressSpan) {
    progressSpan.textContent = 'N/A';
    progressSpan.className = 'progress gray';
  }
  
  const progressBar = binItem.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.style.width = '0%';
    progressBar.className = 'progress-bar progress-gray';
  }
  
  const lastUpdate = binItem.querySelector('.last-update');
  if (lastUpdate) {
    lastUpdate.textContent = 'No data available';
  }
}

function showAdminErrorState() {
  ADMIN_BINS.forEach(binId => {
    const binItem = document.querySelector(`[data-bin="${binId}"]`);
    if (binItem) {
      const progressSpan = binItem.querySelector('.progress');
      if (progressSpan) {
        progressSpan.textContent = 'ERROR';
        progressSpan.className = 'progress red';
      }
      
      const lastUpdate = binItem.querySelector('.last-update');
      if (lastUpdate) {
        lastUpdate.textContent = 'Connection error';
      }
    }
  });
}

function showAdminStatus(message, color) {
  let indicator = document.getElementById('admin-bin-connection-status');
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'admin-bin-connection-status';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      z-index: 1000;
      transition: opacity 0.3s ease;
      opacity: 0;
      color: white;
    `;
    document.body.appendChild(indicator);
  }
  
  indicator.textContent = message;
  indicator.style.background = getAdminStatusColor(color);
  indicator.style.opacity = '1';
  
  // Hide success message after 2 seconds
  if (color === 'green') {
    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }
}

function getAdminStatusColor(color) {
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
    stopAdminMonitoring();
  } else if (!adminMonitoringActive) {
    const dashboardPanel = document.getElementById('dashboard');
    if (dashboardPanel && dashboardPanel.classList.contains('active')) {
      startAdminMonitoring();
    }
  }
});

// Export for debugging
window.adminBinMonitoring = {
  start: startAdminMonitoring,
  stop: stopAdminMonitoring,
  updateNow: updateAdminBins,
  isActive: () => adminMonitoringActive
}; 