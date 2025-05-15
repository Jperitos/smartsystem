// Utility function to safely get element by ID
function safeGetElement(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element with id "${id}" not found.`);
  }
  return el;
}

// Utility function to safely add event listener if element exists
function safeAddEventListener(id, event, handler) {
  const el = safeGetElement(id);
  if (el) {
    el.addEventListener(event, handler);
  }
}

// Converts cm distance to fill percentage (11cm = 100%, 35cm = 0%)
function getHeightPercentage(distance) {
  const minDistance = 11;
  const maxDistance = 35;
  if (distance === null || distance === undefined) return 0;
  if (distance <= minDistance) return 100;
  if (distance >= maxDistance) return 0;
  return Math.round(((maxDistance - distance) / (maxDistance - minDistance)) * 100);
}

function updateBinDataRobust(data) {
  if (!data) {
    console.warn("No bin data available to update.");
    return;
  }
  const bins = ['bin1', 'bin2', 'bin3'];
  bins.forEach((bin) => {
    const weightEl = safeGetElement(`s1${bin}-weight`) || safeGetElement(`${bin}-weight`);
    const heightEl = safeGetElement(`s1${bin}-height`) || safeGetElement(`${bin}-height`);
    const avgEl = safeGetElement(`s1${bin}-avg`) || safeGetElement(`${bin}-avg`);

    if (weightEl && typeof data[bin]?.weight === 'number') {
      weightEl.textContent = data[bin].weight.toFixed(2);
    }

    if (heightEl && typeof data[bin]?.height === 'number') {
      const cm = data[bin].height.toFixed(0);
      const percent = getHeightPercentage(data[bin].height);
      // Show both cm and percentage in height span
      heightEl.textContent = `${cm} cm (${percent})`;
    }

    if (avgEl && typeof data[bin]?.avg === 'number') {
      avgEl.textContent = data[bin].avg.toFixed(2);
    }
  });
}

// Converts weight in kg to percentage of max weight
function getWeightPercentage(weight, maxWeight = 150) {
  if (weight === null || weight === undefined) return 0;
  if (weight >= maxWeight) return 100;
  if (weight <= 0) return 0;
  return Math.round((weight / maxWeight) * 100);
}

function updateBinDataRobust(data) {
  if (!data) {
    console.warn("No bin data available to update.");
    return;
  }
  const bins = ['bin1', 'bin2', 'bin3'];
  bins.forEach((bin) => {
    const weightEl = safeGetElement(`s1${bin}-weight`) || safeGetElement(`${bin}-weight`);
    const heightEl = safeGetElement(`s1${bin}-height`) || safeGetElement(`${bin}-height`);
    const avgEl = safeGetElement(`s1${bin}-avg`) || safeGetElement(`${bin}-avg`);

    if (weightEl && typeof data[bin]?.weight === 'number') {
      const kg = data[bin].weight.toFixed(2);
      const percent = getWeightPercentage(data[bin].weight);
      weightEl.textContent = `${kg} kg (${percent})`;
    }

    if (heightEl && typeof data[bin]?.height === 'number') {
      const cm = data[bin].height.toFixed(0);
      const percent = getHeightPercentage(data[bin].height);
      heightEl.textContent = `${cm} cm (${percent})`;
    }

    if (avgEl && typeof data[bin]?.avg === 'number') {
      avgEl.textContent = data[bin].avg.toFixed(2);
    }
  });
}


// Wait until DOM is fully loaded before running scripts that query DOM
document.addEventListener('DOMContentLoaded', () => {
  // Example usage: periodically fetch data and update safely
  async function fetchAndUpdate() {
    try {
      const response = await fetch('http://localhost:9000/api/latest-data');
      if (!response.ok) throw new Error('Network response not OK');
      const data = await response.json();

      if (data.message) {
        console.log("No bin data yet:", data.message);
        return;
      }

      updateBinDataRobust(data);
    } catch (error) {
      console.error("Error fetching or updating bin data:", error);
    }
  }

  // Run immediately and then every 3 seconds
  fetchAndUpdate();
  setInterval(fetchAndUpdate, 3000);

  // Example of safe event listener add for logout button
  safeAddEventListener('logoutBtn', 'click', (e) => {
    e.preventDefault();
    console.log("Logout button clicked. Implement logout logic here.");
    // Add actual logout logic or redirect here
  });

  // You can add more safeAddEventListener calls here for other buttons or interactive elements.
});