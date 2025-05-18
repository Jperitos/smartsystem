  function calculateAge(birthdateStr) {
    if (!birthdateStr) return 'N/A';
    const birthdate = new Date(birthdateStr);
    const diffMs = Date.now() - birthdate.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  fetch('/api/users')
    .then(res => res.json())
    .then(users => {
      const tbody = document.getElementById('staffTableBody');
      tbody.innerHTML = ''; // clear existing rows if any

      users.forEach((user, index) => {
  const info = user.info || {};

  const tr = document.createElement('tr');

  // Staff ID — use index + 1 instead of user._id
  const tdId = document.createElement('td');
  tdId.textContent = index + 1;
  tr.appendChild(tdId);

  // Name
  const tdName = document.createElement('td');
  tdName.textContent = user.name || 'N/A';
  tr.appendChild(tdName);

  // Age
  const tdAge = document.createElement('td');
  tdAge.textContent = calculateAge(info.birthdate);
  tr.appendChild(tdAge);

  // Address
  const tdAddress = document.createElement('td');
  tdAddress.textContent = info.address || 'N/A';
  tr.appendChild(tdAddress);

  // Contact No.
  const tdContact = document.createElement('td');
  tdContact.textContent = info.contact || 'N/A';
  tr.appendChild(tdContact);

  // Assigned Floor
  const tdAssignArea = document.createElement('td');
  tdAssignArea.textContent = info.assign_area || 'N/A';
  tr.appendChild(tdAssignArea);

  // Status
  const tdStatus = document.createElement('td');
  tdStatus.textContent = user.status || 'N/A';
  tr.appendChild(tdStatus);

  // Action (View button)
  const tdAction = document.createElement('td');
const viewBtn = document.createElement('button');
viewBtn.textContent = 'View';
viewBtn.classList.add('viewing', 'btn-view'); 
tdAction.appendChild(viewBtn);
tr.appendChild(tdAction);

  tbody.appendChild(tr);
});
    })
    .catch(err => {
      console.error('Error fetching users:', err);
    });