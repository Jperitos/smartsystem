  const floorSelect = document.getElementById('floorSelect');
  const floorImage = document.getElementById('floorImage');
  const floorTitle = document.getElementById('floorTitle');

  floorSelect.addEventListener('change', function () {
    const selectedFloor = this.value;

    // Update floor image
    floorImage.src = `/image/Floor Plan ${selectedFloor}.png`;

    // Update title
    floorTitle.textContent = `Floor ${selectedFloor}`;

    // Show the corresponding floor group
    const floorGroups = document.querySelectorAll('.floor-group');
    floorGroups.forEach(group => {
      if (group.getAttribute('data-floor') === selectedFloor) {
        group.style.display = 'block';
      } else {
        group.style.display = 'none';
      }
    });
  });

