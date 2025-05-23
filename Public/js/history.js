// Function specifically for Overview dashboard table (6 columns)
async function loadOverviewCompletedLogs() {
  try {
    console.log('Fetching completed activity logs for overview...');
    const response = await fetch('/api/activity-logs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Overview activity logs fetched:', data);
    
    const table = document.querySelector('#tableBody');
    if (!table) {
      console.error('Overview table body not found');
      return;
    }
    
    table.innerHTML = '';
    
    if (!data || data.length === 0) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No activity logs found</td></tr>';
      return;
    }
    
    // Sort logs by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Filter only completed/done logs
    const completedLogs = data.filter(log => {
      const status = (log.status || '').toLowerCase();
      return status === 'done' || status === 'completed';
    });

    if (completedLogs.length === 0) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No completed activity logs found</td></tr>';
      return;
    }
    
    // Helper to format time from HH:mm string to 12-hour format
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
    
    // Helper to format date and time together
    function formatDateTime(date, time) {
      if (!date) return 'N/A';
      const dateObj = new Date(date);
      const dateStr = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      const timeStr = formatTime(time);
      return `${dateStr} ${timeStr}`;
    }
    
    // Show only the most recent 10 completed logs
    const recentCompletedLogs = completedLogs.slice(0, 10);
    
    recentCompletedLogs.forEach(log => {
      const tr = document.createElement("tr");

      // Bins (Column 1)
      const tdBinCode = document.createElement("td");
      tdBinCode.textContent = log.bin_id?.bin_code || `Bin ${log.bin_id?._id?.slice(-3) || 'N/A'}`;
      tr.appendChild(tdBinCode);

      // Floor (Column 2)
      const tdFloor = document.createElement("td");
      tdFloor.textContent = log.floor ? `Floor ${log.floor}` : (log.bin_id?.location || 'N/A');
      tr.appendChild(tdFloor);

      // Staff (Column 3)
      const tdUserName = document.createElement("td");
      tdUserName.textContent = log.u_id?.name || 'N/A';
      tr.appendChild(tdUserName);

      // Start (Column 4) - Date and Start Time
      const tdStart = document.createElement("td");
      tdStart.textContent = formatDateTime(log.date, log.start_time || log.time);
      tr.appendChild(tdStart);

      // End (Column 5) - Date and End Time
      const tdEnd = document.createElement("td");
      tdEnd.textContent = formatDateTime(log.completion_date || log.date, log.end_time);
      tr.appendChild(tdEnd);

      // Status (Column 6) - Button with green styling for completed
      const tdStatus = document.createElement("td");
      const statusButton = document.createElement("button");
      statusButton.className = 'status-done';
      statusButton.textContent = 'Done';
      statusButton.style.backgroundColor = '#4caf50';
      statusButton.style.color = 'white';
      statusButton.style.border = 'none';
      statusButton.style.padding = '4px 12px';
      statusButton.style.borderRadius = '4px';
      statusButton.style.fontSize = '12px';
      statusButton.style.fontWeight = 'bold';
      statusButton.style.cursor = 'default';
      tdStatus.appendChild(statusButton);
      tr.appendChild(tdStatus);

      table.appendChild(tr);
    });
    
    console.log(`Loaded ${recentCompletedLogs.length} completed activity logs for overview successfully`);
    
  } catch (error) {
    console.error('Error loading overview completed logs:', error);
    const table = document.querySelector('#tableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading completed logs. Please try again.</td></tr>';
    }
  }
}

// Original function for Collection table (7 columns) - Updated to fix column count
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
      table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">No activity logs found</td></tr>';
      return;
    }
    
    // Sort logs by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Show all activity logs with status-based color coding
    const filteredData = data;

    if (filteredData.length === 0) {
      table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">No activity logs found</td></tr>';
      return;
    }
    
    // Helper to format time from HH:mm string to 12-hour format
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
    
    // Helper to get status color
    function getStatusColor(status) {
      const statusLower = (status || '').toLowerCase();
      switch (statusLower) {
        case 'completed':
        case 'done':
          return '#4caf50'; // Green
        case 'inprogress':
        case 'in-progress':
          return '#2196f3'; // Blue
        case 'assigned':
          return '#ff9800'; // Orange
        case 'pending':
          return '#9c27b0'; // Purple
        default:
          return '#666666'; // Gray
      }
    }
    
    // Helper to capitalize first letter and lowercase the rest
    function capitalizeFirstLetter(str) {
      if (!str) return 'Pending';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    let binIdCounter = 1001; // Start Collection ID from 1001
    
    filteredData.forEach(log => {
      const tr = document.createElement("tr");

      // Collection ID - incrementing from 1001
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

      // Staff Name
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

      // Status with color coding (no End Time to match 7-column structure)
      const tdStatus = document.createElement("td");
      const statusSpan = document.createElement("span");
      statusSpan.style.color = getStatusColor(log.status);
      statusSpan.style.fontWeight = 'bold';
      statusSpan.textContent = capitalizeFirstLetter(log.status);
      tdStatus.appendChild(statusSpan);
      tr.appendChild(tdStatus);

      table.appendChild(tr);
    });
    
    console.log(`Loaded ${filteredData.length} activity logs successfully`);
    
  } catch (error) {
    console.error('Error loading activity logs:', error);
    const table = document.querySelector('#activityTableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading activity logs. Please try again.</td></tr>';
    }
  }
}

