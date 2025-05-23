document.addEventListener("DOMContentLoaded", function() {
  // Attach click event listeners to tabs
  document.getElementById("tabOverview").addEventListener("click", function(event) {
    showTab('overview', event);
  });
  document.getElementById("tabStaff").addEventListener("click", function(event) {
    showTab('staff', event);
  });
  document.getElementById("tabRequest").addEventListener("click", function(event) {
    showTab('request', event);
  });
  document.getElementById("tabBin").addEventListener("click", function(event) {
    showTab('Bin', event);
  });
});

// Function to show the selected tab
function showTab(tabId, event) {
  // Remove 'active' class from all tab content and tabs
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Add 'active' class to the selected tab and tab content
  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");
}

  document.querySelectorAll(".table2 td:nth-child(7)").forEach((td) => {
    if (td.textContent.trim() === "Pending") {
      td.style.color = "#E5C33B";
    } else if (td.textContent.trim() === "Confirm") {
      td.style.color = "#3A7D44";
    }
  });
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".table2 tr").forEach((row) => {
      row.addEventListener("click", function () {
        document.querySelectorAll(".table2 tr").forEach((r) => r.classList.remove("selected"));

        this.classList.add("selected");
      });
    });
  });

// profile
const profileIcon = document.getElementById("profileIcon");
const profileDropdown = document.getElementById("profileDropdown");

profileIcon.addEventListener("click", (event) => {
  event.preventDefault();
  profileDropdown.classList.toggle("show");
});

window.addEventListener("click", (event) => {
  if (!profileIcon.contains(event.target) && !profileDropdown.contains(event.target)) {
    profileDropdown.classList.remove("show");
  }
});

document.addEventListener("DOMContentLoaded", function() {
  var bellIcon = document.getElementById("bellIcon");
  if (bellIcon) {
    bellIcon.addEventListener("click", showNotifications);
  }

  // Load user notifications on page load
  loadUserNotifications();

  // Add event listener for settings tab to refresh notifications
  const settingsTabLink = document.querySelector('.menu-item[data-target="settings"]');
  if (settingsTabLink) {
    settingsTabLink.addEventListener('click', () => {
      // Slight delay to ensure the tab content is loaded
      setTimeout(() => {
        loadUserNotifications();
      }, 100);
    });
  }

  // Also listen for the notifications tab within settings
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('tab-link') && event.target.getAttribute('data-tab') === 'notifications') {
      setTimeout(() => {
        loadUserNotifications();
      }, 100);
    }
    
    // Handle mark all as read button
    if (event.target.classList.contains('mark-read')) {
      markAllAsRead();
    }
  });

  // Notifications toggle function
  function showNotifications() {
      var dropdown = document.getElementById("notificationDropdown");
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        // Refresh notifications when dropdown is opened
        if (dropdown.style.display === "block") {
          loadUserNotifications();
        }
      }
  }

  // Close the dropdown if clicked outside
  document.addEventListener("click", function(event) {
      var dropdown = document.getElementById("notificationDropdown");
      var bellIcon = document.getElementById("bellIcon");

      if (dropdown && bellIcon && !dropdown.contains(event.target) && !bellIcon.contains(event.target)) {
          dropdown.style.display = "none";
      }
  });
});

