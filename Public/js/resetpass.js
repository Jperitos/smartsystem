document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirm_password").value;

  if (password !== confirmPassword) {
    return alert("Passwords do not match.");
  }

  // You might also need a reset code/token to include
  const res = await fetch("/reset-password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Password reset successful!");
    window.location.href = "/login";
  } else {
    alert(data.message || "Failed to reset password.");
  }
});
