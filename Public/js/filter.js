const searchInput = document.getElementById('binSearch');
const sortBtn = document.getElementById('sortBtn');
const staffBody = document.getElementById('staffBody');

searchInput.addEventListener('keyup', () => {
  const query = searchInput.value.toLowerCase();
  const rows = staffBody.getElementsByClassName('staff-row');

  for (let row of rows) {
    const fullName = row.cells[2].innerText.toLowerCase(); // 3rd column: Name
    const firstName = fullName.split(' ')[0]; // get first word as first name
    const firstLetter = firstName.charAt(0); // first letter of first name

    // Show row if query matches the first letter, or if query is empty
    row.style.display = !query || firstLetter === query ? '' : 'none';
  }
});

// 🔃 SORT by Staff ID
sortBtn.addEventListener('click', () => {
  const rows = Array.from(staffBody.getElementsByClassName('staff-row'));

  rows.sort((a, b) => {
    const idA = parseInt(a.cells[0].innerText); // 1st column: ID
    const idB = parseInt(b.cells[0].innerText);
    return idA - idB;
  });

  // Clear and re-append in sorted order
  staffBody.innerHTML = '';
  rows.forEach(row => staffBody.appendChild(row));
});
