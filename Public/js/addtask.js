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

    // Filter janitors assigned to selected floor
    const filteredStaff = staffList.filter(staff => {
      const assignArea = staff.assign_area || "";
      const assignedFloorNum = getFloorNumber(assignArea);
      return assignedFloorNum === floorNumber;
    });

    const staffSelect = document.getElementById('staffSelect');
    staffSelect.innerHTML = ''; // clear previous options

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

    document.getElementById('message').value = '';
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

let endTimeInterval = null;
async function openAssignModal(binId) {
  try {
    const binRes = await fetch(`/api/bin/${binId}`);
    if (!binRes.ok) throw new Error('Failed to fetch bin info');
    const bin = await binRes.json();

    document.getElementById('binLevelSpan').textContent = bin.bin_level ?? '-';
    document.getElementById('floorSpan').textContent = bin.floor ?? '-';

    const modal = document.getElementById('binModal');
    modal.dataset.currentBinId = binId;


    loadStaffList(String(bin.floor));


    const logRes = await fetch(`/api/activity-log/latest?bin_id=${binId}`);
    let startTime = new Date();
    if (logRes.ok) {
      const logData = await logRes.json();
      if (logData && logData.date && logData.time) {
        startTime = new Date(logData.date + 'T' + logData.time);
      }
    }

    document.getElementById('startTimeDisplay').textContent = formatTime(startTime);

    if (endTimeInterval) clearInterval(endTimeInterval);

    endTimeInterval = setInterval(() => {
      document.getElementById('endTimeDisplay').textContent = formatTime(new Date());
    }, 1000);

    modal.style.display = 'block';
  } catch (error) {
    console.error(error);
  }
}

function formatTime(date) {
  return date.toTimeString().split(' ')[0];
}

document.addEventListener('DOMContentLoaded', () => {
  const floorDropdown = document.querySelector('.floor-dropdown');
  const floorHeader = document.querySelector('.content-right h3');
  const floorImage = document.querySelector('.content-left img');

  loadStaffList("1");
  floorHeader.textContent = 'Floor 1';
  floorImage.src = '/image/Floor Plan 1.png';

  floorDropdown.addEventListener('change', () => {
    const selectedFloor = floorDropdown.value;
    floorHeader.textContent = `Floor ${selectedFloor}`;
    floorImage.src = `/image/Floor Plan ${selectedFloor}.png`;
    loadStaffList(selectedFloor);
  });

  document.getElementById('saveAssignmentBtn').addEventListener('click', saveAssignment);

  document.querySelector('#binModal .close').addEventListener('click', () => {
    document.getElementById('binModal').style.display = 'none';
  });

  window.addEventListener('click', event => {
    const modal = document.getElementById('binModal');
    if (event.target === modal) modal.style.display = 'none';
  });

  document.querySelectorAll('.bin-info-card').forEach(card => {
    card.addEventListener('click', () => {
      const binCode = card.id;
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
