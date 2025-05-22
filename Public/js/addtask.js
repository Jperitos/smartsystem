// Helper: Map assign_area floor names ("First floor" → "1", etc.)
function getFloorNumber(assignArea) {
  if (!assignArea) return null;
  const floorMap = {
    'First floor': '1',
    'Second floor': '2',
    'Third floor': '3',
    'Fourth floor': '4',
    'Fifth floor': '5',
    'Sixth floor': '6'
  };
  return floorMap[assignArea] || (assignArea.match(/\d+/) ? assignArea.match(/\d+/)[0] : null);
}

// Load janitors assigned to a specific floor into the staffSelect dropdown
async function loadStaffList(floorNumber = "1") {
  try {
    const response = await fetch('/api/staff');
    if (!response.ok) throw new Error('Failed to fetch staff list');
    const staffList = await response.json();

    const filteredStaff = staffList.filter(staff => {
      const assignArea = staff.assign_area || "";
      const assignedFloorNum = getFloorNumber(assignArea);
      return assignedFloorNum === floorNumber;
    });

    const staffSelect = document.getElementById('staffSelect');
    staffSelect.innerHTML = '';

    filteredStaff.forEach(staff => {
      const option = document.createElement('option');
      option.value = staff._id;
      option.textContent = staff.name;
      staffSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load staff:', error);
  }
}

async function saveAssignment() {
  const modal = document.getElementById('binModal');
  const binId = modal.dataset.currentBinId;
  const staffId = document.getElementById('staffSelect').value;
  const taskMessage = document.getElementById('message').value.trim();

  const binLevelRaw = document.getElementById('binLevelSpan').textContent;
  const floorRaw = document.getElementById('floorSpan').textContent.replace('Floor ', '');
  const binLevel = isNaN(Number(binLevelRaw)) ? null : Number(binLevelRaw);
  const floor = isNaN(Number(floorRaw)) ? null : Number(floorRaw);

  if (!binId || !staffId) {
    alert('Please select a bin and a staff member.');
    return;
  }

  const now = new Date();

  const payload = {
    bin_id: binId,
    u_id: staffId,
    bin_level: binLevel,
    floor: floor,
    assigned_task: taskMessage,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().split(' ')[0],
    status: 'assigned'
  };

  try {
    const res = await fetch('/api/activity-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to save assignment');

    alert('Assignment saved successfully!');
    modal.style.display = 'none';
    document.getElementById('message').value = '';
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Format Date object to 12-hour time with AM/PM
function formatTimeAMPM(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;

  const strMinutes = minutes.toString().padStart(2, '0');
  const strSeconds = seconds.toString().padStart(2, '0');

  return `${hours}:${strMinutes}:${strSeconds} ${ampm}`;
}

let endTimeInterval = null;

function setStartTime(date) {
  const startTimeDisplay = document.getElementById('startTimeDisplay');
  if (startTimeDisplay) {
    startTimeDisplay.textContent = formatTimeAMPM(date);
  }
}

function startEndTimeLive() {
  if (endTimeInterval) clearInterval(endTimeInterval);
  endTimeInterval = setInterval(() => {
    const endTimeDisplay = document.getElementById('endTimeDisplay');
    if (endTimeDisplay) {
      endTimeDisplay.textContent = formatTimeAMPM(new Date());
    }
  }, 1000);
}

async function openAssignModal(binId) {
  try {
    const binRes = await fetch(`/api/bin/${binId}`);
    if (!binRes.ok) throw new Error('Failed to fetch bin info');
    const bin = await binRes.json();

    const floorDropdown = document.querySelector('.floor-dropdown');
    const selectedFloor = floorDropdown ? floorDropdown.value : (bin.floor ?? '1');

    // Update modal display fields
    document.getElementById('binLevelSpan').textContent = bin.bin_level ?? '-';
    document.getElementById('floorSpan').textContent = `Floor ${selectedFloor}`;

    const modal = document.getElementById('binModal');
    modal.dataset.currentBinId = binId;

    // Load staff list filtered by floor
    await loadStaffList(selectedFloor);

    // Load latest assignment start time if exists
    const logRes = await fetch(`/api/activity-log/latest?bin_id=${binId}`);
    let startTime = new Date();
    if (logRes.ok) {
      const logData = await logRes.json();
      if (logData && logData.date && logData.time) {
        startTime = new Date(logData.date + 'T' + logData.time);
      }
    }

    setStartTime(startTime);
    startEndTimeLive();

    modal.style.display = 'flex';
  } catch (error) {
    console.error(error);
    alert('Error loading bin data.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const floorDropdown = document.querySelector('.floor-dropdown');
  const floorHeader = document.querySelector('.content-right h3');
  const floorImage = document.querySelector('.content-left img');

  // Initialize page with floor 1 data
  loadStaffList("1");
  floorHeader.textContent = 'Floor 1';
  floorImage.src = '/image/Floor Plan 1.png';

  // Floor dropdown change handler
  floorDropdown.addEventListener('change', () => {
    const selectedFloor = floorDropdown.value;
    floorHeader.textContent = `Floor ${selectedFloor}`;
    floorImage.src = `/image/Floor Plan ${selectedFloor}.png`;
    loadStaffList(selectedFloor);
  });

  // Save button event
  document.getElementById('saveAssignmentBtn').addEventListener('click', saveAssignment);

  // Modal close button
  document.querySelector('#binModal .close').addEventListener('click', () => {
    document.getElementById('binModal').style.display = 'none';
  });

  // Close modal on outside click
  window.addEventListener('click', event => {
    const modal = document.getElementById('binModal');
    if (event.target === modal) modal.style.display = 'none';
  });

  console.log('Setting up bin card click handlers...');
  
  // Make bin cards clickable - ensure this runs after DOM is ready
  const binCards = document.querySelectorAll('.bin-info-card');
  console.log('Found bin cards:', binCards.length);
  
  binCards.forEach(card => {
    card.addEventListener('click', function() {
      console.log('Bin card clicked:', this.id);
      const binCode = this.id; // bin ID like S1Bin1
      
      // Extract bin data from the card
      const binDetails = this.querySelector('.bin-details');
      // Properly extract bin level data from the card
      const binAvgSpan = this.querySelector('[id$="-avg"]');
      const binAvg = binAvgSpan ? binAvgSpan.textContent.trim() : '-';
      
      // Get floor number from dataset attribute
      const floorNumber = binDetails.dataset.floor || '1';
      
      // Set modal data
      document.getElementById('binLevelSpan').textContent = binAvg;
      document.getElementById('floorSpan').textContent = `Floor ${floorNumber}`;
      document.getElementById('modal-title').textContent = `Details for ${binCode}`;
      
      // Show the modal
      const modal = document.getElementById('binModal');
      if (modal) {
        // Reset any position styles that might be interfering
        modal.style.position = 'fixed';
        // Set display to flex for proper centering
        modal.style.display = 'flex';
        modal.dataset.currentBinId = binCode;
      }
      
      // Load staff for this floor
      loadStaffList(floorNumber);
    });
    
    // Make the card visually appear clickable
    card.style.cursor = 'pointer';
  });
});

// Clock in the modal (if you want a live clock somewhere)
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;

  const strMinutes = minutes.toString().padStart(2, '0');
  const strSeconds = seconds.toString().padStart(2, '0');

  const timeString = `${hours}:${strMinutes}:${strSeconds} ${ampm}`;
  const clockElem = document.getElementById('clock');
  if(clockElem) clockElem.textContent = timeString;
}

updateClock();
setInterval(updateClock, 1000);
