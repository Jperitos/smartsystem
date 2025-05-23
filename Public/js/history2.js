async function loadActivityLogs(filterDate = null) {
  try {
    console.log('Fetching activity logs...');
    const response = await fetch('/api/activity-logs');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Activity logs fetched:', data);

    const table = document.querySelector('#activityTableBody');
    if (!table) {
      console.error('Activity logs table not found');
      return;
    }

    table.innerHTML = '';

    if (!data || data.length === 0) {
      table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">No activity logs found</td></tr>';
      return;
    }

    // Sort by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter by relevant statuses
    let filteredData = data.filter(log => {
      const status = (log.status || '').toLowerCase();
      return ['pending', 'assigned', 'inprogress'].includes(status);
    });

    // Filter by date if a date is provided
    if (filterDate) {
      filteredData = filteredData.filter(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0];
        return logDate === filterDate;
      });
    }

    if (filteredData.length === 0) {
      table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">No matching activity logs found</td></tr>';
      return;
    }

    function formatTime(timeStr) {
      if (!timeStr) return 'N/A';
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = ((h + 11) % 12) + 1;
      return `${hour12}:${minutes} ${ampm}`;
    }

    function capitalize(str) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'Pending';
    }

    let collectionIdCounter = 1001;

    filteredData.forEach(log => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.textContent = collectionIdCounter++;
      tr.appendChild(tdId);

      const tdBin = document.createElement('td');
      tdBin.textContent = log.bin_id?.bin_code || `Bin ${log.bin_id?._id?.slice(-3) || 'N/A'}`;
      tr.appendChild(tdBin);

      const tdFloor = document.createElement('td');
      tdFloor.textContent = log.floor ? `Floor ${log.floor}` : (log.bin_id?.location || 'N/A');
      tr.appendChild(tdFloor);

      const tdStaff = document.createElement('td');
      tdStaff.textContent = log.u_id?.name || 'N/A';
      tr.appendChild(tdStaff);

      const tdDate = document.createElement('td');
      const date = log.date ? new Date(log.date) : null;
      tdDate.textContent = date ? date.toLocaleDateString('en-US') : 'N/A';
      tr.appendChild(tdDate);

      const tdTime = document.createElement('td');
      tdTime.textContent = formatTime(log.start_time || log.time);
      tr.appendChild(tdTime);

      const tdStatus = document.createElement('td');
      const statusText = capitalize(log.status);
      tdStatus.textContent = statusText;

      if ((log.status || '').toLowerCase() === 'assigned') {
        tdStatus.style.color = '#3A7D44';
      }

      tr.appendChild(tdStatus);

      table.appendChild(tr);
    });

    console.log(`Loaded ${filteredData.length} activity logs`);
  } catch (error) {
    console.error('Error loading activity logs:', error);
    const table = document.querySelector('#activityTableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading activity logs. Please try again.</td></tr>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadActivityLogs(); // Initial load

  const dateInput = document.getElementById('activityDateFilter');
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      const selectedDate = dateInput.value;
      loadActivityLogs(selectedDate);
    });
  }
});
