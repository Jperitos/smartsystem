// Function to toggle the visibility of a tab
function showTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });

  const activeTab = document.getElementById(tabName);
  if (activeTab) {
    activeTab.classList.add('active');
  }
}

// Function to show the notification dropdown
function showNotifications() {
  const notificationDropdown = document.getElementById('notificationDropdown');
  notificationDropdown.classList.toggle('show');
}

// Event listener to handle profile dropdown visibility
document.getElementById('profileIcon').addEventListener('click', function() {
  const profileDropdown = document.getElementById('profileDropdown');
  profileDropdown.classList.toggle('show');
});

// Function to open the Update Staff modal and populate it with staff data
document.querySelectorAll('.edit-btn').forEach(button => {
  button.addEventListener('click', function() {
    const staffId = this.getAttribute('data-id');
    // Assuming you fetch staff data here (replace with your data fetching logic)
    const staffData = getStaffDataById(staffId);

    document.getElementById('updateName').value = staffData.name;
    document.querySelector(`input[name="updateGender"][value="${staffData.gender}"]`).checked = true;
    document.getElementById('updateAge').value = staffData.age;
    document.getElementById('updateContact').value = staffData.contact;
    document.getElementById('updateAddress').value = staffData.address;
    document.getElementById('updateEmail').value = staffData.email;
    document.getElementById('updateFloor').value = staffData.floor;
    document.getElementById('updateMaritalStatus').value = staffData.maritalStatus;

    document.getElementById('updateStaffModal').style.display = 'block';
  });
});

// Event listener to close the Update Staff modal
document.getElementById('closeUpdateModalBtn').addEventListener('click', function() {
  document.getElementById('updateStaffModal').style.display = 'none';
});

// Function to handle form submission for updating staff
document.getElementById('updateStaffForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const updatedStaff = {
    name: document.getElementById('updateName').value,
    gender: document.querySelector('input[name="updateGender"]:checked').value,
    age: document.getElementById('updateAge').value,
    contact: document.getElementById('updateContact').value,
    address: document.getElementById('updateAddress').value,
    email: document.getElementById('updateEmail').value,
    floor: document.getElementById('updateFloor').value,
    maritalStatus: document.getElementById('updateMaritalStatus').value
  };

  // Update staff logic (send to the server or database here)
  updateStaffData(updatedStaff);

  // Close the modal after update
  document.getElementById('updateStaffModal').style.display = 'none';
});

// Function to delete a staff member (confirmation)
document.querySelectorAll('.delete-btn').forEach(button => {
  button.addEventListener('click', function() {
    const staffId = this.getAttribute('data-id');
    document.getElementById('deleteConfirmModal').style.display = 'block';
    document.getElementById('confirmDeleteBtn').setAttribute('data-id', staffId);
  });
});

// Event listener for confirm delete action
document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
  const staffId = this.getAttribute('data-id');
  // Delete staff logic here (send request to server/database)
  deleteStaff(staffId);
  document.getElementById('deleteConfirmModal').style.display = 'none';
});

// Event listener for cancel delete action
document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
  document.getElementById('deleteConfirmModal').style.display = 'none';
});

// Function to get staff data by ID (simulated)
function getStaffDataById(staffId) {
  // Replace with actual fetching logic
  return {
    name: 'John Doe',
    gender: 'Male',
    age: 30,
    contact: '09912345678',
    address: '123 Main Street',
    email: 'johndoe@example.com',
    floor: 2,
    maritalStatus: 'Single'
  };
}

// Function to update staff data (simulated)
function updateStaffData(staff) {
  console.log('Updated Staff:', staff);
  // Replace with actual update logic (send to server)
}

// Function to delete staff (simulated)
function deleteStaff(staffId) {
  console.log('Deleted Staff ID:', staffId);
  // Replace with actual deletion logic (send to server)
}

// Handle the filter search in staff list
document.getElementById('binSearch').addEventListener('input', function() {
  const query = this.value.toLowerCase();
  const rows = document.querySelectorAll('.table2 tr');
  rows.forEach(row => {
    const nameCell = row.cells[1];
    if (nameCell) {
      const name = nameCell.textContent.toLowerCase();
      if (name.includes(query)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  });
});
