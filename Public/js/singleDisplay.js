// Action buttons
const tdAction = document.createElement("td");

// Update Button
const updateBtn = document.createElement("button");
updateBtn.innerHTML = '<i class="fas fa-pen"></i>';
updateBtn.classList.add("btn-icon");
updateBtn.style.color = "#007bff";
updateBtn.style.backgroundColor = "#f4f4f4";
tdAction.appendChild(updateBtn);

// Show update modal and populate fields
updateBtn.addEventListener("click", () => {
  const modal = document.getElementById("updateStaffModal");
  modal.style.display = "block";

  // Fill modal fields with user data
  document.getElementById("updateName").value = user.name || "";
  document.getElementById("updateAge").value = calculateAge(info.birthdate);
  document.getElementById("updateContact").value = info.contact || "";
  document.getElementById("updateAddress").value = info.address || "";
  document.getElementById("updateEmail").value = user.email || "";
  document.getElementById("updateFloor").value = info.assign_area || "";
  document.getElementById("updateMaritalStatus").value = info.marital_status || "Single";

  // Set gender
  const gender = info.gender || "";
  document.querySelectorAll('input[name="updateGender"]').forEach((radio) => {
    radio.checked = radio.value === gender;
  });

  // Store the user ID (optional for submit logic)
  document.getElementById("updateUserId").value = user._id || user.id || "";
});
