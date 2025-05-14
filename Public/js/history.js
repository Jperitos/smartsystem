// Load Activity Logs
fetch('/api/activity-logs')
  .then(res => res.json())
  .then(data => {
    const table = document.querySelector('#history .staff-table tbody');
    table.innerHTML = '';
    data.forEach(log => {
      const row = `
        <tr>
          <td>${log.bin_id?.bin_code || 'N/A'}</td>
          <td>${log.bin_id?.location || 'N/A'}</td>
          <td>${log.u_id?.name || 'N/A'}</td>
          <td>${log.date?.slice(0, 10)}</td>
          <td>${log.time}</td>
          <td><button class="status-done">${log.status}</button></td>
        </tr>
      `;
      table.innerHTML += row;
    });
  });

// Load History Logs
fetch('/api/history-logs')
  .then(res => res.json())
  .then(data => {
    const table = document.querySelector('#activity .staff-table tbody');
    table.innerHTML = '';
    data.forEach(log => {
      const row = `
        <tr>
          <td>${log.user_name}</td>
          <td>${log.user_status}</td>
          <td>${log.time_in?.split('T')[1]?.slice(0,5) || ''}</td>
          <td>${log.time_out?.split('T')[1]?.slice(0,5) || ''}</td>
          <td>${log.date?.slice(0,10)}</td>
        </tr>
      `;
      table.innerHTML += row;
    });
  });
