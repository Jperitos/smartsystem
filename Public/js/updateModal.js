document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('.modal-task');
  const closeBtn = modal.querySelector('.close');
  const form = document.getElementById('updateForm');

  window.openUpdateModal = function (button) {
    const collectionId = button.getAttribute('data-id');
    document.getElementById('collectionId').value = collectionId;
    modal.style.display = 'block'; // Show modal
  };

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    modal.style.display = 'none';
    form.reset();
  });
});