// Function to load user notifications from API
async function loadUserNotifications() {
  try {
    // Get current user ID (this would need to be passed from the server or stored in session)
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No user ID available for loading notifications');
      return;
    }

    const response = await fetch(`/api/notifications?user_id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const notifications = await response.json();
    displayNotifications(notifications);
    displaySettingsNotifications(notifications); // Also update settings notifications
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

// Function to display notifications in dropdown
function displayNotifications(notifications) {
  const notificationList = document.querySelector('.notification-list');
  if (!notificationList) {
    console.warn('Notification list element not found');
    return;
  }

  // Clear existing notifications
  notificationList.innerHTML = '';

  if (notifications.length === 0) {
    notificationList.innerHTML = '<li class="notification-item">No new notifications</li>';
    return;
  }

  // Display notifications
  notifications.slice(0, 5).forEach(notification => { // Show only last 5 notifications
    const notificationElement = document.createElement('li');
    notificationElement.className = `notification-item ${notification.status === 'sent' ? 'unread' : ''}`;
    
    const timeAgo = getTimeAgo(new Date(notification.created_at));
    const binCode = (notification.bin_id && notification.bin_id.bin_code) ? notification.bin_id.bin_code : 'Unknown bin';
    
    notificationElement.innerHTML = `
      <div class="notification-content">
        <div class="notification-message">
          <strong>${notification.notif_type}</strong><br>
          ${notification.message.substring(0, 100)}${notification.message.length > 100 ? '...' : ''}
        </div>
        <div class="notification-time">${timeAgo}</div>
      </div>
    `;
    
    // Add click handler to mark as read
    notificationElement.addEventListener('click', () => {
      markNotificationAsRead(notification._id);
      notificationElement.classList.remove('unread');
    });
    
    notificationList.appendChild(notificationElement);
  });
}

// Function to mark notification as read
async function markNotificationAsRead(notificationId) {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Function to get current user ID - using the existing API endpoint
async function getCurrentUserId() {
  try {
    // Try authenticated endpoint first
    const response = await fetch('/users/me', {
      credentials: 'include'  // Include cookies for authentication
    });
    
    if (response.ok) {
      const userData = await response.json();
      return userData._id;
    }
    
    // If authentication fails, try fallback endpoint for testing
    console.warn('Authentication failed, using fallback user endpoint');
    const fallbackResponse = await fetch('/api/current-user');
    
    if (fallbackResponse.ok) {
      const userData = await fallbackResponse.json();
      return userData._id;
    }
    
    console.warn('Failed to get current user information');
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    
    // Try fallback as last resort
    try {
      const fallbackResponse = await fetch('/api/current-user');
      if (fallbackResponse.ok) {
        const userData = await fallbackResponse.json();
        return userData._id;
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    
    return null;
  }
}

// Auto-refresh notifications every 30 seconds
setInterval(() => {
  const dropdown = document.getElementById("notificationDropdown");
  // Only refresh if dropdown is visible
  if (dropdown && dropdown.style.display === "block") {
    loadUserNotifications();
  }
}, 30000);

// filkter table
document.getElementById("dateFilter").addEventListener("input", filterTable);
let sortAsc = true;

function filterTable() {
    let filterDate = document.getElementById("dateFilter").value;
    let table = document.getElementById("tableBody");
    let rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        let dateCell = rows[i].getElementsByTagName("td")[3]; 
        if (dateCell) {
            let rowDate = dateCell.textContent || dateCell.innerText;

            if (rowDate === filterDate || filterDate === "") {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}

function sortTable() {
    let table = document.getElementById("tableBody");
    let rows = Array.from(table.getElementsByTagName("tr"));

    rows.sort((a, b) => {
        let dateA = a.cells[3].textContent; 
        let dateB = b.cells[3].textContent;

        let timeA = a.cells[4].textContent;
        let timeB = b.cells[4].textContent;

        let fullDateA = new Date(dateA + " " + timeA);
        let fullDateB = new Date(dateB + " " + timeB);

        return sortAsc ? fullDateA - fullDateB : fullDateB - fullDateA;
    });

    sortAsc = !sortAsc; 
    rows.forEach(row => table.appendChild(row)); 
}

document.getElementById("sortBtn").addEventListener("click", sortTable);
// progress bar
function updateProgressBars() {
  const bins = document.querySelectorAll(".bin-status p");

  bins.forEach((bin, index) => {
      const progressText = bin.querySelector(".progress");
      const progressValue = parseInt(progressText.getAttribute("data-progress"), 10);
      const progressBar = document.querySelectorAll(".progress-bar")[index];

      if (progressBar) {
          progressBar.style.width = progressValue + "%";
      }
  });
}


window.onload = updateProgressBars;
// staff tab sorting and search bar
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("binSearch");
  const table = document.querySelector(".table2");
  const rows = table.querySelectorAll("tr:not(:first-child)"); 
  const sortBtn = document.getElementById("sortBtn");

  // SEARCH FUNCTION
  searchInput.addEventListener("input", function () {
      const searchValue = this.value.toLowerCase();
      rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchValue) ? "" : "none";
      });
  });

  // SORT FUNCTION
  let isAscending = true; 
  sortBtn.addEventListener("click", function () {
      const rowsArray = Array.from(rows);

      rowsArray.sort((rowA, rowB) => {
          const dateA = rowA.cells[0].textContent.trim(); 
          const dateB = rowB.cells[0].textContent.trim();
          return isAscending ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      });

      isAscending = !isAscending; 

      rowsArray.forEach(row => table.appendChild(row)); 
  });
});



// update staff modal
const updateModal = document.getElementById("updateStaffModal");
const closeUpdateModalBtn = document.getElementById("closeUpdateModalBtn");


const editButtons = document.querySelectorAll(".edit-btn");

editButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const staffId = this.getAttribute("data-id"); // Get staff ID

    // Populate fields with sample data (Replace with actual data from DB)
    document.getElementById("updateName").value = "Jamaica Anuba"; 
    document.getElementById("updateAge").value = "35";
    document.getElementById("updateContact").value = "09950913018";
    document.getElementById("updateAddress").value = "Tungkil Minglanilla";
    document.getElementById("updateEmail").value = "example@email.com";
    document.getElementById("updateFloor").value = "2";
    document.getElementById("updateMaritalStatus").value = "Single";

    updateModal.style.display = "flex"; 
  });
});

closeUpdateModalBtn.addEventListener("click", () => {
  updateModal.style.display = "none";
});


window.addEventListener("click", (event) => {
  if (event.target === updateModal) {
    updateModal.style.display = "none";
  }
});

// delete modal
const deleteModal = document.getElementById("deleteConfirmModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");


let staffToDelete = null;

const deleteButtons = document.querySelectorAll(".delete-btn");

deleteButtons.forEach((button) => {
  button.addEventListener("click", function () {
    staffToDelete = this.closest("tr"); 
    deleteModal.style.display = "flex"; 
  });
});

// Confirm delete action
confirmDeleteBtn.addEventListener("click", () => {
  if (staffToDelete) {
    staffToDelete.remove(); 
    staffToDelete = null;
  }
  deleteModal.style.display = "none"; 
});

// Cancel delete action
cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.style.display = "none";
});


window.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    deleteModal.style.display = "none";
  }
});
// Handle the filter search in staff list
document.getElementById('binSearch').addEventListener('input', function() {
  const query = this.value.toLowerCase();
  const rows = document.querySelectorAll('.table2 tr');
  rows.forEach(row => {
    const nameCell = row.cells[1];
    if (nameCell) {
      const name = nameCell.textContent.toLowerCase();
      if (name.includes(query)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  });
});

//   admin
  
     document.querySelectorAll(".menu-item").forEach((item) => {
        item.addEventListener("click", function () {
      
          document.querySelectorAll(".menu-item").forEach((link) => link.classList.remove("active"));
          this.classList.add("active");

          document.querySelectorAll(".content-panel").forEach((panel) => panel.classList.remove("active"));

       
          const target = this.getAttribute("data-target");
          document.getElementById(target).classList.add("active");
        });
      });

// Function to display notifications in settings page
function displaySettingsNotifications(notifications) {
  const settingsNotificationsContainer = document.querySelector('#notifications .notifications');
  if (!settingsNotificationsContainer) {
    return; // Settings notifications container not found (might not be on this page)
  }

  // Clear existing notifications
  settingsNotificationsContainer.innerHTML = '';

  if (notifications.length === 0) {
    settingsNotificationsContainer.innerHTML = `
      <div class="no-notifications" style="text-align: center; padding: 20px; color: #666;">
        <p>No notifications yet</p>
      </div>
    `;
    return;
  }

  // Display notifications
  notifications.forEach(notification => {
    const timeAgo = getTimeAgo(new Date(notification.created_at));
    const binCode = (notification.bin_id && notification.bin_id.bin_code) ? notification.bin_id.bin_code : 'Unknown bin';
    const isUnread = notification.status === 'sent';
    
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification ${isUnread ? 'unread' : ''}`;
    
    // Extract bin level from notification message if it's a task assignment
    let displayMessage = notification.message;
    let binLevelInfo = '';
    
    if (notification.notif_type === 'Task Assignment') {
      // Extract bin level from the notification message
      const binLevelMatch = notification.message.match(/• Bin Level at Assignment: (.*?)$/m);
      const binLevel = binLevelMatch ? binLevelMatch[1] : 'Not specified';
      
      displayMessage = `You have been assigned to clear bin ${binCode}`;
      binLevelInfo = ` (Level: ${binLevel})`;
    }
    
    notificationElement.innerHTML = `
      <img src="/image/profile.jpg" alt="Avatar" />
      <div class="message">
        <strong>${notification.notif_type}</strong> ${displayMessage}${binLevelInfo}
        <div class="time">${new Date(notification.created_at).toLocaleDateString()} ${new Date(notification.created_at).toLocaleTimeString()}</div>
      </div>
      <div class="meta">
        <p>${timeAgo}</p>
        ${isUnread ? '<span class="dot"></span>' : ''}
      </div>
    `;
    
    // Add click handler to mark as read and show full notification
    notificationElement.addEventListener('click', () => {
      if (isUnread) {
        markNotificationAsRead(notification._id);
        notificationElement.classList.remove('unread');
        const dot = notificationElement.querySelector('.dot');
        if (dot) dot.remove();
      }
      showFullNotification(notification);
    });
    
    settingsNotificationsContainer.appendChild(notificationElement);
  });
}

