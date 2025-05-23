// Notification system for staff dashboard
let currentUserId = null;

document.addEventListener('DOMContentLoaded', function() {
  console.log('Notifications system loaded');
  
  // Get current user ID from session or global variable
  getCurrentUserId();
  
  // Load notifications when the page loads
  loadNotifications();
  
  // Set up auto-refresh every 30 seconds
  setInterval(loadNotifications, 30000);
  
  // Set up mark all as read button
  const markAllReadBtn = document.querySelector('.mark-read');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
  }
});

// Get current user ID (you may need to adjust this based on your session management)
async function getCurrentUserId() {
  try {
    // Try to get from global variable first
    if (typeof window.currentUserId !== 'undefined') {
      currentUserId = window.currentUserId;
      return;
    }
    
    // If not available, try to get from profile endpoint
    const response = await fetch('/api/user-profile');
    if (response.ok) {
      const userData = await response.json();
      currentUserId = userData._id;
      window.currentUserId = currentUserId;
    } else {
      console.warn('Could not get current user ID');
    }
  } catch (error) {
    console.error('Error getting current user ID:', error);
  }
}

// Load notifications from database
async function loadNotifications() {
  try {
    if (!currentUserId) {
      await getCurrentUserId();
    }
    
    if (!currentUserId) {
      console.warn('No user ID available for loading notifications');
      return;
    }
    
    console.log('Loading notifications for user:', currentUserId);
    
    const response = await fetch(`/api/notifications?user_id=${currentUserId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }
    
    const notifications = await response.json();
    console.log('Loaded notifications:', notifications);
    
    displayNotifications(notifications);
    updateNotificationBadge(notifications);
    
  } catch (error) {
    console.error('Error loading notifications:', error);
    displayErrorMessage();
  }
}

// Display notifications in the UI
function displayNotifications(notifications) {
  const notificationsContainer = document.querySelector('.notifications');
  if (!notificationsContainer) {
    console.warn('Notifications container not found');
    return;
  }
  
  // Clear existing notifications
  notificationsContainer.innerHTML = '';
  
  if (!notifications || notifications.length === 0) {
    notificationsContainer.innerHTML = `
      <div class="no-notifications">
        <p style="text-align: center; color: #666; padding: 20px;">No notifications found</p>
      </div>
    `;
    return;
  }
  
  // Group notifications by type for better organization
  const assignmentNotifications = notifications.filter(n => n.type === 'assignment');
  const otherNotifications = notifications.filter(n => n.type !== 'assignment');
  
  // Display assignment notifications first (these are the important ones)
  assignmentNotifications.forEach(notification => {
    const notificationElement = createNotificationElement(notification, true);
    notificationsContainer.appendChild(notificationElement);
  });
  
  // Display other notifications
  otherNotifications.forEach(notification => {
    const notificationElement = createNotificationElement(notification, false);
    notificationsContainer.appendChild(notificationElement);
  });
}

// Create individual notification element
function createNotificationElement(notification, isAssignment = false) {
  const notificationDiv = document.createElement('div');
  notificationDiv.className = `notification ${notification.read ? '' : 'unread'}`;
  notificationDiv.dataset.notificationId = notification._id;
  
  // Format the time
  const timeAgo = getTimeAgo(notification.created_at || notification.date);
  const formattedTime = formatNotificationTime(notification.time);
  
  // Create avatar (use default for now)
  const avatar = '/image/profile2.jpg';
  
  // Create the notification content
  let notificationContent = `
    <img src="${avatar}" alt="Avatar" />
    <div class="message">
      <strong>${notification.title || 'System Notification'}</strong>
      <div class="notification-text">${notification.message}</div>
      <div class="time">${formattedTime}</div>
    </div>
    <div class="meta">
      <p>${timeAgo}</p>
      ${!notification.read ? '<span class="dot"></span>' : ''}
    </div>
  `;
  
  // Add action buttons for assignment notifications
  if (isAssignment && notification.assignment_id) {
    notificationContent += `
      <div class="notification-actions">
        <button class="mark-done-btn" onclick="markAssignmentAsDone('${notification.assignment_id}', '${notification._id}')">
          <i class="bx bx-check"></i> Mark as Done
        </button>
      </div>
    `;
  }
  
  notificationDiv.innerHTML = notificationContent;
  
  // Add click event to mark as read
  notificationDiv.addEventListener('click', function() {
    if (!notification.read) {
      markNotificationAsRead(notification._id);
    }
  });
  
  return notificationDiv;
}

// Mark individual notification as read
async function markNotificationAsRead(notificationId) {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // Update UI
      const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
      if (notificationElement) {
        notificationElement.classList.remove('unread');
        const dot = notificationElement.querySelector('.dot');
        if (dot) dot.remove();
      }
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Mark all notifications as read
async function markAllNotificationsAsRead() {
  try {
    if (!currentUserId) {
      await getCurrentUserId();
    }
    
    const response = await fetch('/api/notifications/mark-all-read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: currentUserId })
    });
    
    if (response.ok) {
      // Reload notifications to update UI
      loadNotifications();
      console.log('All notifications marked as read');
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

// Mark assignment as done - this is the key function
async function markAssignmentAsDone(assignmentId, notificationId) {
  try {
    console.log('Marking assignment as done:', assignmentId);
    
    // Show loading state
    const button = event.target.closest('.mark-done-btn');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Updating...';
    }
    
    // Update the activity log status to "done"
    const response = await fetch(`/api/activity-logs/${assignmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'done',
        end_time: new Date().toTimeString().split(' ')[0],
        completion_date: new Date().toISOString().split('T')[0]
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Assignment marked as done successfully:', result);
      
      // Mark the notification as read
      await markNotificationAsRead(notificationId);
      
      // Show success message
      showNotificationMessage('Assignment completed successfully!', 'success');
      
      // Update button to show completion
      if (button) {
        button.innerHTML = '<i class="bx bx-check"></i> Completed';
        button.classList.add('completed');
        button.disabled = true;
      }
      
      // Refresh notifications after a short delay
      setTimeout(() => {
        loadNotifications();
        
        // Also refresh the Collection Activity Log if the function exists
        if (typeof window.loadActivityLogs === 'function') {
          console.log('Refreshing Collection Activity Log after assignment completion');
          window.loadActivityLogs();
        }
      }, 1000);
      
    } else {
      throw new Error(`Failed to update assignment: ${response.status}`);
    }
    
  } catch (error) {
    console.error('Error marking assignment as done:', error);
    showNotificationMessage('Failed to mark assignment as done. Please try again.', 'error');
    
    // Reset button state
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="bx bx-check"></i> Mark as Done';
    }
  }
}

// Update notification badge (if you have one)
function updateNotificationBadge(notifications) {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Update any notification badges in the UI
  const badges = document.querySelectorAll('.notification-badge, .unread-count');
  badges.forEach(badge => {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  });
}

// Utility functions
function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function formatNotificationTime(timeString) {
  if (!timeString) return 'N/A';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = ((h + 11) % 12) + 1;
    return `${hour12}:${minutes} ${ampm}`;
  } catch (error) {
    return timeString;
  }
}

function displayErrorMessage() {
  const notificationsContainer = document.querySelector('.notifications');
  if (notificationsContainer) {
    notificationsContainer.innerHTML = `
      <div class="error-message">
        <p style="text-align: center; color: #d32f2f; padding: 20px;">
          Failed to load notifications. Please refresh the page.
        </p>
      </div>
    `;
  }
}

function showNotificationMessage(message, type = 'info') {
  // Create a temporary toast notification
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

// Make functions globally accessible
window.markAssignmentAsDone = markAssignmentAsDone;
window.loadNotifications = loadNotifications; 