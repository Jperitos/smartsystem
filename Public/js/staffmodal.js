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

// === Show Update Modal ===
editButtons.forEach(button => {
  button.addEventListener('click', function () {
    updateModal.style.display = 'flex'; // use 'flex' to center modal using flexbox

    const row = this.closest('tr');
    document.getElementById('updateName').value = row.children[1].textContent;
    document.getElementById('updateAge').value = row.children[2].textContent;
    document.getElementById('updateAddress').value = row.children[3].textContent;
    document.getElementById('updateContact').value = row.children[4].textContent;
    document.getElementById('updateFloor').value = row.children[5].textContent;
  });
});

// === Show Delete Modal ===
deleteButtons.forEach(button => {
  button.addEventListener('click', function () {
    deleteModal.style.display = 'flex'; // use 'flex' to center modal using flexbox
    // Optionally: store the row or ID for deletion here
  });
});

// === Close Update Modal ===
closeUpdateModalBtn.addEventListener('click', function () {
  updateModal.style.display = 'none';
});

// === Close Delete Modal ===
cancelDeleteBtn.addEventListener('click', function () {
  deleteModal.style.display = 'none';
});

// === Confirm Delete Button ===
confirmDeleteBtn.addEventListener('click', function () {
  deleteModal.style.display = 'none';
  alert('Record deleted (implement deletion logic)');
});

// === Close modals on outside click ===
window.addEventListener('click', function (e) {
  if (e.target === updateModal) {
    updateModal.style.display = 'none';
  }
  if (e.target === deleteModal) {
    deleteModal.style.display = 'none';
  }
});
