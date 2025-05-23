// DISABLED: WebSocket connection for dynamic sensor data
// The system now uses static bin level data from activity logs for notifications

console.log('SensorData: Using static bin level data from database for notifications');

// WebSocket connection for real-time updates
const ws = new WebSocket(`ws://${window.location.hostname}:9001`);

// WebSocket event handlers
ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateBinDisplays(data);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
        window.location.reload();
    }, 5000);
};

function getHeightPercentage(heightCm) {
    const minHeight = 35;
    const maxHeight = 11;
    if (typeof heightCm !== 'number') return 0;
    if (heightCm <= maxHeight) return 100;
    if (heightCm >= minHeight) return 0;
    return Math.round(((minHeight - heightCm) / (minHeight - maxHeight)) * 100);
}

function getWeightPercentage(weightG) {
    const maxWeight = 5000;
    if (typeof weightG !== 'number') return 0;
    if (weightG >= maxWeight) return 100;
    if (weightG <= 0) return 0;
    return Math.round((weightG / maxWeight) * 100);
}

// Function to update bin displays
function updateBinDisplays(data) {
    // Update each bin's data
    for (const binKey in data) {
        if (binKey === 'timestamp') continue;
        
        const binData = data[binKey];
        const binId = `S1Bin${binKey.slice(-1)}`; // Convert bin1, bin2, bin3 to S1Bin1, S1Bin2, S1Bin3
        
        // Calculate percentages
        const heightPct = getHeightPercentage(binData.height);
        const weightPct = getWeightPercentage(binData.weight);
        const avgPct = ((heightPct + weightPct) / 2).toFixed(1);

        // Update average
        const avgElement = document.getElementById(`${binId.toLowerCase()}-avg`);
        if (avgElement) {
            avgElement.textContent = `${avgPct}%`;
        }
        
        // Update height
        const heightElement = document.getElementById(`${binId.toLowerCase()}-height`);
        if (heightElement) {
            heightElement.textContent = `${binData.height.toFixed(1)}cm (${heightPct}%)`;
        }
        
        // Update weight
        const weightElement = document.getElementById(`${binId.toLowerCase()}-weight`);
        if (weightElement) {
            weightElement.textContent = `${binData.weight.toFixed(1)}g (${weightPct}%)`;
        }
        
        // Update bin card color based on fill level (using calculated average)
        const binCard = document.getElementById(binId);
        if (binCard) {
            // Remove existing color classes
            binCard.classList.remove('bin-empty', 'bin-warning', 'bin-full');
            
            // Add appropriate color class based on average fill level
            if (avgPct >= 90) {
                binCard.classList.add('bin-full');
            } else if (avgPct >= 70) {
                binCard.classList.add('bin-warning');
            } else {
                binCard.classList.add('bin-empty');
            }
        }

        // Animate bin level bar
        const barElement = document.getElementById(`${binId.toLowerCase()}-bar`);
        if (barElement) {
            barElement.style.width = `${avgPct}%`;
        }
    }
}

// Initial data fetch
fetch('/api/latest-data')
    .then(response => response.json())
    .then(data => {
        if (data && !data.message) {
            updateBinDisplays(data);
        }
    })
    .catch(error => console.error('Error fetching initial data:', error));

// Add CSS styles for bin status colors
const style = document.createElement('style');
style.textContent = `
    .bin-info-card {
        transition: all 0.3s ease;
    }
    
    .bin-empty {
        border-left: 4px solid #4caf50;
    }
    
    .bin-warning {
        border-left: 4px solid #ff9800;
    }
    
    .bin-full {
        border-left: 4px solid #f44336;
    }
    
    .bin-row {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
    }
    
    .bin-details {
        padding: 10px;
    }
    
    .bin-details strong {
        font-size: 1.1em;
        color: #333;
    }
`;
document.head.appendChild(style);

// Function to handle floor changes
function updateFloorData(floorNumber) {
    console.log(`🔄 Updating floor data to floor ${floorNumber}`);
    // Update floor title
    document.getElementById('floorTitle').textContent = `Floor ${floorNumber}`;
    
    // Update bin IDs and data-floor attributes
    const bins = ['S1Bin1', 'S1Bin2', 'S1Bin3'];
    bins.forEach((binId, index) => {
        const newBinId = `S${floorNumber}Bin${index + 1}`;
        const binElement = document.getElementById(binId);
        if (binElement) {
            binElement.id = newBinId;
            binElement.querySelector('.bin-details').setAttribute('data-floor', floorNumber);
            console.log(`✅ Updated bin ID from ${binId} to ${newBinId}`);
        } else {
            console.warn(`⚠️ Could not find bin element ${binId}`);
        }
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing bin monitoring system...');
    fetchInitialData();
    connectWebSocket();

    // Add event listener for floor changes
    const floorSelect = document.getElementById('floors');
    if (floorSelect) {
        floorSelect.addEventListener('change', (e) => {
            updateFloorData(e.target.value);
        });
        console.log('✅ Floor change listener added');
    } else {
        console.warn('⚠️ Could not find floor select element');
    }
});
