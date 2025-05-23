// Dashboard Overview - Completed Activity Logs Display
async function loadOverviewCompletedLogs() {
  try {
    console.log('Fetching completed activity logs for overview dashboard...');
    const response = await fetch('/api/activity-logs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Overview completed activity logs fetched:', data);
    
    const table = document.querySelector('#tableBody');
    if (!table) {
      console.error('Overview dashboard table body (#tableBody) not found');
      return;
    }
    
    table.innerHTML = '';
    
    if (!data || data.length === 0) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No activity logs found</td></tr>';
      return;
    }
    
    // Sort logs by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Filter only completed/done logs
    const completedLogs = data.filter(log => {
      const status = (log.status || '').toLowerCase();
      return status === 'done' || status === 'completed';
    });

    if (completedLogs.length === 0) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No completed activity logs found</td></tr>';
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
    
    // Helper to format date and time together
    function formatDateTime(date, time) {
      if (!date) return 'N/A';
      const dateObj = new Date(date);
      const dateStr = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      const timeStr = formatTime(time);
      return `${dateStr} ${timeStr}`;
    }
    
    // Show only the most recent 10 completed logs for overview
    const recentCompletedLogs = completedLogs.slice(0, 10);
    
    recentCompletedLogs.forEach(log => {
      const tr = document.createElement("tr");

      // Column 1: Bins
      const tdBinCode = document.createElement("td");
      tdBinCode.textContent = log.bin_id?.bin_code || `Bin ${log.bin_id?._id?.slice(-3) || 'N/A'}`;
      tr.appendChild(tdBinCode);

      // Column 2: Floor
      const tdFloor = document.createElement("td");
      tdFloor.textContent = log.floor ? `Floor ${log.floor}` : (log.bin_id?.location || 'N/A');
      tr.appendChild(tdFloor);

      // Column 3: Staff
      const tdUserName = document.createElement("td");
      tdUserName.textContent = log.u_id?.name || 'N/A';
      tr.appendChild(tdUserName);

      // Column 4: Start (Date and Start Time)
      const tdStart = document.createElement("td");
      tdStart.textContent = formatDateTime(log.date, log.start_time || log.time);
      tr.appendChild(tdStart);

      // Column 5: End (Date and End Time)
      const tdEnd = document.createElement("td");
      tdEnd.textContent = formatDateTime(log.completion_date || log.date, log.end_time);
      tr.appendChild(tdEnd);

      // Column 6: Status (Green button for completed)
      const tdStatus = document.createElement("td");
      const statusButton = document.createElement("button");
      statusButton.className = 'status-done';
      statusButton.textContent = 'Done';
      statusButton.style.backgroundColor = '#4caf50';
      statusButton.style.color = 'white';
      statusButton.style.border = 'none';
      statusButton.style.padding = '4px 12px';
      statusButton.style.borderRadius = '4px';
      statusButton.style.fontSize = '12px';
      statusButton.style.fontWeight = 'bold';
      statusButton.style.cursor = 'default';
      tdStatus.appendChild(statusButton);
      tr.appendChild(tdStatus);

      table.appendChild(tr);
    });
    
    console.log(`Loaded ${recentCompletedLogs.length} completed activity logs for overview dashboard successfully`);
    
  } catch (error) {
    console.error('Error loading overview completed logs:', error);
    const table = document.querySelector('#tableBody');
    if (table) {
      table.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading completed logs. Please try again.</td></tr>';
    }
  }
}

// Initialize overview completed logs when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Dashboard completed logs script loaded...');
  
  // Load completed logs immediately if on dashboard panel
  const dashboardPanel = document.querySelector('#dashboard');
  if (dashboardPanel && dashboardPanel.classList.contains('active')) {
    loadOverviewCompletedLogs();
  }
  
  // Add event listeners for menu items to load logs when dashboard panel is activated
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      
      // Load completed logs when switching to dashboard
      if (target === 'dashboard') {
        setTimeout(() => {
          loadOverviewCompletedLogs();
        }, 100);
      }
    });
  });
  
  // Auto-refresh every 30 seconds if on dashboard
  setInterval(() => {
    const activePanel = document.querySelector('.content-panel.active');
    if (activePanel && activePanel.id === 'dashboard') {
      loadOverviewCompletedLogs();
    }
  }, 30000);
}); 