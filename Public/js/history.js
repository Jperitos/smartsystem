// Load Activity Logs
fetch('/api/activity-logs')
  .then(res => res.json())
  .then(data => {
    const table = document.querySelector('#history .staff-table tbody');
    table.innerHTML = '';
    data.forEach((log, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = index + 1;
      tr.appendChild(tdId);

      const tdBinCode = document.createElement("td");
      tdBinCode.textContent = log.bin_id?.bin_code || 'N/A';
      tr.appendChild(tdBinCode);

      const tdLocation = document.createElement("td");
      tdLocation.textContent = log.bin_id?.location || 'N/A';
      tr.appendChild(tdLocation);

      const tdUserName = document.createElement("td");
      tdUserName.textContent = log.u_id?.name || 'N/A';
      tr.appendChild(tdUserName);

      const tdDate = document.createElement("td");
      tdDate.textContent = log.date?.slice(0, 10);
      tr.appendChild(tdDate);

      const tdTime = document.createElement("td");
      tdTime.textContent = log.time;
      tr.appendChild(tdTime);

      const tdStatus = document.createElement("td");
      const statusBtn = document.createElement("button");
      statusBtn.className = "status-done";
      statusBtn.textContent = log.status;
      tdStatus.appendChild(statusBtn);
      tr.appendChild(tdStatus);

      table.appendChild(tr);
    });
  });

// Load History Logs
fetch('/api/history-logs')
  .then(res => res.json())
  .then(data => {
    const table = document.querySelector('#activity .staff-table tbody');
    table.innerHTML = '';
    data.forEach((log, index) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = index + 1;
      tr.appendChild(tdId);

      const tdUserName = document.createElement("td");
      tdUserName.textContent = log.user_name;
      tr.appendChild(tdUserName);

      const tdStatus = document.createElement("td");
      tdStatus.textContent = log.user_status;
      tr.appendChild(tdStatus);

      const tdTimeIn = document.createElement("td");
      tdTimeIn.textContent = log.time_in?.split('T')[1]?.slice(0, 5) || '';
      tr.appendChild(tdTimeIn);

      const tdTimeOut = document.createElement("td");
      tdTimeOut.textContent = log.time_out?.split('T')[1]?.slice(0, 5) || '';
      tr.appendChild(tdTimeOut);

      const tdDate = document.createElement("td");
      tdDate.textContent = log.date?.slice(0, 10);
      tr.appendChild(tdDate);

      table.appendChild(tr);
    });
  });
