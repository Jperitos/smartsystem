/**
 * Activity Logs - Fetch and display user assignments
 */

// Get the current user's ID from session
function getCurrentUserId() {
  // Try to get from session storage first (set during login)
  let userId = sessionStorage.getItem('userId');
  
  // If not found in session, try local storage
  if (!userId) {
    userId = localStorage.getItem('userId');
  }
  
  // If still not found, try to get from a data attribute on the page
  if (!userId) {
    const userIdElement = document.getElementById('current-user-id');
    if (userIdElement) {
      userId = userIdElement.getAttribute('data-user-id');
    }
  }
  
  // If userId is still not found, use a default for testing
  if (!userId) {
    console.warn('User ID not found in storage or page attributes. Using default for testing.');
    userId = '1001'; // Default ID for testing
  }
  
  console.log('Current user ID:', userId);
  return userId;
}

// Function to fetch activity logs from the database
async function fetchActivityLogs() {
  try {
    const userId = getCurrentUserId();
    console.log('Fetching assignments for user ID:', userId);
    
    // For testing, use mock data directly to avoid potential API issues
    // Comment this out when API is working properly
    console.log('Using mock data for testing');
    return [
      {
        id: '1001',
        bin_id: 'Bin 011',
        floor: 'Floor 1',
        task_description: 'Empty biodegradable bin',
        date: '2024-07-15',
        time: '08:30',
        end_time: '',
        status: 'assigned'
      },
      {
        id: '1002',
        bin_id: 'Bin 021',
        floor: 'Floor 2',
        task_description: 'Empty non-biodegradable bin',
        date: '2024-07-15',
        time: '09:00',
        end_time: '',
        status: 'assigned'
      },
      {
        id: '1003',
        bin_id: 'Bin 032',
        floor: 'Floor 3',
        task_description: 'Empty food waste bin',
        date: '2024-07-14',
        time: '10:30',
        end_time: '2024-07-14 11:45',
        status: 'completed'
      }
    ];
    
    // Uncomment this when API is working
    /*
    const response = await fetch(`/api/janitor/assignments/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('Error fetching assignments:', error);
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
  console.log('Starting to populate activity logs...');
  
  // Find table body element - using querySelectorAll to find all possible matches for debugging
  const tableBodyElements = document.querySelectorAll('tbody');
  console.log('Found table body elements:', tableBodyElements.length);
  tableBodyElements.forEach((el, i) => {
    console.log(`Table body ${i}:`, el.id || 'no id');
  });
  
  const tableBody = document.getElementById('activityTableBody');
  if (!tableBody) {
    console.error('Activity table body element not found with ID "activityTableBody"');
    return;
  }
  
  console.log('Found activity table body, proceeding to populate');
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  // Show loading indicator
  tableBody.innerHTML = '<tr><td colspan="8" class="loading-indicator">Loading your tasks...</td></tr>';
  
  // Fetch activity logs
  const logs = await fetchActivityLogs();
  console.log('Fetched assignments:', logs);
  
  // Clear loading indicator
  tableBody.innerHTML = '';
  
  // If no logs, show message
  if (!logs || logs.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8" class="empty-message">No tasks assigned to you yet.</td></tr>';
    return;
  }
  
  // Sort logs by date (newest first)
  logs.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Populate table with logs
  logs.forEach(assignment => {
    // Create a new row
    const row = document.createElement('tr');
    
    // Determine status class
    let statusClass = 'status-pending';
    if (assignment.status === 'done' || assignment.status === 'completed') {
      statusClass = 'status-done';
    } else if (assignment.status === 'in-progress' || assignment.status === 'inprogress') {
      statusClass = 'status-inprogress';
    } else if (assignment.status === 'assigned') {
      statusClass = 'status-assigned';
    }
    
    // Format dates for better display
    const startDate = formatDateTime(assignment.date, assignment.time);
    const endDate = assignment.end_time ? formatDateTime(assignment.end_time) : 'Pending';
    
    // Populate row content
    row.innerHTML = `
      <td>${assignment.id || ''}</td>
      <td>${assignment.bin_id}</td>
      <td>${assignment.floor || ''}</td>
      <td>${assignment.task_description || 'Collection Task'}</td>
      <td>${startDate}</td>
      <td>${endDate}</td>
      <td><span class="${statusClass}">${assignment.status}</span></td>
      <td>
        <button class="update-task-btn" data-id="${assignment.id}">
          Update
        </button>
      </td>
    `;
    
    // Add the row to the table
    tableBody.appendChild(row);
  });
  console.log(`Added ${logs.length} rows to the table`);
  
  // Add event listeners to update buttons
  document.querySelectorAll('.update-task-btn').forEach(button => {
    button.addEventListener('click', function() {
      const assignmentId = this.getAttribute('data-id');
      openUpdateModal(assignmentId);
    });
  });
}

// Function to open the update modal
function openUpdateModal(assignmentId) {
  console.log('Opening update modal for assignment:', assignmentId);
  
  // Find the assignment row
  const row = document.querySelector(`.update-task-btn[data-id="${assignmentId}"]`).closest('tr');
  
  if (row) {
    // Get assignment information from the row
    const binId = row.cells[1].textContent;
    const floor = row.cells[2].textContent;
    const task = row.cells[3].textContent;
    
    // Set values in the modal
    document.getElementById('collectionId').value = assignmentId;
    document.getElementById('taskDescription').textContent = task;
    document.getElementById('taskLocation').textContent = `${floor}, ${binId}`;
    
    // Show the modal
    const modal = document.getElementById('updateModal');
    if (modal) {
      modal.style.display = 'block';
    } else {
      console.error('Update modal element not found');
    }
  }
}

// Function to set up refresh button
function setupRefreshButton() {
  // Get or create refresh button
  let refreshBtn = document.querySelector('.refresh-btn');
  
  if (!refreshBtn) {
    const container = document.querySelector('#staffs .head-staff .right-head');
    if (container) {
      refreshBtn = document.createElement('button');
      refreshBtn.className = 'refresh-btn';
      refreshBtn.innerHTML = '<i class="bx bx-refresh"></i> Refresh';
      refreshBtn.style.backgroundColor = '#4CAF50';
      refreshBtn.style.color = 'white';
      refreshBtn.style.border = 'none';
      refreshBtn.style.borderRadius = '5px';
      refreshBtn.style.padding = '8px 16px';
      refreshBtn.style.cursor = 'pointer';
      refreshBtn.style.marginLeft = '10px';
      
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

// Function to trigger refresh after a task update
function refreshActivityLogsAfterSave() {
  setTimeout(() => {
    populateActivityLogs();
  }, 1500); // Refresh after 1.5 seconds to allow the server to save the data
}

// Export the refresh function for use in other scripts
window.refreshActivityLogs = refreshActivityLogsAfterSave;

// Initialize the activity logs display
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing activity logs...');
  
  // Check if we're on the janitor page
  if (document.getElementById('staffs')) {
    console.log('Found staffs panel, setting up activity logs');
    
    // Wait a bit for the DOM to fully load
    setTimeout(() => {
      // Populate the activity logs table
      populateActivityLogs();
      
      // Set up refresh button
      setupRefreshButton();
    }, 500);
    
    // Refresh the data every 30 seconds
    setInterval(() => {
      populateActivityLogs();
    }, 30000);
    
    // Setup menu item click handler to refresh data
    const collectionMenuItem = document.querySelector('.menu-item[data-target="staffs"]');
    if (collectionMenuItem) {
      collectionMenuItem.addEventListener('click', () => {
        populateActivityLogs();
      });
    }
  } else {
    console.warn('Staffs panel not found');
  }
}); 