function updateProgressBars(data) {
    data.forEach((sensorData) => {
      const binId = sensorData.data_id.split('_')[1];
      const fillLevel = sensorData.fillLevel;
      console.log(`Bin ${binId} - Fill Level: ${fillLevel}%`);
  
      const progressBar = document.querySelector(`.progress-bar[data-progress="${binId}"]`);
      const progressText = document.querySelector(`.progress-text[data-progress="${binId}"]`);
  
      if (progressBar && progressText) {
        progressBar.style.width = `${fillLevel}%`;
        progressText.textContent = `${fillLevel}%`;
      } else {
        console.warn(`Elements not found for binId ${binId}`);
      }
    });
  }
  