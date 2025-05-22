document.addEventListener('DOMContentLoaded', () => {
  const binSearch = document.getElementById('binSearch');
  const sortBtn = document.getElementById('sortBtn');
  const table = document.querySelector('#staffs table.table2');
  const tbody = table.tBodies[0]; // Get tbody element
  let sortAsc = true; // Toggle for sorting order

  // Search functionality - filter by Assign Floor column (index 1)
  binSearch.addEventListener('input', () => {
    const searchValue = binSearch.value.toLowerCase();
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
      const floorCell = row.cells[1]?.textContent.toLowerCase() || '';
      row.style.display = floorCell.includes(searchValue) ? '' : 'none';
    });
  });

  // Sort functionality - toggles sort by Assign Floor column (index 1)
  sortBtn.addEventListener('click', () => {
    const rowsArray = Array.from(tbody.querySelectorAll('tr'));

    rowsArray.sort((a, b) => {
      const floorA = a.cells[1]?.textContent.toLowerCase() || '';
      const floorB = b.cells[1]?.textContent.toLowerCase() || '';

      if (floorA < floorB) return sortAsc ? -1 : 1;
      if (floorA > floorB) return sortAsc ? 1 : -1;
      return 0;
    });

    // Append rows in sorted order
    rowsArray.forEach(row => tbody.appendChild(row));

    // Toggle sorting order for next click
    sortAsc = !sortAsc;
  });
});
