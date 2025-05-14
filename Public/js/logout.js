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
    modal.style.color = 'black';

    // Create the confirmation box
    const box = document.createElement('div');
    box.style.backgroundColor = 'white';
    box.style.padding = '20px';
    box.style.borderRadius = '5px';
    box.style.textAlign = 'center';

    const text = document.createElement('p');
    text.innerText = message;
    text.style.color = 'black'; // Set text color to black
    box.appendChild(text);

    // Create the buttons
    const buttonContainer = document.createElement('div');
    const yesButton = document.createElement('button');
    yesButton.innerText = 'Yes';
    const noButton = document.createElement('button');
    noButton.innerText = 'Cancel';

    // Add gap and style to the buttons
    buttonContainer.style.marginTop = '20px'; // Add some space for the buttons
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.gap = '50px'; // Set gap between buttons

    // Style the buttons
    yesButton.style.padding = '10px 20px';
    yesButton.style.backgroundColor = '#4CAF50'; // Green color
    yesButton.style.color = 'white';
    yesButton.style.border = 'none';
    yesButton.style.borderRadius = '5px';
    yesButton.style.cursor = 'pointer';

    noButton.style.padding = '10px 20px';
    noButton.style.backgroundColor = '#f44336'; // Red color
    noButton.style.color = 'white';
    noButton.style.border = 'none';
    noButton.style.borderRadius = '5px';
    noButton.style.cursor = 'pointer';

    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);

    box.appendChild(buttonContainer);
    modal.appendChild(box);
    document.body.appendChild(modal);

    // Set up button event listeners
    yesButton.addEventListener('click', () => {
      document.body.removeChild(modal); // Remove modal
      resolve(true);
    });

    noButton.addEventListener('click', () => {
      document.body.removeChild(modal); // Remove modal
      resolve(false);
    });

    // Auto resolve after timeout
    const timeout = setTimeout(() => {
      document.body.removeChild(modal); // Remove modal
      resolve(false); // Auto cancel after duration
    }, duration);

    // If the user confirms before timeout, clear the timeout
    yesButton.addEventListener('click', () => {
      clearTimeout(timeout);
    });

    noButton.addEventListener('click', () => {
      clearTimeout(timeout);
    });
  });
}
