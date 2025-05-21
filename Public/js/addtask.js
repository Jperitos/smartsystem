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
  document.getElementById('startTimeDisplay').textContent = formatTimeAMPM(date);
}

function startEndTimeLive() {
  if (endTimeInterval) clearInterval(endTimeInterval);
  endTimeInterval = setInterval(() => {
    document.getElementById('endTimeDisplay').textContent = formatTimeAMPM(new Date());
  }, 1000);
}

async function openAssignModal(binId) {
  try {
    const binRes = await fetch(`/api/bin/${binId}`);
    if (!binRes.ok) throw new Error('Failed to fetch bin info');
    const bin = await binRes.json();

    const floorDropdown = document.querySelector('.floor-dropdown');
    const selectedFloor = floorDropdown ? floorDropdown.value : (bin.floor ?? '-');

    document.getElementById('binLevelSpan').textContent = bin.bin_level ?? '-';
    document.getElementById('floorSpan').textContent = selectedFloor;

    const modal = document.getElementById('binModal');
    modal.dataset.currentBinId = binId;

    loadStaffList(selectedFloor);

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

    modal.style.display = 'block';
  } catch (error) {
    console.error(error);
  }
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

    function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Pad minutes and seconds with leading zeros
  const strMinutes = minutes.toString().padStart(2, '0');
  const strSeconds = seconds.toString().padStart(2, '0');

  const timeString = `${hours}:${strMinutes}:${strSeconds} ${ampm}`;
  document.getElementById('clock').textContent = timeString;
}

updateClock();
setInterval(updateClock, 1000);