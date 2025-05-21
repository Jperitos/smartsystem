document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('successModal');
  const closeBtn = document.getElementById('closeBtn');
  const signupForm = document.getElementById('signupForm');

  // Close modal on close button click
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  // Close modal if clicking outside modal content
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Handle form submit with AJAX
  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
      name: this.name.value,
      email: this.email.value,
      password: this.password.value,
    };

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Show modal
        modal.style.display = 'flex';

        // Auto-hide modal and redirect after 10 seconds
        setTimeout(() => {
          modal.style.display = 'none';
          window.location.href = '/login';
        }, 10000);

      } else {
        alert(result.message || 'Registration failed.');
      }

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });
});
