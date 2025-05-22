function setRadioValue(name, value) {
  const radios = document.getElementsByName(name);
  radios.forEach(radio => {
    radio.checked = radio.value === value;
  });
}

// Show status message
function showMessage(message, isError = false) {
  const messageElement = document.createElement('div');
  messageElement.className = isError ? 'error-message' : 'success-message';
  messageElement.textContent = message;
  messageElement.style.position = 'fixed';
  messageElement.style.top = '20px';
  messageElement.style.right = '20px';
  messageElement.style.padding = '10px 20px';
  messageElement.style.borderRadius = '5px';
  messageElement.style.color = 'white';
  messageElement.style.backgroundColor = isError ? '#f44336' : '#3A7D44';
  messageElement.style.zIndex = '1000';
  
  document.body.appendChild(messageElement);
  
  setTimeout(() => {
    messageElement.style.opacity = '0';
    messageElement.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 500);
  }, 3000);
}

function loadUserProfile(user) {
  const form = document.getElementById('profile-form');
  form.elements['user_id'].value = user._id || '';

  form.elements['name'].value = user.name || '';
  form.elements['email'].value = user.email || '';

  if (user.info) {
    setRadioValue('gender', user.info.gender || '');
    form.elements['birthdate'].value = user.info.birthdate ? user.info.birthdate.split('T')[0] : '';
    form.elements['contact'].value = user.info.contact || '';
    form.elements['address'].value = user.info.address || '';
  } else {
    setRadioValue('gender', '');
    form.elements['birthdate'].value = '';
    form.elements['contact'].value = '';
    form.elements['address'].value = '';
  }

  // Update the profile images
  const profileImages = document.querySelectorAll('.profile-img, .preview-img');
  if (user.avatar) {
    profileImages.forEach(img => img.src = user.avatar);
  }
  
  // Update the profile name in the profile section
  const profileName = document.querySelector('.profile-section h3');
  if (profileName && user.name) profileName.textContent = user.name;
}

document.addEventListener('DOMContentLoaded', () => {
  // Set up profile image upload functionality
  const profileImageInput = document.getElementById('profile-image-input');
  const chooseImageBtn = document.getElementById('choose-image-btn');
  let selectedFile = null;
  
  // Add click handler for the choose image button
  if (chooseImageBtn && profileImageInput) {
    chooseImageBtn.addEventListener('click', function() {
      profileImageInput.click();
    });
  }
  
  if (profileImageInput) {
    profileImageInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.match('image.*')) {
          showMessage('Please select an image file', true);
          return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          showMessage('Image must be less than 2MB', true);
          return;
        }
        
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
          // Update all profile image previews
          const profileImages = document.querySelectorAll('.profile-img, .preview-img');
          profileImages.forEach(img => {
            img.src = e.target.result;
          });
          showMessage('Image selected. Click Update Profile to save.');
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Handle profile form submission
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const submitButton = profileForm.querySelector('.update-btn');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Updating...';
      }
      
      const formData = new FormData(profileForm);
      
      // Add the selected file to the form data if it exists
      if (selectedFile) {
        // Use only the field name expected by the server
        formData.append('profile_image', selectedFile);
      }
      
      // Send the form data to the server
      fetch('/api/update-profile', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
      })
      .then(data => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Update Profile';
        }
        
        showMessage('Profile updated successfully!');
        
        // Update the profile section with the new data
        if (data.user) {
          // Update the profile name in the profile section
          const profileName = document.querySelector('.profile-section h3');
          if (profileName && data.user.name) profileName.textContent = data.user.name;
          
          // Reset the selected file
          selectedFile = null;
        }
      })
      .catch(err => {
        console.error(err);
        showMessage('Error updating profile', true);
        
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Update Profile';
        }
      });
    });
  }

  // Load user profile data
  fetch('/users/me', {
    credentials: 'include'  
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to load user data');
    return res.json();
  })
  .then(user => {
    loadUserProfile(user);
  })
  .catch(err => {
    console.error(err);
    showMessage('Error loading profile', true);
  });
});
