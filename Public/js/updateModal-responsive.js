document.addEventListener('DOMContentLoaded', function () {
    // Attach click event to all buttons with class 'update-btn3'
    document.querySelectorAll('.update-btn3').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const modal = document.getElementById('updateModal');
            if (modal && document.getElementById('collectionId')) {
                document.getElementById('collectionId').value = id;
                
                // Reset form and hide completion fields initially
                const form = document.getElementById('updateForm');
                if (form) form.reset();
                const completionGroup = document.getElementById('completionDateTimeGroup');
                if (completionGroup) completionGroup.style.display = 'none';
                
                // Show modal with responsive flexbox display
                modal.style.display = 'flex';
                modal.classList.add('show');
                
                // Update current date/time display immediately and with delay
                updateCurrentDateTime();
                setTimeout(updateCurrentDateTime, 500);
                
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

    // Handle status change to show/hide completion date/time fields
    const statusSelect = document.getElementById('statusUpdate');
    const completionDateTimeGroup = document.getElementById('completionDateTimeGroup');
    
    if (statusSelect && completionDateTimeGroup) {
        statusSelect.addEventListener('change', function() {
            if (this.value === 'completed' || this.value === 'done') {
                completionDateTimeGroup.style.display = 'block';
                // Auto-populate with current date and time
                setCurrentDateTime();
            } else {
                completionDateTimeGroup.style.display = 'none';
            }
        });
    }

    // Function to update current date/time display for reference
    function updateCurrentDateTime() {
        const now = new Date();
        
        // Simple time format
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeText = `${displayHours}:${minutes} ${ampm}`;
        
        // Simple date format
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const dayName = days[now.getDay()];
        const monthName = months[now.getMonth()];
        const date = now.getDate();
        const year = now.getFullYear();
        const dateText = `${dayName}, ${monthName} ${date}, ${year}`;
        
        // Update the display elements
        const timeElement = document.getElementById('currentTimeDisplay');
        const dateElement = document.getElementById('currentDateDisplay');
        
        if (timeElement) {
            timeElement.textContent = timeText;
        } else {
            console.warn('currentTimeDisplay element not found');
        }
        
        if (dateElement) {
            dateElement.textContent = dateText;
        } else {
            console.warn('currentDateDisplay element not found');
        }
    }

    // Function to set current date and time
    function setCurrentDateTime() {
        const now = new Date();
        
        // Set current date
        const currentDate = now.toISOString().split('T')[0];
        const dateInput = document.getElementById('completionDate');
        if (dateInput) {
            dateInput.value = currentDate;
        }
        
        // Set current time (rounded to nearest minute)
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        const timeInput = document.getElementById('completionTime');
        if (timeInput) {
            timeInput.value = currentTime;
        }
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
            const completionDate = document.getElementById('completionDate').value;
            const completionTime = document.getElementById('completionTime').value;
            
            if (!id) {
                alert('Error: No collection ID found');
                resetSubmitButton();
                return;
            }
            
            try {
                console.log('Updating activity log:', { id, status, notes, completionDate, completionTime });
                
                // Prepare the update data
                const updateData = {
                    status: status,
                    notes: notes
                };
                
                        // Add completion date and time if status is completed        if ((status === 'completed' || status === 'done')) {          // Use provided date/time or default to current          const now = new Date();          const endDate = completionDate || now.toISOString().split('T')[0];          const endTime = completionTime || now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format                    // Save the time in HH:MM format for display          updateData.end_time = endTime;          updateData.completion_date = endDate;                    // Create a full datetime string for better tracking          const completionDateTime = `${endDate} ${endTime}`;          updateData.completed_at = new Date(completionDateTime).toISOString();                    console.log('Completion data:', {            end_time: endTime,            completion_date: endDate,            completed_at: updateData.completed_at          });        }
                
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
                if (completionDateTimeGroup) completionDateTimeGroup.style.display = 'none';
                
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

    // Make updateCurrentDateTime available globally
    window.updateCurrentDateTime = updateCurrentDateTime;
});

// Global function to open task update modal (called from janitorActivityLogs.js)
window.openTaskUpdateModal = function(logData) {
    const modal = document.getElementById('updateModal');
    if (modal && document.getElementById('collectionId')) {
        // Set the collection ID
        document.getElementById('collectionId').value = logData._id;
        
        // Populate task details
        const taskDescription = document.getElementById('taskDescription');
        const taskLocation = document.getElementById('taskLocation');
        
        if (taskDescription) {
            taskDescription.textContent = logData.assigned_task || 'Collection task';
        }
        
        if (taskLocation) {
            const location = logData.floor 
                ? `Floor ${logData.floor} - ${logData.bin_id?.bin_code || 'Bin'}`
                : (logData.bin_id?.location || 'Unknown location');
            taskLocation.textContent = location;
        }
        
        // Reset form and hide completion fields initially
        const form = document.getElementById('updateForm');
        if (form) form.reset();
        const completionGroup = document.getElementById('completionDateTimeGroup');
        if (completionGroup) completionGroup.style.display = 'none';
        
        // Show modal with responsive flexbox display
        modal.style.display = 'flex';
        modal.classList.add('show');
        
        // Update current date/time display multiple times to ensure it works
        setTimeout(() => window.updateCurrentDateTime(), 100);
        setTimeout(() => window.updateCurrentDateTime(), 300);
        setTimeout(() => window.updateCurrentDateTime(), 500);
        
        // Add smooth entrance animation
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
        });
    }
};

// Simple function that runs every second to keep the time updated
setInterval(() => {
    const timeElement = document.getElementById('currentTimeDisplay');
    const dateElement = document.getElementById('currentDateDisplay');
    
    if (timeElement && dateElement) {
        const now = new Date();
        
        // Format time
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeText = `${displayHours}:${minutes} ${ampm}`;
        
        // Format date
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const dayName = days[now.getDay()];
        const monthName = months[now.getMonth()];
        const date = now.getDate();
        const year = now.getFullYear();
        const dateText = `${dayName}, ${monthName} ${date}, ${year}`;
        
        timeElement.textContent = timeText;
        dateElement.textContent = dateText;
    }
}, 1000); 