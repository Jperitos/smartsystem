
  // Select all edit and delete buttons
  const editButtons = document.querySelectorAll('.edit-btn');
  const deleteButtons = document.querySelectorAll('.delete-btn');

  // Modals
  const updateModal = document.getElementById('updateStaffModal');
  const deleteModal = document.getElementById('deleteConfirmModal');

  // Close buttons
  const closeUpdateModalBtn = document.getElementById('closeUpdateModalBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // Show Update Modal
  editButtons.forEach(button => {
    button.addEventListener('click', function () {
      updateModal.style.display = 'block';

      // Example: fill the form with placeholder data
      const row = this.closest('tr');
      document.getElementById('updateName').value = row.children[1].textContent;
      document.getElementById('updateAge').value = row.children[2].textContent;
      document.getElementById('updateAddress').value = row.children[3].textContent;
      document.getElementById('updateContact').value = row.children[4].textContent;
      document.getElementById('updateFloor').value = row.children[5].textContent;
      // Other fields can be filled similarly if data is available
    });
  });

  // Show Delete Modal
  deleteButtons.forEach(button => {
    button.addEventListener('click', function () {
      deleteModal.style.display = 'block';
      // You can also store which row to delete here if needed
    });
  });

  // Close Update Modal
  closeUpdateModalBtn.addEventListener('click', function () {
    updateModal.style.display = 'none';
  });

  // Close Delete Modal
  cancelDeleteBtn.addEventListener('click', function () {
    deleteModal.style.display = 'none';
  });

  // Handle Confirm Delete (add your own logic here)
  confirmDeleteBtn.addEventListener('click', function () {
    deleteModal.style.display = 'none';
    alert('Record deleted (implement deletion logic)');
  });

  // Optional: Close modals when clicking outside them
  window.addEventListener('click', function (e) {
    if (e.target === updateModal) {
      updateModal.style.display = 'none';
    }
    if (e.target === deleteModal) {
      deleteModal.style.display = 'none';
    }
  });
