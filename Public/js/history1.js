document.addEventListener('DOMContentLoaded', () => {
  // Inject modal into the body
  const modalHTML = `
    <div id="updateModal" class="modal-task" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; overflow:auto; background-color:rgba(0,0,0,0.4);">
      <div class="modal-content" style="background-color:#fff; margin:10% auto; padding:20px; border:1px solid #888; width:400px; border-radius:8px; position:relative;">
        <span class="close" id="closeModal" style="position:absolute; top:10px; right:20px; font-size:28px; font-weight:bold; cursor:pointer;">&times;</span>
        <h2>Update Collection Status</h2>
        <form id="updateForm">
          <input type="hidden" id="collectionId" name="assignment_id" />
          <div class="form-group">
            <label>Task</label>
            <p id="taskDescription" class="task-detail"></p>
          </div>
          <div class="form-group">
            <label>Location</label>
            <p id="taskLocation" class="task-detail"></p>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="statusUpdate" name="status" required>
              <option value="assigned">Done</option>
              <option value="inprogress">Pending</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea id="notes" name="notes" placeholder="Provide additional details about this collection..."></textarea>
          </div>
          <div class="modal-actions" style="text-align:right; margin-top:20px;">
            <button type="submit" class="update-btn" style="padding:8px 16px; background:#007BFF; color:white; border:none; border-radius:4px; cursor:pointer;">Submit Update</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Load and display logs
  loadActivityLogs();

  // Modal close events
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('updateModal').style.display = 'none';
  });
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('updateModal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Form submission
  document.getElementById('updateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const logId = document.getElementById('collectionId').value;
    const updatedStatus = document.getElementById('statusUpdate').value;
    const notes = document.getElementById('notes').value;

    try {
      const res = await fetch(`/api/activity-logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedStatus, notes }),
      });
      if (!res.ok) throw new Error('Update failed');

      alert('Log updated successfully!');
      document.getElementById('updateModal').style.display = 'none';
      loadActivityLogs();
    } catch (err) {
      alert('Error updating log: ' + err.message);
    }
  });
});

async function loadActivityLogs() {
  try {
    const currentUserName = encodeURIComponent('Juan Dela Cruz');
    const response = await fetch(`/api/activity-logs?staff=${currentUserName}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const table = document.querySelector('#activityTableBody');
    if (!table) return console.error('Activity logs table not found');

    table.innerHTML = '';

    if (!data || data.length === 0) {
      table.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">No activity logs assigned to you</td></tr>';
      return;
    }

    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    const filteredData = data.filter(log => {
      const status = (log.status || '').toLowerCase();
      return ['pending', 'assigned', 'inprogress'].includes(status);
    });

    if (filteredData.length === 0) {
      table.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">No activity logs with valid statuses</td></tr>';
      return;
    }

    function formatTime(timeStr) {
      if (!timeStr) return 'N/A';
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = ((h + 11) % 12) + 1;
      return `${hour12}:${minutes} ${ampm}`;
    }

    function displayStatus(rawStatus) {
      const status = rawStatus?.toLowerCase();
      if (status === 'assigned' || status === 'pending') {
        return { label: 'Pending', color: 'rgb(255, 178, 35)' };
      }
      if (status === 'inprogress') {
        return { label: 'In Progress', color: 'green' };
      }
      return { label: status.charAt(0).toUpperCase() + status.slice(1), color: 'black' };
    }

    let counter = 1001;
    filteredData.forEach(log => {
      const tr = document.createElement('tr');

      tr.innerHTML += `<td style="vertical-align: middle;">${counter++}</td>`;
      tr.innerHTML += `<td style="vertical-align: middle;">${log.bin_id?.bin_code || `Bin ${log.bin_id?._id?.slice(-3) || 'N/A'}`}</td>`;
      tr.innerHTML += `<td style="vertical-align: middle;">${log.floor ? `Floor ${log.floor}` : (log.bin_id?.location || 'N/A')}</td>`;
      tr.innerHTML += `<td style="vertical-align: middle;">${log.u_id?.name || 'N/A'}</td>`;
      const formattedDate = log.date ? new Date(log.date).toLocaleDateString('en-US') : 'N/A';
      tr.innerHTML += `<td style="vertical-align: middle;">${formattedDate}</td>`;
      tr.innerHTML += `<td style="vertical-align: middle;">${formatTime(log.start_time || log.time)}</td>`;
      tr.innerHTML += `<td style="vertical-align: middle;">${formatTime(log.end_time)}</td>`;
      const statusObj = displayStatus(log.status);
      tr.innerHTML += `<td style="vertical-align: middle; color: ${statusObj.color}; font-weight: bold;">${statusObj.label}</td>`;

      const tdAction = document.createElement('td');
      tdAction.style.verticalAlign = 'middle';
      const updateBtn = document.createElement('button');
      updateBtn.textContent = 'Update';
      updateBtn.className = 'activity-update-btn';
      updateBtn.style.padding = '5px 10px';
      updateBtn.style.cursor = 'pointer';

      updateBtn.addEventListener('click', () => {
        const modal = document.getElementById('updateModal');
        modal.style.display = 'block';

        document.getElementById('collectionId').value = log._id || '';
        document.getElementById('taskDescription').textContent = log.bin_id?.bin_code || `Bin ${log.bin_id?._id?.slice(-3) || 'N/A'}`;
        document.getElementById('taskLocation').textContent = log.floor ? `Floor ${log.floor}` : (log.bin_id?.location || 'N/A');
        document.getElementById('statusUpdate').value = (log.status || 'assigned').toLowerCase();
        document.getElementById('notes').value = log.notes || '';
      });

      tdAction.appendChild(updateBtn);
      tr.appendChild(tdAction);
      table.appendChild(tr);
    });

  } catch (err) {
    console.error('Error loading activity logs:', err);
    const table = document.querySelector('#activityTableBody');
    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 20px; color: #d32f2f;">Error loading activity logs. Please try again.</td>
        </tr>`;
    }
  }
}
