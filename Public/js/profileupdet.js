

document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo(); // Call the function on page load
});

async function loadUserInfo() {
  try {
    const res = await fetch("/settings/info", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!res.ok) throw new Error("Failed to fetch user data.");

    const data = await res.json();

    // Fill the form fields
    document.querySelector('input[name="name"]').value = data.name || "";
    document.querySelector(`input[name="gender"][value="${data.gender}"]`).checked = true;
    document.querySelector('input[name="birthdate"]').value = data.birthdate || "";
    document.querySelector('input[name="contact"]').value = data.contact || "";
    document.querySelector('input[name="address"]').value = data.address || "";
    document.querySelector('input[name="email"]').value = data.email || "";


    // Profile details on the left
    document.querySelector(".profile-img").src = data.avatar || "../image/default.jpg";
    document.querySelector(".profile-section h3").textContent = data.name || "";
    document.querySelector(".profile-section p").textContent = data.role || "";

  } catch (err) {
    console.error("Error loading user info:", err.message);
  }
}
