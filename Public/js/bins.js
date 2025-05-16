document.querySelectorAll('.bin-button').forEach(button => {
  button.addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default link behavior

    const binId = this.getAttribute('data-bin');
    const targetPanelId = 'history';

    // Hide all content panels
    document.querySelectorAll('.content-panel').forEach(panel => {
      panel.style.display = 'none';
    });

    // Show the history panel (bins tab)
    const historyPanel = document.getElementById(targetPanelId);
    if (historyPanel) {
      historyPanel.style.display = 'block';
    }

    // Optional: Update active menu highlight (if needed)
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });

    // Scroll to the specific bin after history tab becomes visible
    setTimeout(() => {
      const targetBin = document.getElementById(binId);
      if (targetBin) {
        targetBin.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetBin.style.backgroundColor = '#ffffcc';
        setTimeout(() => {
          targetBin.style.backgroundColor = '';
        }, 2000);
      }
    }, 300);
  });
});
