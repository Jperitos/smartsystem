document.addEventListener('DOMContentLoaded', () => {
  const floorDropdown = document.getElementById('floor1');
  const binButtons = document.querySelectorAll('.bin-button');

  floorDropdown.addEventListener('change', () => {
    const floorNumber = floorDropdown.value;
    updateBins(floorNumber);
  });

  function updateBins(floor) {
    binButtons.forEach((btn, index) => {
      const newBinId = `S${floor}Bin${index + 1}`;
      const progressSpan = btn.querySelector('.progress');
      const binText = btn.querySelector('p');

      // Update bin label and data-bin attribute
      progressSpan.setAttribute('data-bin', newBinId);
      btn.setAttribute('data-bin', newBinId);
      binText.innerHTML = `${newBinId} <span class="progress ${progressSpan.classList[1]}" data-bin="${newBinId}">${progressSpan.textContent}</span>`;

      // Update progress bar class (optional, if color depends on data)
      btn.querySelector('.progress-bar').className = `progress-bar ${progressSpan.classList[1]}`;
    });
  }

  // Initialize bins on load
  updateBins(floorDropdown.value);
});
