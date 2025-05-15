document.getElementById("logoutBtn").addEventListener("click", async (e) => {
    e.preventDefault();
  
    // Call the timedConfirm function with a duration of 5 seconds (5000ms)
    const confirmed = await timedConfirm("Are you sure you want to log out?", 5000);
  
    if (!confirmed) {
      console.log("Logout action canceled or timed out.");
      return;
    }
  
    try {
      const response = await fetch("/signout", {
        method: "POST",
        credentials: "include", // include cookies
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      const result = await response.json();
  
      if (response.ok && result.success) {
        // Redirect to login page
        window.location.href = "/login";
      } else {
        alert("Logout failed: " + result.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("An error occurred during logout.");
    }
});


// Timed confirmation function
function timedConfirm(message, duration) {
  return new Promise((resolve) => {
    // Create a custom modal element
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';

    // Create the confirmation box
    const box = document.createElement('div');
    box.style.backgroundColor = '#f7f7f7';
    box.style.padding = '30px 40px';
    box.style.borderRadius = '10px';
    box.style.textAlign = 'center';
    box.style.fontFamily = 'Arial, sans-serif';
    box.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    box.style.width = 'fit-content';
    box.style.minWidth = '320px';

    // Title
    const title = document.createElement('h2');
    title.innerText = 'Confirm Logout';
    title.style.margin = '0';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.color = '#333';
    box.appendChild(title);

    // Message
    const text = document.createElement('p');
    text.innerText = message;
    text.style.color = '#333';
    text.style.marginTop = '10px';
    text.style.marginBottom = '20px';
    text.style.fontSize = '14px';
    box.appendChild(text);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '10px';

    const yesButton = document.createElement('button');
    yesButton.innerText = 'Logout';
    yesButton.style.padding = '10px 20px';
    yesButton.style.backgroundColor = '#f00';
    yesButton.style.color = '#fff';
    yesButton.style.border = 'none';
    yesButton.style.borderRadius = '5px';
    yesButton.style.cursor = 'pointer';

    const noButton = document.createElement('button');
    noButton.innerText = 'Cancel';
    noButton.style.padding = '10px 20px';
    noButton.style.backgroundColor = '#888';
    noButton.style.color = '#fff';
    noButton.style.border = 'none';
    noButton.style.borderRadius = '5px';
    noButton.style.cursor = 'pointer';

    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);
    box.appendChild(buttonContainer);
    modal.appendChild(box);
    document.body.appendChild(modal);

    // Event listeners
    yesButton.addEventListener('click', () => {
      clearTimeout(timeout);
      document.body.removeChild(modal);
      resolve(true);
    });

    noButton.addEventListener('click', () => {
      clearTimeout(timeout);
      document.body.removeChild(modal);
      resolve(false);
    });

    const timeout = setTimeout(() => {
      document.body.removeChild(modal);
      resolve(false);
    }, duration);
  });
}

