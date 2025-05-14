// Tab pane logic
document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
  
      // Hide all tab panes
      document.querySelectorAll('.tab-pane').forEach(pane => pane.style.display = 'none');
  
      // Show the selected tab pane
      const tabId = btn.getAttribute('data-tab');
      const activePane = document.getElementById(tabId);
      if (activePane) {
        activePane.style.display = 'block';
      }
    });
  });
  
  // Optional: Keep the default tab visible
  document.addEventListener("DOMContentLoaded", () => {
    const defaultPane = document.querySelector('.tab-pane.active');
    if (defaultPane) {
      defaultPane.style.display = 'block';
    }
  });
  