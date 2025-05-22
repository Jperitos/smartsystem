/**
 * Profile Image Upload Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const profileForm = document.getElementById('profile-form');
  const profileImageInput = document.getElementById('profile-image-input');
  const profileImage = document.querySelector('.profile-img');
  const userId = document.getElementById('user-id');
  
  // Load user data when settings tab is clicked
  const settingsTab = document.querySelector('.menu-item[data-target="settings"]');
  if (settingsTab) {
    settingsTab.addEventListener('click', loadUserData);
  }
  
  // Function to load user data
  async function loadUserData() {
    try {
      const response = await fetch('/users/me');
      if (!response.ok) {
        throw new Error('Failed to load user data');
      }
      
      const userData = await response.json();
      console.log('User data loaded:', userData);
      
      // Set user ID for form submission
      if (userId && userData._id) {
        userId.value = userData._id;
      }
      
      // Update profile image if available
      if (userData.profile_image) {
        // Update both profile images (in header and form)
        updateProfileImages(userData.profile_image);
      }
      
      // Update username in header
      const usernameElement = document.getElementById('user-display-name');
      if (usernameElement && userData.name) {
        usernameElement.textContent = userData.name;
      }
      
      // Update user role if available
      const userRoleElement = document.getElementById('user-role');
      if (userRoleElement && userData.u_role) {
        userRoleElement.textContent = userData.u_role.charAt(0).toUpperCase() + userData.u_role.slice(1); // Capitalize first letter
      }
      
      // Populate form fields if they exist
      if (profileForm) {
        // Set basic user fields
        setFormValue('name', userData.name);
        setFormValue('email', userData.email);
        
        // Set user info fields if available
        if (userData.info) {
          setFormValue('address', userData.info.address);
          setFormValue('contact', userData.info.contact);
          
          // Format and set birthdate
          if (userData.info.birthdate) {
            const birthdate = new Date(userData.info.birthdate);
            const formattedDate = birthdate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            setFormValue('birthdate', formattedDate);
          }
          
          // Set gender radio buttons
          if (userData.info.gender) {
            const genderRadio = profileForm.querySelector(`input[name="gender"][value="${userData.info.gender}"]`);
            if (genderRadio) {
              genderRadio.checked = true;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      showNotification('Failed to load user data', 'error');
    }
  }
  
  // Helper function to set form field values
  function setFormValue(fieldName, value) {
    const field = profileForm ? profileForm.querySelector(`[name="${fieldName}"]`) : null;
    if (field && value) {
      field.value = value;
    }
  }
  
  // Helper function to update all profile images on the page
  function updateProfileImages(imagePath) {
    // Update main profile image in header
    const headerProfileImg = document.getElementById('profile-header-img');
    if (headerProfileImg) {
      headerProfileImg.src = imagePath;
    }
    
    // Update profile image in sidebar if it exists
    if (profileImage) {
      profileImage.src = imagePath;
    }
    
    // Update preview image in form
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview) {
      imagePreview.src = imagePath;
    }
  }
  
  // Show preview of selected image before upload
  if (profileImageInput) {
    profileImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.match('image.*')) {
          alert('Please select an image file');
          profileImageInput.value = '';
          return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('Image size should be less than 2MB');
          profileImageInput.value = '';
          return;
        }
        
        // Show image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          // Use helper function to update all profile images
          updateProfileImages(e.target.result);
          
          // Add active class to preview
          const imagePreview = document.getElementById('image-preview');
          if (imagePreview) {
            imagePreview.classList.add('preview-active');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Handle form submission with image upload
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate form before submission
      const requiredFields = ['name', 'gender', 'birthdate', 'contact', 'address', 'email'];
      let isValid = true;
      let firstInvalidField = null;
      
      requiredFields.forEach(field => {
        const input = field === 'gender' 
          ? profileForm.querySelector(`input[name="${field}"]:checked`)
          : profileForm.querySelector(`[name="${field}"]`);
          
        if (!input || !input.value.trim()) {
          isValid = false;
          
          // Store the first invalid field for focus
          if (!firstInvalidField) {
            firstInvalidField = field === 'gender' 
              ? profileForm.querySelector(`input[name="${field}"]`)
              : profileForm.querySelector(`[name="${field}"]`);
          }
          
          // Highlight invalid field
          const fieldContainer = field === 'gender'
            ? profileForm.querySelector(`.gender-options`)
            : input;
            
          if (fieldContainer) {
            fieldContainer.style.border = '1px solid red';
            setTimeout(() => {
              fieldContainer.style.border = '';
            }, 3000);
          }
        }
      });
      
      if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
        return;
      }
      
      // Show loading state
      const submitButton = profileForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Updating...';
      
      try {
        // Get form data
        const formData = new FormData(profileForm);
        
        // Only append file if a new image was selected
        if (profileImageInput.files.length > 0) {
          formData.append('profile_image', profileImageInput.files[0]);
        }
        
        // Log form data for debugging
        console.log('Submitting form data:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }
        
        // Send data to server
        const response = await fetch('/api/update-profile', {
          method: 'POST',
          body: formData
        });
        
        // Handle response
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update profile');
        }
        
        const result = await response.json();
        console.log('Profile update result:', result);
        
        // Update profile images if path was returned
        if (result.imagePath) {
          updateProfileImages(result.imagePath);
        }
        
        // Update username if it was changed
        if (result.name) {
          const usernameElement = document.getElementById('user-display-name');
          if (usernameElement) {
            usernameElement.textContent = result.name;
          }
        }
        
        // Show success message
        showNotification('Profile updated successfully', 'success');
      } catch (error) {
        console.error('Error updating profile:', error);
        showNotification(error.message || 'Failed to update profile', 'error');
      } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }
  
  // Try to load user data on page load
  loadUserData();
});

// Helper function to show notifications
function showNotification(message, type = 'info') {
  // Check if notification container exists, create if not
  let notifContainer = document.getElementById('notification-container');
  if (!notifContainer) {
    notifContainer = document.createElement('div');
    notifContainer.id = 'notification-container';
    notifContainer.style.position = 'fixed';
    notifContainer.style.top = '20px';
    notifContainer.style.right = '20px';
    notifContainer.style.zIndex = '9999';
    document.body.appendChild(notifContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.classList.add('notification', type);
  notification.style.padding = '10px 15px';
  notification.style.marginBottom = '10px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.display = 'flex';
  notification.style.justifyContent = 'space-between';
  notification.style.alignItems = 'center';
  notification.style.minWidth = '250px';
  
  // Set background color based on type
  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#F44336';
    notification.style.color = 'white';
  } else {
    notification.style.backgroundColor = '#2196F3';
    notification.style.color = 'white';
  }
  
  // Add message and close button
  notification.innerHTML = `
    <span>${message}</span>
    <span style="cursor:pointer;margin-left:15px;font-weight:bold;">&times;</span>
  `;
  
  // Add close functionality
  const closeBtn = notification.querySelector('span:last-child');
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  
  // Add to container and auto-remove after 5 seconds
  notifContainer.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 5000);
} 