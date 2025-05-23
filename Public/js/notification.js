document.addEventListener('DOMContentLoaded', () => {
  fetchNotifications();

  // Mark all as read
  document.querySelector('.mark-read')?.addEventListener('click', async () => {
    await markAllNotificationsRead();
    fetchNotifications();
  });

  // Save assignment button event listener
  document.getElementById('saveAssignmentBtn')?.addEventListener('click', saveAssignment);
});

// Fetch notifications
async function fetchNotifications() {
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const notifications = await res.json();

    const container = document.querySelector('.notifications');
    container.innerHTML = '';

    if (!notifications.length) {
      container.innerHTML = '<p style="text-align:center;color:#888;">No notifications</p>';
      return;
    }

    notifications.forEach(notif => {
      const div = document.createElement('div');
      div.className = 'notification' + (notif.read ? '' : ' unread');

      div.innerHTML = `
        <img src="${notif.avatar || '/image/profile.jpg'}" alt="Avatar" />
        <div class="message">
          <strong>@${notif.sender}</strong> ${notif.message}
          <div class="time">${new Date(notif.createdAt).toLocaleString()}</div>
        </div>
        <div class="meta">
          <p>${timeAgo(notif.createdAt)}</p>
          ${!notif.read ? '<span class="dot"></span>' : ''}
        </div>
      `;

      container.appendChild(div);
    });
  } catch (err) {
    console.error('Notification fetch error:', err);
  }
}

// Utility: Time ago formatter
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

// Mark notifications as read
async function markAllNotificationsRead() {
  try {
    const res = await fetch('/api/notifications/mark-all-read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to mark notifications as read');
  } catch (err) {
    console.error('Mark read error:', err);
  }
}

// Save assignment and notify janitor
async function saveAssignment() {
  const staffId = document.getElementById('staffSelect')?.value;
  const message = document.getElementById('message')?.value;
  const binLevel = document.getElementById('binLevelSpan')?.textContent;
  const floor = document.getElementById('floorSpan')?.textContent;

  if (!staffId || !message || !binLevel || !floor) {
    alert('Please fill all assignment fields.');
    return;
  }

  try {
    const assignment = {
      staffId,
      message,
      binLevel,
      floor,
      startTime: new Date().toISOString()
    };

    const assignRes = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment)
    });

    if (!assignRes.ok) throw new Error('Failed to save assignment');

    // Send notification
    const notifRes = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverId: staffId,
        sender: 'headstaff',
        avatar: '/image/profile.jpg',
        message: `You have been assigned a task on Floor ${floor} for Bin Level ${binLevel}.`
      })
    });

    if (!notifRes.ok) throw new Error('Failed to send notification');

    // Show success
    const successMsg = document.getElementById('success-message');
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 3000);
  } catch (err) {
    console.error('Assignment save error:', err);
    alert('Failed to save assignment.');
  }
}
