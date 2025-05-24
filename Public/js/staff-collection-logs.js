// Staff Dashboard Collection Activity Logs - Show Assigned Status Data
async function loadStaffCollectionLogs() {
  try {
    console.log('Fetching collection activity logs for staff dashboard...');
    const response = await fetch('/api/activity-logs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Collection activity logs fetched:', data);
    
    const table = document.querySelector('#activityTableBody');
    if (!table) {
      console.error('Collection activity logs table not found');
      return;
    }
    
    table.innerHTML = '';
    
    if (!data || data.length === 0) {
      table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">No activity logs found</td></tr>';
      return;
    }
    
    // Sort logs by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Filter to show assignments with "assigned" status and other active statuses
    const filteredData = data.filter(log => {
      const status = (log.status || '').toLowerCase();
      return ['assigned', 'pending', 'inprogress', 'in-progress'].includes(status);
    });

    if (filteredData.length === 0) {
      table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">No assigned collections found</td></tr>';
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
    
    // Helper to get status color - emphasizing assigned status
    function getStatusColor(status) {
      const statusLower = (status || '').toLowerCase();
      switch (statusLower) {
        case 'assigned':
          return '#3A7D44'; // Green for assigned
        case 'pending':
          return '#FF9800'; // Orange for pending
        case 'inprogress':
        case 'in-progress':
          return '#2196F3'; // Blue for in progress
        case 'completed':
        case 'done':
          return '#4CAF50'; // Light green for completed
        default:
          return '#666666'; // Gray for others
      }
    }
    
    // Helper to format status text
    function formatStatusText(status) {
      if (!status) return 'Pending';
      const statusLower = status.toLowerCase();
      switch (statusLower) {
        case 'assigned':
          return 'Assigned';
        case 'pending':
          return 'Pending';
        case 'inprogress':
        case 'in-progress':
          return 'In Progress';
        case 'completed':
        case 'done':
          return 'Completed';
        default:
          return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      }
    }
    
    let collectionIdCounter = 1001; // Start Collection ID from 1001
    
    filteredData.forEach(log => {
      const tr = document.createElement("tr");

      // Collection ID - incrementing from 1001
      const tdBinId = document.createElement("td");
      tdBinId.textContent = collectionIdCounter++;
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

      // Status with emphasis on "Assigned" status
      const tdStatus = document.createElement("td");
      const statusSpan = document.createElement("span");
      statusSpan.style.color = getStatusColor(log.status);
      statusSpan.style.fontWeight = '600';
      statusSpan.style.padding = '4px 8px';
      statusSpan.style.borderRadius = '4px';
      statusSpan.style.fontSize = '12px';
      
      // Add background color for assigned status
      if ((log.status || '').toLowerCase() === 'assigned') {
        statusSpan.style.backgroundColor = '#E8F5E8';
        statusSpan.style.border = '1px solid #3A7D44';
      }
      
      statusSpan.textContent = formatStatusText(log.status);
      tdStatus.appendChild(statusSpan);
      tr.appendChild(tdStatus);

      table.appendChild(tr);
    });
    
    console.log(`Loaded ${filteredData.length} collection activity logs for staff dashboard successfully`);
    
  } catch (error) {
    console.error('Error loading collection activity logs:', error);
    const table = document.querySelector('#activityTableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading collection logs. Please try again.</td></tr>';
    }
  }
}

// Filter collection logs by date
function filterCollectionLogsByDate(dateValue) {
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

// Initialize collection logs when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Staff Collection Logs script loaded...');
  
  // Load collection logs immediately if on Collection panel
  const staffsPanel = document.querySelector('#staffs');
  if (staffsPanel && staffsPanel.classList.contains('active')) {
    loadStaffCollectionLogs();
  }
  
  // Add event listeners for menu items to load logs when Collection panel is activated
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      
      // Load collection logs when switching to Collection (staffs) panel
      if (target === 'staffs') {
        setTimeout(() => {
          if (document.querySelector('#activityTableBody')) {
            loadStaffCollectionLogs();
          }
        }, 100);
      }
    });
  });
  
  // Setup date filter for collection logs
  const activityDateFilter = document.getElementById('activityDateFilter');
  if (activityDateFilter) {
    activityDateFilter.addEventListener('change', function() {
      filterCollectionLogsByDate(this.value);
    });
  }
  
  // Auto-refresh every 30 seconds if on Collection panel
  setInterval(() => {
    const activePanel = document.querySelector('.content-panel.active');
    if (activePanel && activePanel.id === 'staffs') {
      loadStaffCollectionLogs();
    }
  }, 30000);
});

// Export for use by other scripts
if (typeof window !== 'undefined') {
  window.loadStaffCollectionLogs = loadStaffCollectionLogs;
  window.filterCollectionLogsByDate = filterCollectionLogsByDate;
} 