document.getElementById("forgotPasswordForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;

  try {
    const res = await fetch("/send-forgot-password-code", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.message);
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
});
