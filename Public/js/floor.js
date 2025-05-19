const floorSelect = document.getElementById('floorSelect');
const floorImage = document.getElementById('floorImage');

floorSelect.addEventListener('change', function () {
  const selectedFloor = this.value;
  floorImage.src = `../image/Floor Plan ${selectedFloor}.png`;
});
