function calculateAge(birthdateStr) {
  if (!birthdateStr) return "N/A";
  const birthdate = new Date(birthdateStr);
  const diffMs = Date.now() - birthdate.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

fetch("/api/users")
  .then((res) => res.json())
  .then((users) => {
    const tbody = document.getElementById("staffTableBody");
    tbody.innerHTML = ""; 

    users.forEach((user, index) => {
      const info = user.info || {};

      const tr = document.createElement("tr");

      // Staff ID
      const tdId = document.createElement("td");
      tdId.textContent = index + 1;
      tr.appendChild(tdId);

      // Name
      const tdName = document.createElement("td");
      tdName.textContent = user.name || "N/A";
      tr.appendChild(tdName);

      // Age
      const tdAge = document.createElement("td");
      tdAge.textContent = calculateAge(info.birthdate);
      tr.appendChild(tdAge);

      // Address
      const tdAddress = document.createElement("td");
      tdAddress.textContent = info.address || "N/A";
      tr.appendChild(tdAddress);

      // Contact No.
      const tdContact = document.createElement("td");
      tdContact.textContent = info.contact || "N/A";
      tr.appendChild(tdContact);

      // Assigned Floor
      const tdAssignArea = document.createElement("td");
      tdAssignArea.textContent = info.assign_area || "N/A";
      tr.appendChild(tdAssignArea);

      // Status
      const tdStatus = document.createElement("td");
      tdStatus.textContent = user.status || "N/A";
      tr.appendChild(tdStatus);

      // Action buttons
      const tdAction = document.createElement("td");

      // Update Button (Blue)
      // Update Button
      const updateBtn = document.createElement("button");
      updateBtn.innerHTML = '<i class="fas fa-pen"></i>';
      updateBtn.classList.add("btn-icon");
      updateBtn.style.color = "#3674B5";
      updateBtn.style.fontSize = "12px";
      updateBtn.style.backgroundColor = "#f4f4f4";
      tdAction.appendChild(updateBtn);

      // Show update modal on click
      updateBtn.addEventListener("click", () => {
        document.getElementById("updateStaffModal").style.display = "block";
      });

      // Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.classList.add("btn-icon");
      deleteBtn.style.color = "#dc3545";
      updateBtn.style.fontSize = "12px";
      deleteBtn.style.backgroundColor = "#f4f4f4";
      tdAction.appendChild(deleteBtn);

      // Show delete confirmation modal on click
      deleteBtn.addEventListener("click", () => {
        document.getElementById("deleteConfirmModal").style.display = "block";
      });

      tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });
  })
  .catch((err) => {
    console.error("Error fetching users:", err);
  });

// Show update modal
updateBtn.addEventListener("click", () => {
  document.getElementById("updateStaffModal").classList.add("show");
});

// Close update modal (example)
document.getElementById("closeUpdateModalBtn").addEventListener("click", () => {
  document.getElementById("updateStaffModal").classList.remove("show");
});

// Show delete modal
deleteBtn.addEventListener("click", () => {
  document.getElementById("deleteConfirmModal").classList.add("show");
});

// Close delete modal (example)
document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
  document.getElementById("deleteConfirmModal").classList.remove("show");
});
