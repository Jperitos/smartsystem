// Load Activity Logs with improved formatting and error handling
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
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No activity logs found</td></tr>';
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

      // Bin Code/ID
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

      // Time
      const tdTime = document.createElement("td");
      if (log.time) {
        // Convert 24-hour time to 12-hour format if needed
        const timeStr = log.time.toString();
        if (timeStr.includes(':')) {
          const [hours, minutes] = timeStr.split(':');
          const hour12 = ((parseInt(hours) + 11) % 12) + 1;
          const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
          tdTime.textContent = `${hour12}:${minutes} ${ampm}`;
        } else {
          tdTime.textContent = timeStr;
        }
      } else {
        tdTime.textContent = 'N/A';
      }
      tr.appendChild(tdTime);

      // Status
      const tdStatus = document.createElement("td");
      const statusBtn = document.createElement("button");
      
      // Set status class based on status value
      const status = log.status?.toLowerCase() || 'pending';
      let statusClass = 'status-pending';
      
      switch (status) {
        case 'completed':
        case 'done':
          statusClass = 'status-done';
          break;
        case 'in-progress':
        case 'inprogress':
        case 'active':
          statusClass = 'status-inprogress';
          break;
        case 'assigned':
          statusClass = 'status-assigned';
          break;
        default:
          statusClass = 'status-pending';
      }
      
      statusBtn.className = statusClass;
      statusBtn.textContent = log.status || 'Pending';
      tdStatus.appendChild(statusBtn);
      tr.appendChild(tdStatus);

      table.appendChild(tr);
    });
    
    console.log(`Loaded ${data.length} activity logs successfully`);
    
  } catch (error) {
    console.error('Error loading activity logs:', error);
    const table = document.querySelector('#activityTableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading activity logs. Please try again.</td></tr>';
    }
  }
}

// Load History Logs with improved formatting and error handling
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

// Initialize the logs when the page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded, initializing activity and history logs...');
  
  // Load logs immediately if the tables exist
  if (document.querySelector('#activityTableBody')) {
    loadActivityLogs();
  }
  if (document.querySelector('#historyTableBody')) {
    loadHistoryLogs();
  }
  
  // Add event listeners for menu items to load logs when panels are activated
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      
      // Small delay to ensure panel is visible before loading data
      setTimeout(() => {
        if (target === 'activity-logs' || target === 'history') {
          if (document.querySelector('#activityTableBody')) {
            loadActivityLogs();
          }
        }
        if (target === 'history-logs' || target === 'activity') {
          if (document.querySelector('#historyTableBody')) {
            loadHistoryLogs();
          }
        }
      }, 100);
    });
  });
  
  // Set up auto-refresh every 30 seconds
  setInterval(() => {
    // Only refresh if the panels are visible
    const activePanel = document.querySelector('.content-panel.active');
    if (activePanel && (activePanel.id === 'activity-logs' || activePanel.id === 'history' || activePanel.id === 'history-logs' || activePanel.id === 'activity')) {
      if (document.querySelector('#activityTableBody')) {
        loadActivityLogs();
      }
      if (document.querySelector('#historyTableBody')) {
        loadHistoryLogs();
      }
    }
  }, 30000);
  
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
