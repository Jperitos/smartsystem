document.addEventListener('DOMContentLoaded', () => {
  loadStaffList();

  // Attach event listener for save button
  document.getElementById('saveAssignmentBtn').addEventListener('click', saveAssignment);

  // Attach event listener for modal close (×)
  document.querySelector('#binModal .close').addEventListener('click', () => {
    document.getElementById('binModal').style.display = 'none';
  });

  // Optional: Close modal on clicking outside modal content
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('binModal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Attach click handlers to bin cards to open modal
  document.querySelectorAll('.bin-info-card').forEach(card => {
    card.addEventListener('click', () => {
      const binCode = card.id; // e.g., 'S1Bin1'

      // TODO: Replace this mapping with your actual bin IDs from DB
      const binIdMapping = {
        'S1Bin1': 'mongodbBinId1',
        'S1Bin2': 'mongodbBinId2',
        'S1Bin3': 'mongodbBinId3',
      };

      const binId = binIdMapping[binCode];
      if (!binId) {
        alert('Bin ID not found for ' + binCode);
        return;
      }

      openAssignModal(binId);
    });
  });
});

async function saveAssignment() {
  const modal = document.getElementById('binModal');
  const binId = modal.dataset.currentBinId;
  const staffId = document.getElementById('staffSelect').value;
  const taskMessage = document.getElementById('message').value.trim();

  const binLevelRaw = document.getElementById('binLevelSpan').textContent;
  const floorRaw = document.getElementById('floorSpan').textContent;
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
    date: now.toISOString().slice(0, 10), // YYYY-MM-DD
    time: now.toTimeString().split(' ')[0], // HH:MM:SS
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

    // Optionally clear task message after saving
    document.getElementById('message').value = '';
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function loadStaffList() {
  try {
    const response = await fetch('/api/staff');
    if (!response.ok) throw new Error('Failed to fetch staff list');
    const staffList = await response.json();

    const staffSelect = document.getElementById('staffSelect');
    staffSelect.innerHTML = ''; // clear previous options

    staffList.forEach(staff => {
      const option = document.createElement('option');
      option.value = staff._id;
      option.textContent = staff.name;
      staffSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load staff:', error);
  }
}

let endTimeInterval = null;
async function openAssignModal(binId) {
  try {
    // Fetch bin info
    const binRes = await fetch(`/api/bin/${binId}`);
    if (!binRes.ok) throw new Error('Failed to fetch bin info');
    const bin = await binRes.json();

    document.getElementById('binLevelSpan').textContent = bin.bin_level ?? '-';
    document.getElementById('floorSpan').textContent = bin.floor ?? '-';

    const modal = document.getElementById('binModal');
    modal.dataset.currentBinId = binId;

    // Fetch latest assignment start time for this bin
    const logRes = await fetch(`/api/activity-log/latest?bin_id=${binId}`);
    let startTime = new Date();
    if (logRes.ok) {
      const logData = await logRes.json();
      if (logData && logData.date && logData.time) {
        startTime = new Date(logData.date + 'T' + logData.time);
      }
    }

    document.getElementById('startTimeDisplay').textContent = formatTime(startTime);

    // Clear previous end time interval if any
    if (endTimeInterval) clearInterval(endTimeInterval);

    // Start updating end time every second with current time
    endTimeInterval = setInterval(() => {
      document.getElementById('endTimeDisplay').textContent = formatTime(new Date());
    }, 1000);

    modal.style.display = 'block'; // Show modal
  } catch (error) {
    console.error(error);
  }
}