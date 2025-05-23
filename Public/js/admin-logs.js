// Admin Activity Logs Display (All Statuses with Color Coding)
async function loadAdminActivityLogs() {
  try {
    console.log('Fetching activity logs for admin panel...');
    const response = await fetch('/api/activity-logs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Admin activity logs fetched:', data);
    
    const table = document.querySelector('#activityTableBody');
    if (!table) {
      console.error('Admin activity logs table not found');
      return;
    }
    
    table.innerHTML = '';
    
    if (!data || data.length === 0) {
      table.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">No activity logs found</td></tr>';
      return;
    }
    
    // Sort logs by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Show all activity logs (not filtered by status)
    const allLogs = data;
    
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
    
    // Helper to capitalize first letter
    function capitalizeFirstLetter(str) {
      if (!str) return 'Pending';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    let binIdCounter = 1001; // Start Bin ID from 1001
    
    allLogs.forEach(log => {
      const tr = document.createElement("tr");

      // Column 1: Bin ID - incrementing from 1001
      const tdBinId = document.createElement("td");
      tdBinId.textContent = binIdCounter++;
      tr.appendChild(tdBinId);

      // Column 2: Bins (Bin Code/Name)
      const tdBinCode = document.createElement("td");
      tdBinCode.textContent = log.bin_id?.bin_code || `Bin ${log.bin_id?._id?.slice(-3) || 'N/A'}`;
      tr.appendChild(tdBinCode);

      // Column 3: Floor
      const tdFloor = document.createElement("td");
      tdFloor.textContent = log.floor ? `Floor ${log.floor}` : (log.bin_id?.location || 'N/A');
      tr.appendChild(tdFloor);

      // Column 4: Staff Name
      const tdUserName = document.createElement("td");
      tdUserName.textContent = log.u_id?.name || 'N/A';
      tr.appendChild(tdUserName);

      // Column 5: Date
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

      // Column 6: Start Time
      const tdStartTime = document.createElement("td");
      tdStartTime.textContent = formatTime(log.start_time || log.time || null);
      tr.appendChild(tdStartTime);

      // Column 7: End Time
      const tdEndTime = document.createElement("td");
      tdEndTime.textContent = formatTime(log.end_time || null);
      tr.appendChild(tdEndTime);

      // Column 8: Status with color coding
      const tdStatus = document.createElement("td");
      const statusSpan = document.createElement("span");
      statusSpan.style.color = getStatusColor(log.status);
      statusSpan.style.fontWeight = 'bold';
      statusSpan.textContent = capitalizeFirstLetter(log.status);
      tdStatus.appendChild(statusSpan);
      tr.appendChild(tdStatus);

      table.appendChild(tr);
    });
    
    console.log(`Loaded ${allLogs.length} activity logs for admin successfully`);
    
  } catch (error) {
    console.error('Error loading admin activity logs:', error);
    const table = document.querySelector('#activityTableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading activity logs. Please try again.</td></tr>';
    }
  }
}

// Admin History Logs Display
async function loadAdminHistoryLogs() {
  try {
    console.log('Fetching history logs for admin panel...');
    const response = await fetch('/api/history-logs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Admin history logs fetched:', data);
    
    const table = document.querySelector('#historyTableBody');
    if (!table) {
      console.error('Admin history logs table not found');
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

      // Column 1: History ID
      const tdId = document.createElement("td");
      tdId.textContent = index + 1;
      tr.appendChild(tdId);

      // Column 2: Email
      const tdUserName = document.createElement("td");
      tdUserName.textContent = log.user_name || log.user_id?.email || 'N/A';
      tr.appendChild(tdUserName);

      // Column 3: Role
      const tdStatus = document.createElement("td");
      tdStatus.textContent = log.user_status || log.user_id?.u_role || 'N/A';
      tr.appendChild(tdStatus);

      // Column 4: Time In
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

      // Column 5: Time Out
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

      // Column 6: Date
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
    
    console.log(`Loaded ${data.length} history logs for admin successfully`);
    
  } catch (error) {
    console.error('Error loading admin history logs:', error);
    const table = document.querySelector('#historyTableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading history logs. Please try again.</td></tr>';
    }
  }
}

// Initialize admin logs when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Admin logs script loaded...');
  
  // Load logs immediately if the tables exist
  if (document.querySelector('#activityTableBody')) {
    loadAdminActivityLogs();
  }
  
  if (document.querySelector('#historyTableBody')) {
    loadAdminHistoryLogs();
  }
  
  // Add event listeners for menu items to load logs when panels are activated
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      
      // Small delay to ensure panel is visible before loading data
      setTimeout(() => {
        // Load activity logs for history panel
        if (target === 'history') {
          if (document.querySelector('#activityTableBody')) {
            loadAdminActivityLogs();
          }
        }
        // Load history logs for activity panel
        if (target === 'activity') {
          if (document.querySelector('#historyTableBody')) {
            loadAdminHistoryLogs();
          }
        }
      }, 100);
    });
  });
  
  // Set up auto-refresh every 30 seconds
  setInterval(() => {
    const activePanel = document.querySelector('.content-panel.active');
    if (activePanel) {
      const panelId = activePanel.id;
      // Auto-refresh activity logs for history panel
      if (panelId === 'history') {
        if (document.querySelector('#activityTableBody')) {
          loadAdminActivityLogs();
        }
      }
      // Auto-refresh history logs for activity panel
      if (panelId === 'activity') {
        if (document.querySelector('#historyTableBody')) {
          loadAdminHistoryLogs();
        }
      }
    }
  }, 30000);
  
  // Add event listeners for manual refresh buttons
  const refreshActivityBtn = document.getElementById('refreshActivityLogs');
  const refreshHistoryBtn = document.getElementById('refreshHistoryLogs');
  
  if (refreshActivityBtn) {
    refreshActivityBtn.addEventListener('click', () => {
      console.log('Manual refresh of admin activity logs triggered');
      loadAdminActivityLogs();
    });
  }
  
  if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', () => {
      console.log('Manual refresh of admin history logs triggered');
      loadAdminHistoryLogs();
    });
  }
});

// Date filtering functionality for admin
function filterAdminActivityLogsByDate(dateValue) {
  const table = document.querySelector('#activityTableBody');
  if (!table) return;
  
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    if (row.cells.length < 5) return; // Skip empty or error rows
    
    const rowDate = row.cells[4].textContent; // Date is in 5th column (index 4)
    if (!dateValue || rowDate.includes(new Date(dateValue).toLocaleDateString())) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function filterAdminHistoryLogsByDate(dateValue) {
  const table = document.querySelector('#historyTableBody');
  if (!table) return;
  
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    if (row.cells.length < 6) return; // Skip empty or error rows
    
    const rowDate = row.cells[5].textContent; // Date is in 6th column (index 5)
    if (!dateValue || rowDate.includes(new Date(dateValue).toLocaleDateString())) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Set up date filter event listeners for admin
document.addEventListener('DOMContentLoaded', function() {
  const activityDateFilter = document.getElementById('activityDateFilter');
  const historyDateFilter = document.getElementById('historyDateFilter');
  
  if (activityDateFilter) {
    activityDateFilter.addEventListener('change', function() {
      filterAdminActivityLogsByDate(this.value);
    });
  }
  
  if (historyDateFilter) {
    historyDateFilter.addEventListener('change', function() {
      filterAdminHistoryLogsByDate(this.value);
    });
  }
}); 