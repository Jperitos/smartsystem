async function loadActivityLogs() {
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
      table.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">No activity logs found</td></tr>';
      return;
    }
    
    // Sort logs by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Filter only "pending-like" logs
    const filteredData = data.filter(log => {
      const status = (log.status || '').toLowerCase();
      return status === 'pending' || status === 'assigned' || status === 'inprogress';
    });

    if (filteredData.length === 0) {
      table.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">No pending activity logs found</td></tr>';
      return;
    }
    
    function formatTime(timeStr) {
      if (!timeStr) return 'N/A';
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        const hour12 = ((parseInt(hours, 10) + 11) % 12) + 1;
        const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      }
      return timeStr;
    }
    
    function capitalizeFirstLetter(str) {
      if (!str) return 'Pending';
      if (str.toLowerCase() === 'pending') return 'Pending';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    let binIdCounter = 1001;
    
    filteredData.forEach(log => {
      const tr = document.createElement("tr");

      // Collection ID
      const tdBinId = document.createElement("td");
      tdBinId.textContent = binIdCounter++;
      tr.appendChild(tdBinId);

      // Bin Code/Name
      const tdBinCode = document.createElement("td");
      tdBinCode.textContent = log.bin_id?.bin_code || `Bin ${log.bin_id?._id?.slice(-3) || 'N/A'}`;
      tr.appendChild(tdBinCode);

      // Floor
      const tdFloor = document.createElement("td");
      tdFloor.textContent = log.floor ? `Floor ${log.floor}` : (log.bin_id?.location || 'N/A');
      tr.appendChild(tdFloor);

      // Staff
      const tdUserName = document.createElement("td");
      tdUserName.textContent = log.u_id?.name || 'N/A';
      tr.appendChild(tdUserName);

      // Date
      const tdDate = document.createElement("td");
      if (log.date) {
        const date = new Date(log.date);
        tdDate.textContent = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
      } else {
        tdDate.textContent = 'N/A';
      }
      tr.appendChild(tdDate);

      // Start Time
      const tdStartTime = document.createElement("td");
      tdStartTime.textContent = formatTime(log.start_time || log.time || null);
      tr.appendChild(tdStartTime);

      // End Time
      const tdEndTime = document.createElement("td");
      tdEndTime.textContent = formatTime(log.end_time || null);
      tr.appendChild(tdEndTime);

      // Status
      const tdStatus = document.createElement("td");
      const statusSpan = document.createElement("span");
      statusSpan.style.color = 'green';
      statusSpan.textContent = capitalizeFirstLetter(log.status);
      tdStatus.appendChild(statusSpan);
      tr.appendChild(tdStatus);

      // Action
      const tdAction = document.createElement("td");
      const updateBtn = document.createElement("button");
      updateBtn.className = 'update-btn';
      updateBtn.textContent = 'Update';
      tdAction.appendChild(updateBtn);
      tr.appendChild(tdAction);

      table.appendChild(tr);
    });
    
    console.log(`Loaded ${filteredData.length} pending activity logs successfully`);
    
  } catch (error) {
    console.error('Error loading activity logs:', error);
    const table = document.querySelector('#activityTableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading activity logs. Please try again.</td></tr>';
    }
  }
}

document.addEventListener('DOMContentLoaded', loadActivityLogs);
