
// Connect to your backend WebSocket server (adjust host/port as needed)
const ws = new WebSocket('ws://localhost:9001');



  

  // sensordata.js


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

// Function to update DOM elements for a bin
function updateBinData(binId, binData) {
  if (!binData) return;

  // Select the bin card by binId - make sure these IDs exist in your HTML
  const binCard = document.querySelector(`.bin-info-card strong:contains(${binId.toUpperCase()})`)?.parentElement;

  // Alternative: add ids to your bin info cards for easier targeting
  // e.g. <div class="bin-info-card" id="s1bin1-card"> ... </div>

  // For a robust way, let’s just select by ID for now:
  const card = document.getElementById(`${binId}-card`);
  if (!card) return;

  // Update Bin Weight, Height, Average inside the card — adjust selectors based on your markup
  card.querySelector('.bin-weight').textContent = `Bin Weight: ${binData.weight.toFixed(1)}%`;
  card.querySelector('.bin-height').textContent = `Bin Height: ${binData.height}%`;
  card.querySelector('.bin-average').textContent = `Bin Average: ${binData.avg.toFixed(1)}%`;
}



function updateProgressBars(data) {
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
  }