// Function to show full notification details in a better format
function showFullNotification(notification) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 80%;
    overflow-y: auto;
  `;
  
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; color: #3A7D44;">${notification.notif_type}</h3>
      <button id="closeNotificationModal" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
    </div>
    <div style="margin-bottom: 15px;">
      <strong>Time:</strong> ${new Date(notification.created_at).toLocaleString()}
    </div>
    <div style="white-space: pre-wrap; line-height: 1.5;">
      ${notification.message}
    </div>
    ${notification.bin_id ? `
      <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
        <strong>Bin Details:</strong><br>
        Code: ${notification.bin_id.bin_code || 'N/A'}<br>
        Location: ${notification.bin_id.location || 'N/A'}<br>
        Type: ${notification.bin_id.type || 'N/A'}
      </div>
    ` : `
      <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
        <strong>Note:</strong> This is a general notification without specific bin details.
      </div>
    `}
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Close modal handlers
  const closeBtn = content.querySelector('#closeNotificationModal');
  const closeModal = () => {
    document.body.removeChild(modal);
  };
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// Function to mark all notifications as read
async function markAllAsRead() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No user ID available for marking notifications as read');
      return;
    }

    const response = await fetch('/api/notifications/mark-all-read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    
    // Refresh notifications after marking as read
    loadUserNotifications();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

      