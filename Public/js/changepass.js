document.getElementById('change-password-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const oldPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    alert('New password and confirm password do not match.');
    return;
  }

  try {
    const res = await fetch('/api/change-password', { 
      method: 'PATCH',
      credentials: 'include',  
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert(data.message || 'Password updated successfully!');
      // Optionally clear inputs
      this.reset();
    } else {
      alert(data.message || 'Failed to update password.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while changing password.');
  }
});
