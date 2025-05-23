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
    updateForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const id = document.getElementById('collectionId').value;
      const status = document.getElementById('statusUpdate').value;
      const imageInput = document.getElementById('proofImage');
      const image = imageInput && imageInput.files.length > 0 ? imageInput.files[0] : null;
      const notes = document.getElementById('notes').value;

      // You can replace this with your actual logic
      console.log({ id, status, image, notes });

      alert("Update submitted!");

      const modal = document.getElementById('updateModal');
      if (modal) modal.style.display = 'none';
    });
  }
});
