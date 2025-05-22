document.addEventListener('DOMContentLoaded', () => {
  const floorSelect = document.getElementById('floor1');
  const binLabels = document.querySelectorAll('.bin-status p');

  function updateBinLabels(floor) {
    binLabels.forEach((label, index) => {
      const binNum = index + 1;
      const binId = `S${floor}Bin${binNum}`;
      const span = label.querySelector('span');
      const progress = span ? span.getAttribute('data-progress') : '0';
      const colorClass = span ? span.classList[1] : 'green';

      // Update label content
      label.innerHTML = `${binId} <span class="progress ${colorClass}" data-progress="${progress}">${progress}%</span>`;
    });
  }

  // Update on load and on change
  updateBinLabels(floorSelect.value);
  floorSelect.addEventListener('change', (e) => {
    updateBinLabels(e.target.value);
  });
});