// History logs
async function loadHistoryLogs() {
  try {
    console.log('Fetching history logs...');
    const response = await fetch('/api/history-logs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('History logs fetched:', data);
    
    const table = document.querySelector('#historyTableBody');
    if (!table) {
      console.error('History logs table not found');
      return;
    }
    
    table.innerHTML = '';
    
    if (!data || data.length === 0) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No history logs found</td></tr>';
      return;
    }
    
    // Sort logs by date (newest first)
    data.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    data.forEach((log, index) => {
      const tr = document.createElement("tr");

      // History ID
      const tdId = document.createElement("td");
      tdId.textContent = index + 1;
      tr.appendChild(tdId);

      // User Name (Email)
      const tdUserName = document.createElement("td");
      tdUserName.textContent = log.user_name || log.user_id?.email || 'N/A';
      tr.appendChild(tdUserName);

      // Status (Role)
      const tdStatus = document.createElement("td");
      tdStatus.textContent = log.user_status || log.user_id?.u_role || 'N/A';
      tr.appendChild(tdStatus);

      // Time In
      const tdTimeIn = document.createElement("td");
      if (log.time_in) {
        const timeIn = new Date(log.time_in);
        tdTimeIn.textContent = timeIn.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        tdTimeIn.textContent = 'N/A';
      }
      tr.appendChild(tdTimeIn);

      // Time Out
      const tdTimeOut = document.createElement("td");
      if (log.time_out) {
        const timeOut = new Date(log.time_out);
        tdTimeOut.textContent = timeOut.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        tdTimeOut.textContent = 'N/A';
      }
      tr.appendChild(tdTimeOut);

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

      table.appendChild(tr);
    });
    
    console.log(`Loaded ${data.length} history logs successfully`);
    
  } catch (error) {
    console.error('Error loading history logs:', error);
    const table = document.querySelector('#historyTableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading history logs. Please try again.</td></tr>';
    }
  }
}

// Initialize the logs when the page loadsdocument.addEventListener('DOMContentLoaded', function() {  console.log('Page loaded, initializing activity and history logs...');    // Load logs immediately if the tables exist  if (document.querySelector('#activityTableBody')) {    loadActivityLogs();  }    // Only load history logs if the historyTableBody exists (admin.ejs only)  if (document.querySelector('#historyTableBody')) {    loadHistoryLogs();  }    // Add event listeners for menu items to load logs when panels are activated  document.querySelectorAll('.menu-item').forEach(item => {    item.addEventListener('click', function() {      const target = this.getAttribute('data-target');            // Small delay to ensure panel is visible before loading data      setTimeout(() => {        // Activity logs can be loaded from activity-logs panel or staffs panel (Collection)        if (target === 'activity-logs' || target === 'history' || target === 'staffs') {          if (document.querySelector('#activityTableBody')) {            loadActivityLogs();          }        }        // History logs only for admin.ejs (history-logs panel or activity panel)        if (target === 'history-logs' || target === 'activity') {          if (document.querySelector('#historyTableBody')) {            loadHistoryLogs();          }        }      }, 100);    });  });    // Set up auto-refresh every 30 seconds  setInterval(() => {    // Only refresh if the panels are visible    const activePanel = document.querySelector('.content-panel.active');    if (activePanel) {      const panelId = activePanel.id;      // Auto-refresh activity logs for activity-logs, history, or staffs panels      if (panelId === 'activity-logs' || panelId === 'history' || panelId === 'staffs') {        if (document.querySelector('#activityTableBody')) {          loadActivityLogs();        }      }      // Auto-refresh history logs only for admin.ejs panels      if (panelId === 'history-logs' || panelId === 'activity') {        if (document.querySelector('#historyTableBody')) {          loadHistoryLogs();        }      }    }  }, 30000);
  
  // Add event listeners for manual refresh buttons
  const refreshActivityBtn = document.getElementById('refreshActivityLogs');
  const refreshHistoryBtn = document.getElementById('refreshHistoryLogs');
  
  if (refreshActivityBtn) {
    refreshActivityBtn.addEventListener('click', () => {
      console.log('Manual refresh of activity logs triggered');
      loadActivityLogs();
    });
  }
  
  if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', () => {
      console.log('Manual refresh of history logs triggered');
      loadHistoryLogs();
    });
  }
  
  // Add event listeners for existing refresh buttons (backward compatibility)
  const refreshButtons = document.querySelectorAll('.refresh-btn, .refresh-activity');
  refreshButtons.forEach(button => {
    if (button.id !== 'refreshActivityLogs' && button.id !== 'refreshHistoryLogs') {
      button.addEventListener('click', () => {
        if (document.querySelector('#activityTableBody')) {
          loadActivityLogs();
        }
        if (document.querySelector('#historyTableBody')) {
          loadHistoryLogs();
        }
      });
    }
  });
});

// Add date filtering functionality
document.addEventListener('DOMContentLoaded', function() {
  const activityDateFilter = document.getElementById('activityDateFilter');
  const historyDateFilter = document.getElementById('historyDateFilter');
  
  if (activityDateFilter) {
    activityDateFilter.addEventListener('change', function() {
      filterActivityLogsByDate(this.value);
    });
  }
  
  if (historyDateFilter) {
    historyDateFilter.addEventListener('change', function() {
      filterHistoryLogsByDate(this.value);
    });
  }
});

function filterActivityLogsByDate(dateValue) {
  const table = document.querySelector('#activityTableBody');
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    if (row.cells.length < 4) return; // Skip empty or error rows
    
    const rowDate = row.cells[3].textContent; // Date is in 4th column
    if (!dateValue || rowDate.includes(new Date(dateValue).toLocaleDateString())) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function filterHistoryLogsByDate(dateValue) {
  const table = document.querySelector('#historyTableBody');
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    if (row.cells.length < 6) return; // Skip empty or error rows
    
    const rowDate = row.cells[5].textContent; // Date is in 6th column
    if (!dateValue || rowDate.includes(new Date(dateValue).toLocaleDateString())) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}
