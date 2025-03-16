// Elements
const passwordForm = document.getElementById("passwordForm");
const generatedPassword = document.getElementById("generatedPassword");
const toggleVisibilityBtn = document.getElementById("toggleVisibility");
const eyeIcon = toggleVisibilityBtn.querySelector('ion-icon');
const copyBtn = document.getElementById("copyPassword");
const alertBox = document.getElementById("alertBox"); // Make sure this exists in your HTML

// ✅ Check if elements exist before proceeding
if (passwordForm && generatedPassword && toggleVisibilityBtn && copyBtn) {

    // Submit event for password generation
    passwordForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);

        // Convert checkbox values to boolean
        data.include_upper = data.include_upper === "on";
        data.include_lower = data.include_lower === "on";
        data.include_numbers = data.include_numbers === "on";
        data.include_special = data.include_special === "on";

        data.length = parseInt(data.length, 10);

        // Length validation before sending the request
        if (isNaN(data.length) || data.length < 12 || data.length > 64) {
            showAlert("Password length must be between 12 and 64 characters.");
            generatedPassword.value = "Invalid length!";
            generatedPassword.type = 'text';
            generatedPassword.disabled = true;
            return;
        }

        hideAlert(); // Clear previous alerts if everything's good

        try {
            const response = await fetch("/generate_password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                generatedPassword.value = result.password;
                generatedPassword.type = 'password'; // Reset to password type after generation
                eyeIcon.setAttribute('name', 'eye-outline'); // Reset eye icon
                generatedPassword.disabled = false; // Enable input in case it was disabled
                showAlert("Password generated successfully!", "success");
            } else {
                generatedPassword.value = '';
                generatedPassword.type = 'text';
                generatedPassword.disabled = true;
                showAlert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error(error.message);
            generatedPassword.value = `Error: ${error.message}`;
            generatedPassword.type = 'text';
            generatedPassword.disabled = true;
            showAlert(`Error: ${error.message}`);
        }
    });

    // ✅ FIXED: Toggle password visibility with Ionicons
    toggleVisibilityBtn.addEventListener('click', () => {
        if (generatedPassword.type === 'password') {
            generatedPassword.type = 'text';
        } else {
            generatedPassword.type = 'password';
        }

        // ✅ Correctly update icon based on state
        eyeIcon.setAttribute('name', generatedPassword.type === 'password' ? 'eye-outline' : 'eye-off-outline');
    });

    // ✅ Copy to clipboard event
    copyBtn.addEventListener('click', () => {
        if (generatedPassword.disabled || !generatedPassword.value || generatedPassword.value.includes("Error")) {
            showAlert("Nothing to copy!", "error");
            return;
        }

        navigator.clipboard.writeText(generatedPassword.value)
            .then(() => {
                console.log('Password copied!');
                showAlert("Password copied to clipboard!", "success");
            })
            .catch(err => {
                console.error('Failed to copy!', err);
                showAlert("Failed to copy password!", "error");
            });
    });

} else {
    console.error('One or more elements are missing from the DOM.');
}

// ✅ Show alerts with dynamic types + auto-dismiss + close button
function showAlert(message, type = 'error') {
    if (!alertBox) return;

    // Reset content and classes
    alertBox.textContent = message;
    alertBox.className = 'alert'; // Base alert class reset

    // Add the alert type class (success or error)
    if (type === 'success') {
        alertBox.classList.add('success');
    }

    // Create and add the close button (×)
    let closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.marginLeft = '12px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = 'bold';

    // When user clicks close button
    closeBtn.onclick = () => {
        hideAlert();
    };

    // Remove previous close button if already exists
    const existingCloseBtn = alertBox.querySelector('span');
    if (existingCloseBtn) {
        existingCloseBtn.remove();
    }

    alertBox.appendChild(closeBtn);

    // Show the alert
    alertBox.classList.add('show');

    // Auto-dismiss after 5 seconds with fade-out
    setTimeout(() => {
        alertBox.style.opacity = '0';
        alertBox.style.transform = 'translateY(-20px)';

        // After fade-out transition ends
        setTimeout(() => {
            hideAlert();
            alertBox.style.opacity = '';
            alertBox.style.transform = '';
        }, 300); // Should match CSS transition duration
    }, 3000);
}

// ✅ Hide alerts function with optional fade-out reset
function hideAlert() {
    if (!alertBox) return;

    alertBox.className = 'alert hidden';

    // Optional: reset other styles if modified during fade-out
    alertBox.style.opacity = '';
    alertBox.style.transform = '';
}

