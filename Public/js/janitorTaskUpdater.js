// Janitor Task Status Updater
console.log('Janitor Task Updater loaded');

/**
 * Main function to update assigned task status to "done" or "in progress"
 * Saves directly to the ActivityLog schema in the database
 */
class JanitorTaskUpdater {
  constructor() {
    this.currentTaskData = null;
    this.isUpdating = false;
    this.init();
  }

  init() {
    console.log('Initializing Janitor Task Updater...');
    this.setupEventListeners();
    this.setupModalHandlers();
  }

  /**
   * Setup event listeners for the update modal
   */
  setupEventListeners() {
    // Form submission handler
    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
      updateForm.addEventListener('submit', (e) => this.handleFormSubmission(e));
    }

    // Modal close handlers
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Click outside modal to close
    window.addEventListener('click', (event) => {
      const modal = document.getElementById('updateModal');
      if (event.target === modal) {
        this.closeModal();
      }
    });

    // Status change handler for dynamic updates
    const statusSelect = document.getElementById('statusUpdate');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => this.handleStatusChange(e));
    }
  }

  /**
   * Setup modal handlers and validation
   */
  setupModalHandlers() {
    // Add real-time validation
    const notesTextarea = document.getElementById('notes');
    if (notesTextarea) {
      notesTextarea.addEventListener('input', (e) => this.validateNotes(e));
    }
  }

  /**
   * Open the update modal with task data
   * @param {Object} taskData - The task/activity log data
   */
  openUpdateModal(taskData) {
    console.log('Opening update modal for task:', taskData);
    
    this.currentTaskData = taskData;
    const modal = document.getElementById('updateModal');
    
    if (!modal) {
      console.error('Update modal not found');
      return;
    }

    // Populate modal fields
    this.populateModalFields(taskData);
    
    // Show modal
    modal.style.display = 'block';
    
    // Focus on status select
    const statusSelect = document.getElementById('statusUpdate');
    if (statusSelect) {
      statusSelect.focus();
    }
  }

  /**
   * Populate modal fields with task data
   * @param {Object} taskData - The task data
   */
  populateModalFields(taskData) {
    // Set collection ID
    const collectionId = document.getElementById('collectionId');
    if (collectionId) {
      collectionId.value = taskData._id || '';
    }

    // Set task description
    const taskDescription = document.getElementById('taskDescription');
    if (taskDescription) {
      taskDescription.textContent = taskData.assigned_task || 'Collection task - Empty and clean bin';
    }

    // Set task location
    const taskLocation = document.getElementById('taskLocation');
    if (taskLocation) {
      const location = taskData.floor ? `Floor ${taskData.floor}` : (taskData.bin_id?.location || 'N/A');
      const binInfo = taskData.bin_id?.bin_code || `Bin ${taskData.bin_id?._id?.slice(-3) || 'N/A'}`;
      taskLocation.textContent = `${location} - ${binInfo}`;
    }

    // Set current status
    const statusUpdate = document.getElementById('statusUpdate');
    if (statusUpdate) {
      const currentStatus = (taskData.status || 'assigned').toLowerCase();
      statusUpdate.value = currentStatus;
    }

    // Set existing end time if available
    const endTime = document.getElementById('endTime');
    if (endTime && taskData.end_time) {
      endTime.value = taskData.end_time;
    }

    // Set existing notes
    const notes = document.getElementById('notes');
    if (notes) {
      notes.value = taskData.notes || '';
    }

    // Update UI based on current status
    const currentStatus = (taskData.status || 'assigned').toLowerCase();
    this.updateModalForStatus(currentStatus);

    console.log('Modal populated with task data:', {
      id: taskData._id,
      task: taskData.assigned_task,
      status: taskData.status,
      location: taskData.floor,
      bin: taskData.bin_id?.bin_code,
      endTime: taskData.end_time
    });
  }

  /**
   * Handle form submission to update task status
   * @param {Event} e - Form submission event
   */
  async handleFormSubmission(e) {
    e.preventDefault();
    
    if (this.isUpdating) {
      console.log('Update already in progress...');
      return;
    }

    this.isUpdating = true;
    
    try {
      // Get form data
      const formData = this.getFormData();
      
      if (!formData.collectionId) {
        throw new Error('No collection ID found');
      }

      // Validate form data
      this.validateFormData(formData);

      // Show loading state
      this.setLoadingState(true);

      // Update task status in database
      const updatedTask = await this.updateTaskStatus(formData);

      // Show success message
      this.showSuccessMessage(updatedTask);

      // Close modal
      this.closeModal();

      // Refresh activity logs table
      this.refreshActivityLogs();

    } catch (error) {
      console.error('Error updating task status:', error);
      this.showErrorMessage(error.message);
    } finally {
      this.isUpdating = false;
      this.setLoadingState(false);
    }
  }

  /**
   * Get form data from modal
   * @returns {Object} Form data
   */
  getFormData() {
    return {
      collectionId: document.getElementById('collectionId')?.value || '',
      status: document.getElementById('statusUpdate')?.value || '',
      notes: document.getElementById('notes')?.value || '',
      endTime: document.getElementById('endTime')?.value || ''
    };
  }

  /**
   * Validate form data before submission
   * @param {Object} formData - Form data to validate
   */
  validateFormData(formData) {
    if (!formData.collectionId) {
      throw new Error('Collection ID is required');
    }

    if (!formData.status) {
      throw new Error('Status is required');
    }

    const validStatuses = ['assigned', 'inprogress', 'completed'];
    if (!validStatuses.includes(formData.status)) {
      throw new Error('Invalid status selected');
    }

    console.log('Form data validated:', formData);
  }

  /**
   * Update task status in the database (ActivityLog schema)
   * @param {Object} formData - Form data with new status
   * @returns {Promise<Object>} Updated task data
   */
  async updateTaskStatus(formData) {
    console.log('Updating task status in database...', formData);

    // Prepare update payload
    const updatePayload = {
      status: formData.status,
      notes: formData.notes,
      end_time: formData.endTime || '',
      completion_date: formData.status === 'completed' ? new Date().toISOString() : null
    };

    // Add start timestamp if status changes to inprogress
    if (formData.status === 'inprogress' && this.currentTaskData?.status !== 'inprogress') {
      updatePayload.start_time = new Date().toTimeString().split(' ')[0];
    }

    console.log('Sending update payload:', updatePayload);

    // Make API call to update ActivityLog
    const response = await fetch(`/api/activity-logs/${formData.collectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(updatePayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const updatedTask = await response.json();
    console.log('Task updated successfully in database:', updatedTask);

    return updatedTask;
  }

  /**
   * Handle status change for dynamic UI updates
   * @param {Event} e - Status change event
   */
  handleStatusChange(e) {
    const newStatus = e.target.value;
    console.log('Status changed to:', newStatus);

    // Update UI based on status
    this.updateModalForStatus(newStatus);
  }

  /**
   * Update modal UI based on selected status
   * @param {string} status - Selected status
   */
  updateModalForStatus(status) {
    const notesTextarea = document.getElementById('notes');
    const endTimeGroup = document.getElementById('endTimeGroup');
    const endTimeInput = document.getElementById('endTime');
    
    if (notesTextarea) {
      // Update placeholder based on status
      switch (status) {
        case 'inprogress':
          notesTextarea.placeholder = 'Optional: Add notes about starting this task...';
          break;
        case 'completed':
          notesTextarea.placeholder = 'Optional: Add completion notes, issues encountered, etc...';
          break;
        default:
          notesTextarea.placeholder = 'Provide additional details about this collection...';
      }
    }

    // Show/hide end time field based on status
    if (endTimeGroup) {
      if (status === 'completed') {
        endTimeGroup.style.display = 'block';
        // Set current time as default if no time is set
        if (endTimeInput && !endTimeInput.value) {
          const now = new Date();
          const timeString = now.toTimeString().slice(0, 5); // HH:MM format
          endTimeInput.value = timeString;
        }
      } else {
        endTimeGroup.style.display = 'none';
        if (endTimeInput) {
          endTimeInput.value = ''; // Clear the time when hidden
        }
      }
    }

    // Update submit button text
    const submitBtn = document.querySelector('#updateForm .update-btn');
    if (submitBtn) {
      switch (status) {
        case 'inprogress':
          submitBtn.textContent = 'Start Task';
          break;
        case 'completed':
          submitBtn.textContent = 'Mark as Completed';
          break;
        default:
          submitBtn.textContent = 'Update Status';
      }
    }
  }

  /**
   * Validate notes input
   * @param {Event} e - Input event
   */
  validateNotes(e) {
    const notes = e.target.value;
    const maxLength = 500;
    
    if (notes.length > maxLength) {
      e.target.value = notes.substring(0, maxLength);
      this.showWarningMessage(`Notes limited to ${maxLength} characters`);
    }
  }

  /**
   * Set loading state for form submission
   * @param {boolean} isLoading - Loading state
   */
  setLoadingState(isLoading) {
    const submitBtn = document.querySelector('#updateForm .update-btn');
    const form = document.getElementById('updateForm');
    
    if (submitBtn) {
      if (isLoading) {
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
      } else {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        // Reset button text based on current status
        const currentStatus = document.getElementById('statusUpdate')?.value || '';
        this.updateModalForStatus(currentStatus);
      }
    }

    if (form) {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.disabled = isLoading;
      });
    }
  }

  /**
   * Close the update modal
   */
  closeModal() {
    const modal = document.getElementById('updateModal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Reset form
    const form = document.getElementById('updateForm');
    if (form) {
      form.reset();
    }
    
    // Clear current task data
    this.currentTaskData = null;
    
    console.log('Update modal closed');
  }

  /**
   * Show success message
   * @param {Object} updatedTask - Updated task data
   */
  showSuccessMessage(updatedTask) {
    const statusText = this.getStatusDisplayText(updatedTask.status);
    const message = `Task status updated to "${statusText}" successfully!`;
    
    // You can replace this with a better notification system
    alert(message);
    
    console.log('Success:', message);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showErrorMessage(message) {
    const errorMsg = `Error updating task: ${message}`;
    
    // You can replace this with a better notification system
    alert(errorMsg);
    
    console.error('Error:', errorMsg);
  }

  /**
   * Show warning message
   * @param {string} message - Warning message
   */
  showWarningMessage(message) {
    console.warn('Warning:', message);
    // You can add a toast notification here
  }

  /**
   * Get display text for status
   * @param {string} status - Status value
   * @returns {string} Display text
   */
  getStatusDisplayText(status) {
    switch ((status || '').toLowerCase()) {
      case 'inprogress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'assigned':
        return 'Assigned';
      default:
        return status || 'Unknown';
    }
  }

  /**
   * Refresh the activity logs table
   */
  refreshActivityLogs() {
    // Try to call the global function to refresh activity logs
    if (typeof window.loadJanitorActivityLogs === 'function') {
      console.log('Refreshing janitor activity logs...');
      window.loadJanitorActivityLogs();
    } else if (typeof loadActivityLogs === 'function') {
      console.log('Refreshing activity logs...');
      loadActivityLogs();
    } else {
      console.warn('No activity log refresh function found');
    }
  }
}

// Initialize the task updater when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Janitor Task Updater...');
  window.janitorTaskUpdater = new JanitorTaskUpdater();
});

// Global function to open update modal (called from activity logs table)
window.openTaskUpdateModal = function(taskData) {
  if (window.janitorTaskUpdater) {
    window.janitorTaskUpdater.openUpdateModal(taskData);
  } else {
    console.error('Janitor Task Updater not initialized');
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JanitorTaskUpdater;
} 