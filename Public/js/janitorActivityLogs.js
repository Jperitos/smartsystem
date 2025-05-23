// Janitor Activity Logs Handler - Enhanced User Authentication
console.log('Janitor Activity Logs script loaded');

// Store the current user ID and user info
let currentJanitorId = null;
let currentJanitorInfo = null;

// Function to get current authenticated user information
async function getCurrentJanitor() {
  try {
    console.log('Attempting to get current authenticated user...');
    
    // First try the authenticated endpoint
    const response = await fetch('/users/me', {
      credentials: 'include',  // Include cookies for authentication
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('Authenticated user found:', user);
      
      // Verify this is a janitor
      if (user.u_role === 'janitor') {
        currentJanitorId = user._id;
        currentJanitorInfo = user;
        console.log('Current janitor ID:', currentJanitorId);
        console.log('Current janitor name:', user.name);
        return user;
      } else {
        console.warn('Current user is not a janitor, role:', user.u_role);
        return null;
      }
    } else {
      console.warn('Authentication failed, status:', response.status);
    }
    
  } catch (error) {
    console.error('Error getting authenticated user:', error);
  }
  
  // Fallback: Try to get a sample janitor for testing
  try {
    console.log('Using fallback - getting any janitor for testing...');
    const response = await fetch('/api/current-user');
    if (response.ok) {
      const user = await response.json();
      if (user.u_role === 'janitor') {
        currentJanitorId = user._id;
        currentJanitorInfo = user;
        console.log('Using fallback janitor ID:', currentJanitorId);
        console.log('Fallback janitor name:', user.name);
        return user;
      }
    }
  } catch (fallbackError) {
    console.error('Fallback error:', fallbackError);
  }
  
  console.error('Could not get current janitor user');
  return null;
}

// Function to load activity logs for the current janitor - ONLY THEIR ASSIGNED TASKS
async function loadJanitorActivityLogs(filterDate = null) {
  try {
    console.log('Fetching janitor activity logs...');
    
    // Make sure we have the current janitor ID
    if (!currentJanitorId) {
      const user = await getCurrentJanitor();
      if (!user) {
        console.error('Cannot load activity logs: No authenticated janitor user found');
        const table = document.querySelector('#activityTableBody');
        if (table) {
          table.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #d32f2f;">Please log in as a janitor to view your assigned tasks.</td></tr>';
        }
        return;
      }
    }
    
    const response = await fetch('/api/activity-logs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('All activity logs fetched:', data.length, 'total logs');
    
    const table = document.querySelector('#activityTableBody');
    if (!table) {
      console.error('Activity logs table not found');
      return;
    }
    
    table.innerHTML = '';
    
    if (!data || data.length === 0) {
      table.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">No activity logs found in the system</td></tr>';
      return;
    }
    
    // CRITICAL: Filter ONLY for current janitor's tasks with relevant statuses
    let filteredData = data.filter(log => {
      // Check if the log is assigned to the current janitor
      const isAssignedToCurrentJanitor = (
        log.u_id?._id === currentJanitorId || 
        log.u_id?.toString() === currentJanitorId ||
        (typeof log.u_id === 'string' && log.u_id === currentJanitorId)
      );
      
      // Check for relevant statuses (assigned, in-progress, pending)
      const status = (log.status || '').toLowerCase();
      const isRelevantStatus = [
        'assigned', 
        'inprogress', 
        'in-progress', 
        'pending',
        'in progress'  // Handle various status formats
      ].includes(status);
      
      const shouldInclude = isAssignedToCurrentJanitor && isRelevantStatus;
      
      if (shouldInclude) {
        console.log('Including log:', {
          id: log._id,
          assignedTo: log.u_id?.name,
          currentUser: currentJanitorInfo?.name,
          status: log.status,
          task: log.assigned_task
        });
      }
      
      return shouldInclude;
    });
    
    console.log(`Filtered ${filteredData.length} logs for current janitor (${currentJanitorInfo?.name})`);
    
    // Filter by date if provided
    if (filterDate) {
      const originalCount = filteredData.length;
      filteredData = filteredData.filter(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0];
        return logDate === filterDate;
      });
      console.log(`Date filter applied: ${originalCount} -> ${filteredData.length} logs`);
    }
    
    // Sort by date (newest first)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredData.length === 0) {
      const noDataMessage = currentJanitorInfo 
        ? `No assigned tasks found for ${currentJanitorInfo.name}${filterDate ? ' on the selected date' : ''}` 
        : 'No assigned tasks found. Please log in to see your assignments.';
      table.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">${noDataMessage}</td></tr>`;
      return;
    }
    
    // Helper functions
    function formatTime(timeStr) {
      if (!timeStr) return 'N/A';
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = ((h + 11) % 12) + 1;
        return `${hour12}:${minutes} ${ampm}`;
      }
      return timeStr;
    }
    
    function capitalizeStatus(str) {
      if (!str) return 'Pending';
      const formatted = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      return formatted.replace('inprogress', 'In Progress');
    }
    
    function getStatusColor(status) {
      const statusLower = (status || '').toLowerCase();
      switch (statusLower) {
        case 'assigned':
        case 'pending':
          return '#ff9800'; // Orange
        case 'inprogress':
        case 'in-progress':
        case 'in progress':
          return '#4caf50'; // Green
        default:
          return '#6c757d'; // Gray
      }
    }
    
    // Generate table rows
    let collectionIdCounter = 1001;
    
    filteredData.forEach(log => {
      const tr = document.createElement('tr');
      
      // Collection ID
      const tdId = document.createElement('td');
      tdId.textContent = collectionIdCounter++;
      tr.appendChild(tdId);
      
      // Bin
      const tdBin = document.createElement('td');
      tdBin.textContent = log.bin_id?.bin_code || `Bin ${log.bin_id?._id?.slice(-3) || 'N/A'}`;
      tr.appendChild(tdBin);
      
      // Floor
      const tdFloor = document.createElement('td');
      tdFloor.textContent = log.floor ? `Floor ${log.floor}` : (log.bin_id?.location || 'N/A');
      tr.appendChild(tdFloor);
      
      // Staff (show current janitor's name)
      const tdStaff = document.createElement('td');
      tdStaff.textContent = currentJanitorInfo?.name || log.u_id?.name || 'You';
      tr.appendChild(tdStaff);
      
      // Date
      const tdDate = document.createElement('td');
      const date = log.date ? new Date(log.date) : null;
      tdDate.textContent = date ? date.toLocaleDateString('en-US') : 'N/A';
      tr.appendChild(tdDate);
      
      // Start Time
      const tdStartTime = document.createElement('td');
      tdStartTime.textContent = formatTime(log.time);
      tr.appendChild(tdStartTime);
      
      // End Time (usually empty for assigned tasks)
      const tdEndTime = document.createElement('td');
      tdEndTime.textContent = log.end_time ? formatTime(log.end_time) : '-';
      tr.appendChild(tdEndTime);
      
      // Status
      const tdStatus = document.createElement('td');
      const statusText = capitalizeStatus(log.status);
      tdStatus.textContent = statusText;
      tdStatus.style.color = getStatusColor(log.status);
      tdStatus.style.fontWeight = 'bold';
      tr.appendChild(tdStatus);
      
      // Action (Update button)
      const tdAction = document.createElement('td');
      const updateBtn = document.createElement('button');
      updateBtn.textContent = 'Update';
      updateBtn.className = 'update-btn';
      updateBtn.style.backgroundColor = '#007bff';
      updateBtn.style.color = 'white';
      updateBtn.style.border = 'none';
      updateBtn.style.padding = '5px 10px';
      updateBtn.style.borderRadius = '3px';
      updateBtn.style.cursor = 'pointer';
      updateBtn.style.fontSize = '12px';
      
      updateBtn.addEventListener('click', () => {
        // Use the new task updater instead of the old openUpdateModal
        if (typeof window.openTaskUpdateModal === 'function') {
          window.openTaskUpdateModal(log);
        } else {
          console.error('Task updater not available');
        }
      });
      
      tdAction.appendChild(updateBtn);
      tr.appendChild(tdAction);
      
      table.appendChild(tr);
    });
    
    console.log(`Successfully loaded ${filteredData.length} activity logs for ${currentJanitorInfo?.name}`);
    
    // Show user info in console for debugging
    if (currentJanitorInfo) {
      console.log('Current janitor details:', {
        name: currentJanitorInfo.name,
        email: currentJanitorInfo.email,
        role: currentJanitorInfo.u_role,
        id: currentJanitorId
      });
    }
    
  } catch (error) {
    console.error('Error loading janitor activity logs:', error);
    const table = document.querySelector('#activityTableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading activity logs. Please try again.</td></tr>';
    }
  }
}

