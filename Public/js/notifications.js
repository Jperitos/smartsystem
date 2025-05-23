// Task Assignment Notifications System
console.log('Notifications system loaded');

/**
 * Main Notifications Manager Class
 */
class NotificationManager {
  constructor() {
    this.currentUserId = null;
    this.notifications = [];
    this.unreadCount = 0;
    this.refreshInterval = null;
    this.init();
  }

  /**
   * Initialize the notification system
   */
  async init() {
    console.log('Initializing notification system...');
    
    // Get current user ID
    await this.getCurrentUser();
    
    // Load notifications
    if (this.currentUserId) {
      await this.loadNotifications();
      this.setupEventListeners();
      this.startAutoRefresh();
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    try {
      const response = await fetch('/users/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        this.currentUserId = user._id;
        console.log('Current user ID:', this.currentUserId);
        return user;
      } else {
        console.warn('Could not get authenticated user');
        return null;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Load notifications from server
   */
  async loadNotifications() {
    try {
      console.log('Loading notifications for user:', this.currentUserId);
      
      const response = await fetch(`/api/notifications?user_id=${this.currentUserId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.notifications = await response.json();
      console.log(`Loaded ${this.notifications.length} notifications`);
      
      // Update unread count
      this.unreadCount = this.notifications.filter(n => n.status === 'sent').length;
      
      // Update UI
      this.updateNotificationUI();
      this.updateUnreadBadge();
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.showErrorMessage('Failed to load notifications');
    }
  }

  /**
   * Update the notifications UI
   */
  updateNotificationUI() {
    const notificationsContainer = document.querySelector('#notifications .notifications');
    
    if (!notificationsContainer) {
      console.warn('Notifications container not found');
      return;
    }
    
    // Clear existing notifications
    notificationsContainer.innerHTML = '';
    
    if (this.notifications.length === 0) {
      notificationsContainer.innerHTML = `
        <div class="notification no-notifications">
          <div class="message" style="text-align: center; color: #666; padding: 20px;">
            <i class="bx bx-bell" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 10px;"></i>
            No notifications yet
          </div>
        </div>
      `;
      return;
    }
    
    // Create notification elements
    this.notifications.forEach(notification => {
      const notificationElement = this.createNotificationElement(notification);
      notificationsContainer.appendChild(notificationElement);
    });
  }

  /**
   * Create a notification element
   */
  createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = `notification ${notification.status === 'sent' ? 'unread' : ''}`;
    div.setAttribute('data-notification-id', notification._id);
    
    // Parse notification message for better display
    const isTaskAssignment = notification.notif_type === 'Task Assignment';
    const createdTime = new Date(notification.created_at);
    const timeAgo = this.getTimeAgo(createdTime);
    
    let displayContent;
    if (isTaskAssignment) {
      displayContent = this.parseTaskAssignmentMessage(notification.message);
    } else {
      displayContent = {
        title: notification.notif_type || 'Notification',
        content: notification.message,
        binCode: notification.bin_id?.bin_code || 'N/A'
      };
    }
    
    div.innerHTML = `
      <img src="/image/task-icon.png" alt="Task" onerror="this.src='/image/profile2.jpg'" />
      <div class="message">
        <strong>${displayContent.title}</strong>
        <div class="notification-content">${displayContent.content}</div>
        <div class="time">${createdTime.toLocaleString()}</div>
      </div>
      <div class="meta">
        <p>${timeAgo}</p>
        ${notification.status === 'sent' ? '<span class="dot"></span>' : ''}
      </div>
      <div class="notification-actions" style="margin-left: auto;">
        ${notification.status === 'sent' ? 
          `<button class="mark-read-btn" onclick="notificationManager.markAsRead('${notification._id}')" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; font-size: 12px; cursor: pointer;">Mark Read</button>` 
          : ''
        }
      </div>
    `;
    
    // Add click handler to mark as read when clicked
    if (notification.status === 'sent') {
      div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('mark-read-btn')) {
          this.markAsRead(notification._id);
        }
      });
    }
    
    return div;
  }

  /**
   * Parse task assignment message for better display
   */
  parseTaskAssignmentMessage(message) {
    const lines = message.split('\n').filter(line => line.trim());
    
    // Extract key information
    let binCode = 'N/A';
    let floor = 'N/A';
    let task = 'Clean bin';
    let binLevel = 'Not specified';
    
    for (const line of lines) {
      if (line.includes('Bin Code:')) {
        binCode = line.split('Bin Code:')[1]?.trim() || 'N/A';
      }
      if (line.includes('Bin Location:')) {
        floor = line.split('Bin Location:')[1]?.trim() || 'N/A';
      }
      if (line.includes('Task:')) {
        task = line.split('Task:')[1]?.trim() || 'Clean bin';
      }
      if (line.includes('Bin Level at Assignment:')) {
        binLevel = line.split('Bin Level at Assignment:')[1]?.trim() || 'Not specified';
      }
    }
    
    return {
      title: `🗑️ New Task: ${binCode}`,
      content: `
        <div style="margin-top: 8px;">
          <div><strong>Location:</strong> ${floor}</div>
          <div><strong>Task:</strong> ${task}</div>
          <div><strong>Bin Level:</strong> ${binLevel}</div>
        </div>
      `
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      console.log('Marking notification as read:', notificationId);
      
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      const notification = this.notifications.find(n => n._id === notificationId);
      if (notification) {
        notification.status = 'read';
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.updateNotificationUI();
        this.updateUnreadBadge();
      }
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      console.log('Marking all notifications as read for user:', this.currentUserId);
      
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: this.currentUserId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update local state
      this.notifications.forEach(n => n.status = 'read');
      this.unreadCount = 0;
      this.updateNotificationUI();
      this.updateUnreadBadge();
      
      this.showSuccessMessage('All notifications marked as read');
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      this.showErrorMessage('Failed to mark all notifications as read');
    }
  }

  /**
   * Update unread badge/counter
   */
  updateUnreadBadge() {
    // Update notification tab indicator
    const notificationTab = document.querySelector('[data-tab="notifications"]');
    if (notificationTab) {
      const existingBadge = notificationTab.querySelector('.unread-badge');
      if (existingBadge) {
        existingBadge.remove();
      }
      
      if (this.unreadCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'unread-badge';
        badge.textContent = this.unreadCount;
        badge.style.cssText = `
          background: #ff4444;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 10px;
          margin-left: 5px;
          min-width: 16px;
          text-align: center;
        `;
        notificationTab.appendChild(badge);
      }
    }
    
    console.log(`Unread notifications: ${this.unreadCount}`);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Mark all as read button
    const markAllReadBtn = document.querySelector('.mark-read');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => this.markAllAsRead());
    }
    
    // Refresh button if exists
    const refreshBtn = document.querySelector('.refresh-notifications');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadNotifications());
    }
  }

  /**
   * Start auto-refresh for notifications
   */
  startAutoRefresh() {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadNotifications();
    }, 30000);
    
    console.log('Auto-refresh started for notifications');
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('Auto-refresh stopped for notifications');
    }
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
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

  /**
   * Show success message
   */
  showSuccessMessage(message) {
    console.log('✅ Success:', message);
    // You can replace this with a better notification system
    this.showToast(message, 'success');
  }

  /**
   * Show error message
   */
  showErrorMessage(message) {
    console.error('❌ Error:', message);
    // You can replace this with a better notification system
    this.showToast(message, 'error');
  }

  /**
   * Simple toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 12px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialize notification manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing notification system...');
  window.notificationManager = new NotificationManager();
});

// Auto-refresh when tab becomes visible
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && window.notificationManager) {
    window.notificationManager.loadNotifications();
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
} 