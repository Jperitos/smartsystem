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
});

// bins details
document.querySelectorAll('.bin-info-card').forEach(card => {
  card.addEventListener('click', function () {
    const binId = this.dataset.id || this.id; // Use data-id if preferred
    const binLevel = this.dataset.level || 'N/A';
    const binFloor = this.dataset.floor || 'N/A';

    // Show modal
    const modal = document.getElementById('binModal');
    modal.style.display = 'flex';

    // Update title
    document.getElementById('modal-title').textContent = `Details for Bin ${binId}`;

    // Update content
    const bins = modal.querySelector('.bins');
    bins.innerHTML = `
      <div>Bin Level: ${binLevel}</div>
      <div>Floor: ${binFloor}</div>
    `;

    // Optionally reset or fill task/staff/etc.
    document.getElementById('message').value = '';
    document.getElementById('floor').selectedIndex = 0;
  });
});

// Close modal on "X"
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('binModal').style.display = 'none';
});

// Close modal if clicked outside content
window.addEventListener('click', function (e) {
  const modal = document.getElementById('binModal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
