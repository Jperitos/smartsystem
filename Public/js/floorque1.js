 document.addEventListener('DOMContentLoaded', () => {
    const floorSelect = document.getElementById('floor1');  // corrected ID
    const floorImageContainer = document.getElementById('floorImageContainer1');

    let floors = [];

    function fetchFloors() {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/images/floors', true);
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            floors = JSON.parse(xhr.responseText);
            console.log('Floors loaded:', floors);
            displayFloorImage(floorSelect.value);
          } catch (e) {
            floorImageContainer.textContent = 'Error loading floors';
            console.error(e);
          }
        } else {
          floorImageContainer.textContent = 'Failed to load floors';
        }
      };
      xhr.onerror = function () {
        floorImageContainer.textContent = 'Network error loading floors';
      };
      xhr.send();
    }

    function displayFloorImage(selectedFloor) {
      console.log('Selected floor:', selectedFloor);

      let floorFound = null;
      for (let i = 0; i < floors.length; i++) {
        const floorName = floors[i].floorName;
        const match = floorName.match(/\d+/);
        const floorNumber = match ? match[0] : null;
        console.log(`Checking floor: ${floorName} (number: ${floorNumber})`);

        if (String(floorNumber) === String(selectedFloor)) {
          floorFound = floors[i];
          break;
        }
      }

      if (floorFound) {
        const imgSrc = '/' + floorFound.imagePath.replace(/\\/g, '/');
        console.log('Displaying image:', imgSrc);
        floorImageContainer.innerHTML = `
          <img src="${imgSrc}" alt="${floorFound.floorName}" style="max-width: 100%; border: 1px solid #ccc;" />
          
        `;
      } else {
        console.log('No floor found for:', selectedFloor);
        floorImageContainer.innerHTML = `<p>No image found for Floor ${selectedFloor}</p>`;
      }
    }

    floorSelect.addEventListener('change', e => {
      console.log('Dropdown changed:', e.target.value);
      displayFloorImage(e.target.value);
    });

    fetchFloors();
  });