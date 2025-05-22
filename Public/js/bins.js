document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.bin-button').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();

      const binId = this.getAttribute('data-bin');
      const targetPanelId = 'history';
      const historyPanel = document.getElementById(targetPanelId);

      if (!binId || !historyPanel) {
        console.warn('Missing bin ID or history panel');
        return;
      }

      // Hide all content panels
      document.querySelectorAll('.content-panel').forEach(panel => {
        panel.style.display = 'none';
      });

      // Show history panel
      historyPanel.style.display = 'block';

      // Optional: update menu highlight
      document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
      });

      // Retry logic: wait for bin element to appear
      let retries = 0;
      const maxRetries = 10;
      const interval = setInterval(() => {
        const targetBin = document.getElementById(binId);
        if (targetBin) {
          clearInterval(interval);
          targetBin.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetBin.style.transition = 'background-color 0.3s ease';
          targetBin.style.backgroundColor = '#ffffcc';
          setTimeout(() => {
            targetBin.style.backgroundColor = '';
          }, 2000);
        } else if (++retries > maxRetries) {
          clearInterval(interval);
          console.warn('Bin element not found after waiting:', binId);
        }
      }, 200); // Try every 200ms
    });
  });
  
  // Add back bin details click handlers as a backup
  document.querySelectorAll('.bin-info-card').forEach(card => {
    card.addEventListener('click', function() {
      const binId = this.id; // e.g., S1Bin1
      const binDetails = this.querySelector('.bin-details');
      
      // Get bin level from span elements
      const binAvgSpan = this.querySelector('[id$="-avg"]');
      const binLevel = binAvgSpan ? binAvgSpan.textContent.trim() : '-';
      
      // Get floor from data attribute
      const binFloor = binDetails.dataset.floor || '1';

      // Show modal
      const modal = document.getElementById('binModal');
      if (!modal) return;
      
      // Reset position to fixed to ensure proper centering
      modal.style.position = 'fixed';
      modal.style.display = 'flex';
      modal.dataset.currentBinId = binId;

      // Update modal contents
      document.getElementById('modal-title').textContent = `Details for ${binId}`;
      document.getElementById('binLevelSpan').textContent = binLevel;
      document.getElementById('floorSpan').textContent = `Floor ${binFloor}`;
      
      // Reset message field
      const messageField = document.getElementById('message');
      if (messageField) messageField.value = '';
    });
  });
});

// Close modal on "X"
document.querySelector('.close')?.addEventListener('click', () => {
  const modal = document.getElementById('binModal');
  if (modal) modal.style.display = 'none';
});

// Close modal if clicked outside content
window.addEventListener('click', function (e) {
  const modal = document.getElementById('binModal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
