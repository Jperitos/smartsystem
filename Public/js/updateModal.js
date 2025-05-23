document.addEventListener('DOMContentLoaded', function () {
  // Attach click event to all buttons with class 'update-btn3'
  document.querySelectorAll('.update-btn3').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      const modal = document.getElementById('updateModal');
      if (modal && document.getElementById('collectionId')) {
        document.getElementById('collectionId').value = id;
        modal.style.display = 'block';
      }
    });
  });

  // Close modal when close icon is clicked
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      const modal = document.getElementById('updateModal');
      if (modal) modal.style.display = 'none';
    });
  }

  // Close modal when clicking outside the modal content
  window.addEventListener('click', function (event) {
    const modal = document.getElementById('updateModal');
    if (modal && event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Handle form submission
  const updateForm = document.getElementById('updateForm');
  if (updateForm) {
    updateForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      const id = document.getElementById('collectionId').value;
      const status = document.getElementById('statusUpdate').value;
      const notes = document.getElementById('notes').value;
      
      if (!id) {
        alert('Error: No collection ID found');
        return;
      }
      
      try {
        console.log('Updating activity log:', { id, status, notes });
        
        // Prepare the update data
        const updateData = {
          status: status,
          notes: notes
        };
        
        // Add end_time if status is completed
        if (status === 'completed' || status === 'done') {
          updateData.end_time = new Date().toTimeString().split(' ')[0];
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
        
        // Show success message
        alert('Task status updated successfully!');
        
        // Close the modal
        const modal = document.getElementById('updateModal');
        if (modal) modal.style.display = 'none';
        
        // Refresh the activity logs table if the function exists
        if (typeof window.loadJanitorActivityLogs === 'function') {
          window.loadJanitorActivityLogs();
        } else if (typeof loadActivityLogs === 'function') {
          loadActivityLogs();
        }
        
      } catch (error) {
        console.error('Error updating activity log:', error);
        alert('Error updating task status: ' + error.message);
      }
    });
  }
});
