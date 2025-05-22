/**
 * Activity Logs - Fetch and display bin assignments 
 */

// Function to fetch activity logs from the database
async function fetchActivityLogs() {
  try {
    const response = await fetch('/api/activity-logs');
    if (!response.ok) {
      throw new Error('Failed to fetch activity logs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}

// Format date and time for display
function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return 'N/A';
  
  const date = new Date(dateStr);
  const formattedDate = date.toISOString().split('T')[0];
  
  // If time is provided, include it in the format
  if (timeStr) {
    // Convert 24-hour time format to 12-hour format if needed
    let [hours, minutes] = timeStr.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${formattedDate} ${hours}:${minutes} ${ampm}`;
  }
  
  return formattedDate;
}

// Populate the activity logs table
async function populateActivityLogs() {
  const activityTableBody = document.getElementById('staffBody');
  if (!activityTableBody) {
    console.error('Activity table body element not found');
    return;
  }
  
  // Clear existing rows
  activityTableBody.innerHTML = '';
  
  // Show loading indicator
  activityTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading assignments...</td></tr>';
  
  // Fetch activity logs
  const logs = await fetchActivityLogs();
  
  // Clear loading indicator
  activityTableBody.innerHTML = '';
  
  // If no logs, show message
  if (!logs || logs.length === 0) {
    activityTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No assignments found</td></tr>';
    return;
  }
  
  // Sort logs by date/time (newest first)
  logs.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
  
  // Populate table with logs
  logs.forEach(log => {
    // Create a new row
    const row = document.createElement('tr');
    row.className = 'staff-row';
    
    // Determine status class
    let statusClass = 'status-pending';
    if (log.status === 'completed') {
      statusClass = 'status-done';
    } else if (log.status === 'inprogress') {
      statusClass = 'status-inprogress';
    }
    
    // Format the staff ID - use name if available, otherwise use ID
    const staffId = log.u_id.name || log.u_id || 'N/A';
    
    // Format bin name
    const binName = log.bin_id.bin_code || log.bin_id || 'N/A';
    
    // Populate row content
    row.innerHTML = `
      <td>${binName}</td>
      <td>Floor ${log.floor || 'N/A'}</td>
      <td>${staffId}</td>
      <td>${formatDateTime(log.date, log.time)}</td>
      <td>${log.end_time ? formatDateTime(log.end_time) : 'Pending'}</td>
      <td class="${statusClass}">${log.status || 'Pending'}</td>
    `;
    
    // Add the row to the table
    activityTableBody.appendChild(row);
  });
}

// Function to set up refresh button
function setupRefreshButton() {
  // Create or get refresh button
  let refreshBtn = document.getElementById('refreshActivityBtn');
  
  if (!refreshBtn) {
    const container = document.querySelector('#staffs .head-staff');
    if (container) {
      refreshBtn = document.createElement('button');
      refreshBtn.id = 'refreshActivityBtn';
      refreshBtn.className = 'refresh-btn';
      refreshBtn.innerHTML = '<i class="bx bx-refresh"></i> Refresh';
      refreshBtn.style.marginLeft = '10px';
      refreshBtn.style.padding = '5px 10px';
      refreshBtn.style.backgroundColor = '#4CAF50';
      refreshBtn.style.color = 'white';
      refreshBtn.style.border = 'none';
      refreshBtn.style.borderRadius = '5px';
      refreshBtn.style.cursor = 'pointer';
      
      // Add the button to the container
      container.appendChild(refreshBtn);
    }
  }
  
  // Add event listener to refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      populateActivityLogs();
    });
  }
}

// Initialize the activity logs display
document.addEventListener('DOMContentLoaded', () => {
  // Populate the activity logs table
  populateActivityLogs();
  
  // Set up refresh button
  setupRefreshButton();
  
  // Refresh the data every 30 seconds
  setInterval(() => {
    populateActivityLogs();
  }, 30000);
  
  // Setup menu item click handler to refresh data
  const activityMenuItem = document.querySelector('.menu-item[data-target="staffs"]');
  if (activityMenuItem) {
    activityMenuItem.addEventListener('click', () => {
      populateActivityLogs();
    });
  }
});

// Function to trigger refresh after a new assignment is saved
function refreshActivityLogsAfterSave() {
  setTimeout(() => {
    populateActivityLogs();
  }, 1500); // Refresh after 1.5 seconds to allow the server to save the data
}

// Export the refresh function for use in other scripts
window.refreshActivityLogs = refreshActivityLogsAfterSave; 