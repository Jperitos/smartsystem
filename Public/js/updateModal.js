document.querySelector('.update-btn3').addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      document.getElementById('collectionId').value = id;
      document.getElementById('updateModal').style.display = 'block';
    });

    // Close modal when close icon is clicked
    document.getElementById('closeModal').addEventListener('click', function () {
      document.getElementById('updateModal').style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function (event) {
      const modal = document.getElementById('updateModal');
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Handle form submission
    document.getElementById('updateForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const id = document.getElementById('collectionId').value;
      const status = document.getElementById('statusUpdate').value;
      const image = document.getElementById('proofImage').files[0];
      const notes = document.getElementById('notes').value;

      console.log({ id, status, image, notes }); // Replace with real logic
      alert("Update submitted!");
      document.getElementById('updateModal').style.display = 'none';
    });