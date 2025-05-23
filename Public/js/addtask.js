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
  console.log('SAVE ASSIGNMENT FUNCTION CALLED');
  
  try {
    const modal = document.getElementById('binModal');
    if (!modal) {
      console.error('Modal element not found');
      return;
    }
    
    const binId = modal.dataset.currentBinId;
    console.log('Bin ID:', binId);
    
    const staffSelect = document.getElementById('staffSelect');
    if (!staffSelect) {
      console.error('Staff select element not found');
      return;
    }
    
    const staffId = staffSelect.value;
    console.log('Staff ID:', staffId);
    
    const messageEl = document.getElementById('message');
    if (!messageEl) {
      console.error('Message element not found');
      return;
    }
    
    const taskMessage = messageEl.value.trim();
    console.log('Task message:', taskMessage);

    const binLevelSpan = document.getElementById('binLevelSpan');
    if (!binLevelSpan) {
      console.error('Bin level span not found');
      return;
    }
    
    const binLevelRaw = binLevelSpan.textContent;
    console.log('Bin level raw:', binLevelRaw);
    
    const floorSpan = document.getElementById('floorSpan');
    if (!floorSpan) {
      console.error('Floor span not found');
      return;
    }
    
    const floorRaw = floorSpan.textContent.replace('Floor ', '');
    console.log('Floor raw:', floorRaw);
    
    const binLevel = isNaN(Number(binLevelRaw)) ? null : Number(binLevelRaw);
    const floor = isNaN(Number(floorRaw)) ? null : Number(floorRaw);
    console.log('Parsed bin level:', binLevel);
    console.log('Parsed floor:', floor);

    if (!binId || !staffId) {
      alert('Please select a bin and a staff member.');
      return;
    }

    // Disable save button while processing
    const saveBtn = document.getElementById('saveAssignmentBtn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    const now = new Date();
    console.log('Current date/time:', now);

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
    
    console.log('Payload to send:', payload);

    console.log('About to fetch from /api/activity-logs');
    const res = await fetch('/api/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    console.log('Fetch response status:', res.status);

    if (!res.ok) {
      console.error('Response not OK:', res.status, res.statusText);
      throw new Error('Failed to save assignment: ' + res.status);
    }

    console.log('Assignment saved successfully');
    
    // Show success message inside the modal
    const successMsg = document.getElementById('success-message');
    if (successMsg) {
      // Update the success message to include bin level info from assignment
      const binLevelText = binLevel !== null ? `${binLevel}%` : 'N/A';
      successMsg.innerHTML = `Assignment saved successfully!<br><small>Notification sent to staff about ${binId} on Floor ${floor}<br>Bin Level: ${binLevelText}</small>`;
      successMsg.style.display = 'block';
      
      // Close modal and reset form after a short delay
      setTimeout(() => {
        modal.style.display = 'none';
        if (messageEl) messageEl.value = '';
        if (successMsg) successMsg.style.display = 'none'; // Hide message for next time
      }, 2000); // Increased to 2 seconds to show notification message
    } else {
      // Fallback if success message element not found
      const binLevelText = binLevel !== null ? `${binLevel}%` : 'N/A';
      alert(`Assignment saved successfully and notification sent to staff!\n\nBin: ${binId}\nFloor: ${floor}\nBin Level: ${binLevelText}\nTask: ${taskMessage || 'Empty and clean the bin'}`);
      modal.style.display = 'none';
      if (messageEl) messageEl.value = '';
    }
    
    // Refresh the activity logs table with new data if function exists
    if (typeof window.refreshActivityLogs === 'function') {
      window.refreshActivityLogs();
    }
    
  } catch (error) {
    console.error('Error in saveAssignment function:', error);
    alert('Error: ' + error.message);
  } finally {
    // Re-enable save button
    const saveBtn = document.getElementById('saveAssignmentBtn');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Assignment';
    }
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
  if (floorHeader) floorHeader.textContent = 'Floor 1';
  if (floorImage) floorImage.src = '/image/Floor Plan 1.png';

  // Floor dropdown change handler
  if (floorDropdown) {
    floorDropdown.addEventListener('change', () => {
      const selectedFloor = floorDropdown.value;
      if (floorHeader) floorHeader.textContent = `Floor ${selectedFloor}`;
      if (floorImage) floorImage.src = `/image/Floor Plan ${selectedFloor}.png`;
      loadStaffList(selectedFloor);
    });
  }

  // Explicitly attach event listener to Save Assignment button
  const saveBtn = document.getElementById('saveAssignmentBtn');
  if (saveBtn) {
    console.log('Attaching click event to Save Assignment button');
    saveBtn.addEventListener('click', function(event) {
      event.preventDefault();
      console.log('Save Assignment button clicked');
      saveAssignment();
    });
  } else {
    console.error('Save Assignment button not found in DOM on page load');
  }

  // Modal close button
  const closeBtn = document.querySelector('#binModal .close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('binModal').style.display = 'none';
    });
  }

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

        // Make sure success message is hidden
        const successMsg = document.getElementById('success-message');
        if (successMsg) {
          successMsg.style.display = 'none';
        }

        // Ensure Save Assignment button has its event listener
        const saveBtn = document.getElementById('saveAssignmentBtn');
        if (saveBtn) {
          // Remove existing listeners to avoid duplicates
          const newSaveBtn = saveBtn.cloneNode(true);
          saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
          
          // Add fresh event listener
          newSaveBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Save Assignment button clicked from modal');
            saveAssignment();
          });
        }
      }
      
      // Load staff for this floor
      loadStaffList(floorNumber);
    });
    
    // Make the card visually appear clickable
    card.style.cursor = 'pointer';
  });

  // Set up clock
  updateClock();
  setInterval(updateClock, 1000);
});

// Function to update clock display
function updateClock() {
  const clockElement = document.getElementById('clock');
  if (clockElement) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Format time with AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    clockElement.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
  }
}