// Date filter handler
function setupDateFilter() {
  const dateFilter = document.getElementById('activityDateFilter');
  if (dateFilter) {
    dateFilter.addEventListener('change', function() {
      const selectedDate = this.value;
      console.log('Date filter changed to:', selectedDate);
      loadJanitorActivityLogs(selectedDate);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Janitor Activity Logs: DOM loaded, initializing...');
  
  // Get current janitor info first
  const user = await getCurrentJanitor();
  if (!user) {
    console.error('No authenticated janitor user found');
    return;
  }
  
  // Setup date filter
  setupDateFilter();
  
  // Load logs immediately if the table exists
  if (document.querySelector('#activityTableBody')) {
    loadJanitorActivityLogs();
  }
  
  // Add event listeners for menu items to load logs when Collections panel is activated
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      
      // Load logs when Collections (staffs) panel is activated
      if (target === 'staffs') {
        setTimeout(() => {
          if (document.querySelector('#activityTableBody')) {
            loadJanitorActivityLogs();
          }
        }, 100);
      }
    });
  });
  
  // Trigger notification check for new assignments
  checkForNewAssignments();
});

// Auto-refresh every 30 seconds
setInterval(() => {
  const activePanel = document.querySelector('#staffs');
  const table = document.querySelector('#activityTableBody');
  
  if (activePanel && table && activePanel.classList.contains('active') && currentJanitorId) {
    console.log('Auto-refreshing janitor activity logs for:', currentJanitorInfo?.name);
    loadJanitorActivityLogs();
  }
}, 30000);

// Export functions for global access
window.loadJanitorActivityLogs = loadJanitorActivityLogs;
window.getCurrentJanitor = getCurrentJanitor;

// Function to check for new task assignments and trigger notifications
async function checkForNewAssignments() {
  try {
    // If notification manager is available, refresh it
    if (window.notificationManager) {
      console.log('🔔 Checking for new task assignment notifications...');
      await window.notificationManager.loadNotifications();
    }
  } catch (error) {
    console.warn('Could not check for new assignments:', error);
  }
} 