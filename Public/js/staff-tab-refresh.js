// Staff dashboard tab refresh functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Staff tab refresh script loaded');
  
  // Find the Collection tab menu item
  const collectionMenuItem = document.querySelector('.menu-item[data-target="staffs"]');
  
  if (collectionMenuItem) {
    console.log('Collection tab menu item found');
    
    // Add click listener to refresh activity logs when Collection tab is clicked
    collectionMenuItem.addEventListener('click', function() {
      console.log('Collection tab clicked - refreshing activity logs');
      
      // Small delay to ensure tab is switched before refreshing
      setTimeout(() => {
        if (typeof window.loadActivityLogs === 'function') {
          console.log('Refreshing activity logs for Collection tab');
          window.loadActivityLogs();
        } else if (typeof loadActivityLogs === 'function') {
          console.log('Refreshing activity logs using global function');
          loadActivityLogs();
        } else {
          console.warn('loadActivityLogs function not available');
        }
      }, 100);
    });
  } else {
    console.warn('Collection tab menu item not found');
  }
  
  // Also refresh when the page first loads if we're on the Collection tab
  const currentTab = document.querySelector('.content-panel.active');
  if (currentTab && currentTab.id === 'staffs') {
    console.log('Starting on Collection tab - loading activity logs');
    setTimeout(() => {
      if (typeof window.loadActivityLogs === 'function') {
        window.loadActivityLogs();
      } else if (typeof loadActivityLogs === 'function') {
        loadActivityLogs();
      }
    }, 500);
  }
}); 