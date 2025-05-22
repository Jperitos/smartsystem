const searchInput3 = document.getElementById('binSearch3');
const staffTableBody = document.getElementById('staffTableBody');

searchInput3.addEventListener('keyup', () => {
  const query = searchInput3.value.toLowerCase();
  const rows = staffTableBody.getElementsByTagName('tr');

  for (let row of rows) {
    const nameCell = row.cells[1]; // 2nd column: Name
    if (nameCell) {
      const name = nameCell.innerText.toLowerCase();
      // Check if the name starts with the query
      row.style.display = !query || name.startsWith(query) ? '' : 'none';
    }
  }
});
