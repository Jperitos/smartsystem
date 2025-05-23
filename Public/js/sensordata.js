// DISABLED: WebSocket connection for dynamic sensor data
// The system now uses static bin level data from activity logs for notifications

console.log('SensorData: Using static bin level data from database for notifications');

/*
// Connect to your backend WebSocket server (adjust host/port as needed)
const ws = new WebSocket('ws://localhost:9001');

ws.onopen = () => {
  console.log('WebSocket connected to backend for real-time bin data');
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    // Update bin info on page
    updateBinData('s1bin1', data.bin1);
    updateBinData('s1bin2', data.bin2);
    updateBinData('s1bin3', data.bin3);
  } catch (err) {
    console.error('Error parsing WebSocket message:', err);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
*/

// Function to update DOM elements for a bin (kept for compatibility but not used)
function updateBinData(binId, binData) {
  // DISABLED: No longer updating dynamic sensor data
  // Static bin level data is now used for notifications from database
  console.log(`updateBinData called for ${binId} - using static data instead`);
  return;
  
  /*
  if (!binData) return;
  
  // Convert binId to uppercase format used in HTML (s1bin1 -> S1Bin1)
  const formattedBinId = binId.replace(/^s(\d+)bin(\d+)$/i, (_, floor, num) => 
    `S${floor}Bin${num}`);
  
  // Find the bin card by ID
  const binCard = document.getElementById(formattedBinId);
  if (!binCard) return;
  
  // Update spans inside this bin card with latest values
  const avgSpan = binCard.querySelector(`#${binId}-avg`);
  const heightSpan = binCard.querySelector(`#${binId}-height`);
  const weightSpan = binCard.querySelector(`#${binId}-weight`);
  
  if (avgSpan) avgSpan.textContent = `${binData.avg.toFixed(1)}`;
  if (heightSpan) heightSpan.textContent = `${binData.height}`;
  if (weightSpan) weightSpan.textContent = `${binData.weight.toFixed(1)}`;
  
  // If modal is open and showing this bin, update the values there too
  const modal = document.getElementById('binModal');
  if (modal && modal.style.display === 'block' && modal.dataset.currentBinId === formattedBinId) {
    document.getElementById('binLevelSpan').textContent = avgSpan ? avgSpan.textContent : '-';
  }
  */
}

function updateProgressBars(data) {
  // DISABLED: No longer using dynamic progress bars
  // Static bin level data is used for notifications instead
  console.log('updateProgressBars called - using static data system instead');
  return;
  
  /*
  data.forEach((sensorData) => {
    const binId = sensorData.data_id.split('_')[1];
    const fillLevel = sensorData.fillLevel;
    console.log(`Bin ${binId} - Fill Level: ${fillLevel}%`);

    const progressBar = document.querySelector(`.progress-bar[data-progress="${binId}"]`);
    const progressText = document.querySelector(`.progress-text[data-progress="${binId}"]`);

    if (progressBar && progressText) {
      progressBar.style.width = `${fillLevel}%`;
      progressText.textContent = `${fillLevel}%`;
    } else {
      console.warn(`Elements not found for binId ${binId}`);
    }
  });
  */
}

// Initialize static bin level system
document.addEventListener('DOMContentLoaded', () => {
  console.log('Static bin level notification system initialized');
});
