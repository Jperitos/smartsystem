// Overview bin card navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Overview bin navigation script loaded');
  
  // Handle bin button clicks from overview section
  document.querySelectorAll('.bin-button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const binId = this.getAttribute('data-bin');
      console.log('Overview bin button clicked:', binId);
      
      if (!binId) {
        console.warn('No bin ID found on overview button');
        return;
      }
      
      // Hide all content panels
      document.querySelectorAll('.content-panel').forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
      });
      
      // Show the bins/history panel
      const historyPanel = document.getElementById('history');
      if (historyPanel) {
        historyPanel.classList.add('active');
        historyPanel.style.display = 'block';
        console.log('Switched to bins panel');
      }
      
      // Update menu item active state
      document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Find and activate the bins menu item
      const binsMenuItem = document.querySelector('.menu-item[data-target="history"]');
      if (binsMenuItem) {
        binsMenuItem.classList.add('active');
        console.log('Updated menu active state');
      }
      
      // Wait a moment for the panel to be visible, then scroll to and highlight the bin
      setTimeout(() => {
        const targetBin = document.getElementById(binId);
        if (targetBin) {
          console.log('Found target bin, scrolling and highlighting:', binId);
          
          // Scroll to the bin
          targetBin.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Highlight the bin temporarily
          targetBin.style.transition = 'all 0.3s ease';
          targetBin.style.backgroundColor = '#fff3cd';
          targetBin.style.border = '2px solid #ffc107';
          targetBin.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            targetBin.style.backgroundColor = '';
            targetBin.style.border = '';
            targetBin.style.boxShadow = '';
          }, 3000);
          
        } else {
          console.warn('Target bin not found:', binId);
        }
      }, 300); // Wait 300ms for panel transition
    });
  });
  
  console.log('Overview bin navigation setup complete');
}); 