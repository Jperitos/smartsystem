// Staff Dashboard Real-time ESP32 Integration
// Handles live bin data updates with correct calculation formulas

// Global variables
let isESP32Connected = false;
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

// Update bin display with real-time data
function updateBinDisplay(binNumber, data) {
  if (!data) return;
  
  const heightPercent = calculateHeightPercentage(data.height);
  const weightPercent = calculateWeightPercentage(data.weight);
  const averagePercent = calculateAveragePercentage(heightPercent, weightPercent);
  
  console.log(`📊 Bin ${binNumber} calculations:`, {
    rawHeight: data.height + 'cm',
    rawWeight: data.weight + 'g',
    heightPercent: heightPercent + '%',
    weightPercent: weightPercent + '%',
    averagePercent: averagePercent + '%'
  });
  
  // Update height display
  const heightElement = document.getElementById(`s1bin${binNumber}-height`);
  if (heightElement) {
    heightElement.textContent = `${data.height}cm (${heightPercent}%)`;
  }
  
  // Update weight display  
  const weightElement = document.getElementById(`s1bin${binNumber}-weight`);
  if (weightElement) {
    weightElement.textContent = `${data.weight}g (${weightPercent}%)`;
  }
  
  // Update average display
  const avgElement = document.getElementById(`s1bin${binNumber}-avg`);
  if (avgElement) {
    avgElement.textContent = `${averagePercent}%`;
  }
  
  // Update progress bar
  const barElement = document.getElementById(`s1bin${binNumber}-bar`);
  if (barElement) {
    barElement.style.width = `${averagePercent}%`;
    
    // Update color based on fill level
    const cardElement = document.getElementById(`S1Bin${binNumber}`);
    if (cardElement) {
      // Remove existing classes
      cardElement.classList.remove('bin-empty', 'bin-warning', 'bin-full');
      
      if (averagePercent >= 85) {
        cardElement.classList.add('bin-full');
      } else if (averagePercent >= 50) {
        cardElement.classList.add('bin-warning');
      } else {
        cardElement.classList.add('bin-empty');
      }
    }
  }
  
  // Update dashboard overview progress indicators
  updateDashboardProgress(binNumber, averagePercent);
}

// Update the main dashboard progress indicators
function updateDashboardProgress(binNumber, percentage) {
  const progressElements = document.querySelectorAll(`[data-bin="S1Bin${binNumber}"]`);
  
  progressElements.forEach(element => {
    if (element.classList.contains('progress')) {
      element.textContent = `${percentage}%`;
      
      // Update color classes
      element.classList.remove('green', 'yellow', 'red');
      
      if (percentage >= 85) {
        element.classList.add('red');
      } else if (percentage >= 50) {
        element.classList.add('yellow');
      } else {
        element.classList.add('green');
      }
    }
  });
  
  // Update progress bars in dashboard
  const progressBars = document.querySelectorAll('.progress-bar');
  progressBars.forEach(bar => {
    const parentLink = bar.closest(`[data-bin="S1Bin${binNumber}"]`);
    if (parentLink) {
      bar.style.width = `${percentage}%`;
      
      // Update progress bar colors
      bar.classList.remove('progress-green', 'progress-yellow', 'progress-red');
      
      if (percentage >= 85) {
        bar.classList.add('progress-red');
      } else if (percentage >= 50) {
        bar.classList.add('progress-yellow');
      } else {
        bar.classList.add('progress-green');
      }
    }
  });
}

// Fetch real-time ESP32 data
async function fetchESP32Data() {
  try {
    console.log('🌐 Staff Dashboard: Fetching ESP32 data...');
    
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
    console.log('📦 Staff Dashboard ESP32 Data:', data);
    
    // Check if server is offline
    if (data.message && (data.message.includes("offline") || data.message.includes("timeout"))) {
      console.warn('⚠️ ESP32 server is offline');
      isESP32Connected = false;
      retryCount++;
      return null;
    }
    
    // Mark as connected and reset retry count
    isESP32Connected = true;
    retryCount = 0;
    
    // Update bin displays with correct calculations
    if (data.bin1) {
      updateBinDisplay(1, data.bin1);
    }
    if (data.bin2) {
      updateBinDisplay(2, data.bin2);
    }
    if (data.bin3) {
      updateBinDisplay(3, data.bin3);
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Staff Dashboard ESP32 fetch error:', error);
    isESP32Connected = false;
    retryCount++;
    
    if (retryCount <= maxRetries) {
      console.log(`🔄 Retry ${retryCount}/${maxRetries} in 5 seconds...`);
    } else {
      console.log('💔 Max retries reached, ESP32 marked as offline');
      // Show offline indicators
      showOfflineStatus();
    }
    
    return null;
  }
}

// Show offline status in UI
function showOfflineStatus() {
  const binIds = [1, 2, 3];
  
  binIds.forEach(binNumber => {
    const heightElement = document.getElementById(`s1bin${binNumber}-height`);
    const weightElement = document.getElementById(`s1bin${binNumber}-weight`);
    const avgElement = document.getElementById(`s1bin${binNumber}-avg`);
    
    if (heightElement) heightElement.textContent = 'Offline';
    if (weightElement) weightElement.textContent = 'Offline';
    if (avgElement) avgElement.textContent = 'Offline';
    
    // Reset progress bars
    const barElement = document.getElementById(`s1bin${binNumber}-bar`);
    if (barElement) {
      barElement.style.width = '0%';
    }
  });
}

// Initialize staff dashboard real-time functionality
function initializeStaffDashboardRealtime() {
  console.log('🚀 Initializing Staff Dashboard Real-time ESP32 Integration...');
  console.log('📏 Height calculation: 11cm=100%, 35cm=0% (inverted)');
  console.log('⚖️ Weight calculation: 5000g=100%');
  console.log('📊 Average: (Height% + Weight%) / 2');
  
  // Initial data fetch
  fetchESP32Data();
  
  // Set up periodic updates every 3 seconds for responsive real-time data
  const updateInterval = setInterval(fetchESP32Data, 3000);
  
  console.log('⏰ Real-time updates started (every 3 seconds)');
  
  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('👁️ Page visible, refreshing ESP32 data...');
      fetchESP32Data();
    }
  });
  
  console.log('✅ Staff Dashboard Real-time integration ready');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeStaffDashboardRealtime);

// Also handle window load for compatibility
window.addEventListener('load', () => {
  // Add a small delay to ensure all elements are rendered
  setTimeout(initializeStaffDashboardRealtime, 1000);
}); 