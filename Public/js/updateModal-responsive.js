document.addEventListener('DOMContentLoaded', function () {
  // Attach click event to all buttons with class 'update-btn3'
  document.querySelectorAll('.update-btn3').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      const modal = document.getElementById('updateModal');
      if (modal && document.getElementById('collectionId')) {
        document.getElementById('collectionId').value = id;
        
        // Show modal with responsive flexbox display
        modal.style.display = 'flex';
        modal.classList.add('show');
        
        // Add smooth entrance animation
        requestAnimationFrame(() => {
          modal.style.opacity = '1';
        });
      }
    });
  });

  // Close modal when close icon is clicked
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      closeModal();
    });
  }

  // Close modal when clicking outside the modal content
  window.addEventListener('click', function (event) {
    const modal = document.getElementById('updateModal');
    if (modal && event.target === modal) {
      closeModal();
    }
  });

  // ESC key to close modal
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  // Function to close modal with animation
  function closeModal() {
    const modal = document.getElementById('updateModal');
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.style.opacity = '';
      }, 200);
    }
  }

  // Handle status change to show/hide end time field
  const statusSelect = document.getElementById('statusUpdate');
  const endTimeGroup = document.getElementById('endTimeGroup');
  
  if (statusSelect && endTimeGroup) {
    statusSelect.addEventListener('change', function() {
      if (this.value === 'completed' || this.value === 'done') {
        endTimeGroup.style.display = 'block';
      } else {
        endTimeGroup.style.display = 'none';
      }
    });
  }

  // Handle form submission
  const updateForm = document.getElementById('updateForm');
  if (updateForm) {
    updateForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      const submitBtn = updateForm.querySelector('.update-btn');
      const originalText = submitBtn.textContent;
      
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Updating...';
      submitBtn.style.cursor = 'not-allowed';
      
      const id = document.getElementById('collectionId').value;
      const status = document.getElementById('statusUpdate').value;
      const notes = document.getElementById('notes').value;
      const endTime = document.getElementById('endTime').value;
      
      if (!id) {
        alert('Error: No collection ID found');
        resetSubmitButton();
        return;
      }
      
      try {
        console.log('Updating activity log:', { id, status, notes, endTime });
        
        // Prepare the update data
        const updateData = {
          status: status,
          notes: notes
        };
        
        // Add end_time if status is completed and time is provided
        if ((status === 'completed' || status === 'done')) {
          if (endTime) {
            updateData.end_time = endTime;
          } else {
            updateData.end_time = new Date().toTimeString().split(' ')[0];
          }
        }
        
        // Make the API call
        const response = await fetch(`/api/activity-logs/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const updatedLog = await response.json();
        console.log('Activity log updated successfully:', updatedLog);
        
        // Show success message with better styling
        showSuccessMessage('Task status updated successfully!');
        
        // Close the modal after short delay
        setTimeout(() => {
          closeModal();
        }, 1500);
        
        // Reset form
        updateForm.reset();
        if (endTimeGroup) endTimeGroup.style.display = 'none';
        
        // Refresh the activity logs table if the function exists
        if (typeof window.loadJanitorActivityLogs === 'function') {
          window.loadJanitorActivityLogs();
        } else if (typeof loadActivityLogs === 'function') {
          loadActivityLogs();
        }
        
      } catch (error) {
        console.error('Error updating activity log:', error);
        showErrorMessage('Error updating task status: ' + error.message);
      } finally {
        resetSubmitButton();
      }
      
      function resetSubmitButton() {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.cursor = 'pointer';
      }
    });
  }
  
  // Helper function to show success message
  function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-success';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10001;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
  
  // Helper function to show error message
  function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-error';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10001;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
    
    // Remove after 5 seconds (errors need more time to read)
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }
}); 