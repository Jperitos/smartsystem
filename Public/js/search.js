document.addEventListener('DOMContentLoaded', () => {
  // Activity Date Filter - auto filter on input change (no button)
  const activityDateFilter = document.getElementById('activityDateFilter');
  const activityTableBody = document.getElementById('activityTableBody');

  if (activityDateFilter && activityTableBody) {
    activityDateFilter.addEventListener('input', () => {
      const selectedDate = activityDateFilter.value; // YYYY-MM-DD format
      const rows = activityTableBody.querySelectorAll('tr');

      rows.forEach(row => {
        const dateCell = row.cells[3]?.innerText.trim(); // Date is at index 3

        if (!selectedDate) {
          row.style.display = '';
        } else if (dateCell === selectedDate) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // History Date Filter - auto filter on input change (no button)
  const historyDateFilter = document.getElementById('historyDateFilter');
  const historyTableBody = document.getElementById('historyTableBody');

  if (historyDateFilter && historyTableBody) {
    historyDateFilter.addEventListener('input', () => {
      const selectedDate = historyDateFilter.value; // YYYY-MM-DD format
      const rows = historyTableBody.querySelectorAll('tr');

      rows.forEach(row => {
        const dateCell = row.cells[5]?.textContent.trim(); // Date at index 5

        if (!selectedDate) {
          row.style.display = '';
        } else if (dateCell === selectedDate) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Bin Search filter - on input
  const binSearch = document.getElementById('binSearch');
  const staffTableBody = document.getElementById('staffTableBody');

  if (binSearch && staffTableBody) {
    binSearch.addEventListener('input', () => {
      const searchValue = binSearch.value.toLowerCase();
      const rows = staffTableBody.querySelectorAll('tr');

      rows.forEach(row => {
        const nameCell = row.cells[1]?.innerText.toLowerCase() || '';
        row.style.display = nameCell.startsWith(searchValue) ? '' : 'none';
      });
    });
  }
});
