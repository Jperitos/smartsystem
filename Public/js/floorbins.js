document.addEventListener('DOMContentLoaded', function () {
  const floorSelect = document.getElementById('floors');
  const floorTitle = document.getElementById('floorTitle');

  const binDetails = document.querySelectorAll('.bin-details');

  function updateFloorAndBins(floorNum) {
    // Update floor title header
    floorTitle.textContent = `Floor ${floorNum}`;

    // Update bin names and IDs based on floor
    binDetails.forEach((detailsDiv, index) => {
      const binNum = index + 1;
      const binLabel = `S${floorNum}Bin${binNum}`;

      // Update data-floor attribute
      detailsDiv.setAttribute('data-floor', floorNum);

      // Update bin name <strong> tag
      const strongTag = detailsDiv.querySelector('strong');
      if (strongTag) {
        strongTag.textContent = binLabel;
      }

      // Optional: Also update the ID of the parent .bin-info-card div
      const parentCard = detailsDiv.closest('.bin-info-card');
      if (parentCard) {
        parentCard.id = binLabel;
      }

      // Update span IDs if needed (for JS access)
      const avg = detailsDiv.querySelector(`[id$="-avg"]`);
      const height = detailsDiv.querySelector(`[id$="-height"]`);
      const weight = detailsDiv.querySelector(`[id$="-weight"]`);

      if (avg) avg.id = `${binLabel.toLowerCase()}-avg`;
      if (height) height.id = `${binLabel.toLowerCase()}-height`;
      if (weight) weight.id = `${binLabel.toLowerCase()}-weight`;
    });
  }

  // On page load
  updateFloorAndBins(floorSelect.value);

  // On dropdown change
  floorSelect.addEventListener('change', (e) => {
    updateFloorAndBins(e.target.value);
  });
});
