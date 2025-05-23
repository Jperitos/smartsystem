function showNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show'); // Toggle a 'show' class to show/hide
        // Refresh notifications when dropdown is opened
        if (dropdown.classList.contains('show')) {
            loadUserNotifications();
        }
    }
}

// To close notification dropdown when clicking outside (optional)
window.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationDropdown');
    const bellIcon = document.querySelector('a[onclick="showNotifications()"]');
    if (dropdown && bellIcon && !bellIcon.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Profile dropdown
const profileIcon = document.getElementById('profileIcon');
const profileDropdown = document.getElementById('profileDropdown');

profileIcon.addEventListener('click', function(event) {
    event.preventDefault();
    profileDropdown.classList.toggle('show');
});

// Optional: Hide profile dropdown when clicking outside
window.addEventListener('click', function(event) {
    if (!profileIcon.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove('show');
    }
});

// Function to load user notifications from API
async function loadUserNotifications() {
    try {
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
                    <small>${notification.message.substring(0, 100)}${notification.message.length > 100 ? '...' : ''}</small>
                </div>
                <div class="notification-time">${timeAgo}</div>
            </div>
        `;
        
        // Add click handler to mark as read and show full notification
        notificationElement.addEventListener('click', () => {
            markNotificationAsRead(notification._id);
            notificationElement.classList.remove('unread');
            showFullNotification(notification);
        });
        
        notificationList.appendChild(notificationElement);
    });
}

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

// Function to show full notification details
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

// Load notifications on page load
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Auto-refresh notifications every 30 seconds
    setInterval(() => {
        const dropdown = document.getElementById('notificationDropdown');
        // Only refresh if dropdown is visible or periodically for new notifications
        if (!dropdown || dropdown.classList.contains('show') || Math.random() < 0.1) { // 10% chance to refresh even when closed
            loadUserNotifications();
        }
    }, 30000);
});

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
