document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
  
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
  
      const email = document.querySelector("[name='email']").value;
      const password = document.querySelector("[name='password']").value;
  
      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
  
        const data = await res.json();
  
        if (res.ok) {
            window.location.href = data.redirectUrl; 
        } else {
            alert(data.error || "Login failed");
        }
        
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong");
      }
    });
  });
  