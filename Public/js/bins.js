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
  
    // Note: Bin card click handlers are handled by addtask.js to avoid conflicts
});

// Close modal on "X"
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.querySelector('#binModal .close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      console.log('Closing modal via close button');
      const modal = document.getElementById('binModal');
      if (modal) modal.style.display = 'none';
    });
  }
});

// Close modal if clicked outside content
window.addEventListener('click', function (e) {
  const modal = document.getElementById('binModal');
  if (e.target === modal) {
    console.log('Closing modal via outside click');
    modal.style.display = 'none';
  }
}); 