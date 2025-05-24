document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.querySelector(".login-btn");
    
    // Modal elements
    const modal = document.getElementById("validationModal");
    const modalHeader = document.getElementById("modalHeader");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const closeModal = document.getElementById("closeModal");

    // Validation rules based on signin schema
    const validationRules = {
        email: {
            required: true,
            minLength: 6,
            maxLength: 60,
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net)$/,
            message: "Please enter a valid email address ending with .com or .net"
        },
        password: {
            required: true,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)"
        }
    };

    // Modal functions
    function showModal(title, message, isSuccess = false) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        if (isSuccess) {
            modalHeader.classList.add("success");
            modalCloseBtn.classList.add("success");
        } else {
            modalHeader.classList.remove("success");
            modalCloseBtn.classList.remove("success");
        }
        
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    function hideModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    function showErrorModal(message) {
        showModal("Login Error", message, false);
    }

    function showSuccessModal(message) {
        showModal("Success", message, true);
    }

    // Close modal event listeners
    modalCloseBtn.addEventListener("click", hideModal);
    closeModal.addEventListener("click", hideModal);
    
    // Close modal when clicking outside
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            hideModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            hideModal();
        }
    });

    // Client-side validation functions
    function validateEmail(email) {
        if (!email || email.trim() === "") {
            return "Email is required";
        }
        
        if (email.length < validationRules.email.minLength) {
            return `Email must be at least ${validationRules.email.minLength} characters`;
        }
        
        if (email.length > validationRules.email.maxLength) {
            return `Email must not exceed ${validationRules.email.maxLength} characters`;
        }
        
        if (!validationRules.email.pattern.test(email)) {
            return validationRules.email.message;
        }
        
        return null;
    }

    function validatePassword(password) {
        if (!password || password.trim() === "") {
            return "Password is required";
        }
        
        if (!validationRules.password.pattern.test(password)) {
            return validationRules.password.message;
        }
        
        return null;
    }

    function setInputState(input, isValid) {
        if (isValid) {
            input.classList.remove("input-error");
            input.classList.add("input-success");
        } else {
            input.classList.remove("input-success");
            input.classList.add("input-error");
        }
    }

    function clearInputStates() {
        emailInput.classList.remove("input-error", "input-success");
        passwordInput.classList.remove("input-error", "input-success");
    }

    // Real-time validation
    emailInput.addEventListener("input", function() {
        const email = this.value.trim();
        const errorMessage = validateEmail(email);
        setInputState(this, !errorMessage);
    });

    passwordInput.addEventListener("input", function() {
        const password = this.value;
        const errorMessage = validatePassword(password);
        setInputState(this, !errorMessage);
    });

    // Form submission with popup validation
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Client-side validation first
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError) {
            setInputState(emailInput, false);
            showErrorModal(emailError);
            return;
        }

        if (passwordError) {
            setInputState(passwordInput, false);
            showErrorModal(passwordError);
            return;
        }

        // Show loading state
        loginBtn.classList.add("loading");
        loginBtn.disabled = true;

        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Success
                clearInputStates();
                showSuccessModal("Login successful! Redirecting to your dashboard...");
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = data.redirectUrl;
                }, 2000);
                
            } else {
                // Handle different types of backend errors
                let errorMessage = "Login failed";
                
                if (res.status === 401) {
                    if (data.error && data.error.includes("User does not exist")) {
                        errorMessage = "No account found with this email address. Please check your email or sign up for a new account.";
                    } else if (data.error && data.error.includes("Invalid Credentials")) {
                        errorMessage = "Incorrect password. Please check your password and try again.";
                        setInputState(passwordInput, false);
                    } else {
                        errorMessage = data.error || "Authentication failed. Please check your credentials.";
                    }
                } else if (res.status === 400) {
                    // Handle Joi validation errors from backend
                    if (data.message && data.message.includes("email")) {
                        errorMessage = "Please enter a valid email address.";
                        setInputState(emailInput, false);
                    } else if (data.message && data.message.includes("password")) {
                        errorMessage = "Password does not meet requirements. Please ensure it has 8+ characters with uppercase, lowercase, number, and special character.";
                        setInputState(passwordInput, false);
                    } else {
                        errorMessage = data.message || "Please check your input and try again.";
                    }
                } else if (res.status === 500) {
                    errorMessage = "Server error occurred. Please try again in a few moments.";
                } else if (res.status === 403) {
                    errorMessage = "Access denied. Please contact support if this persists.";
                } else {
                    errorMessage = data.error || data.message || "An unexpected error occurred. Please try again.";
                }
                
                showErrorModal(errorMessage);
            }
            
        } catch (err) {
            console.error("Login error:", err);
            showErrorModal("Network error occurred. Please check your internet connection and try again.");
            
        } finally {
            // Remove loading state
            loginBtn.classList.remove("loading");
            loginBtn.disabled = false;
        }
    });

    // Initialize
    clearInputStates();
});
  