// Elements
const passwordForm = document.getElementById("passwordForm");
const generatedPassword = document.getElementById("generatedPassword");
const toggleVisibilityBtn = document.getElementById("toggleVisibility");
const copyBtn = document.getElementById("copyPassword");
const tooltip = document.getElementById("tooltip");
const alertBox = document.getElementById("alertBox"); // Add this to your HTML if it's not there

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
                toggleVisibilityBtn.textContent = '👁️'; // Reset toggle button icon
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

    // Toggle password visibility
    toggleVisibilityBtn.addEventListener('click', () => {
        if (generatedPassword.type === 'password') {
            generatedPassword.type = 'text';
            toggleVisibilityBtn.textContent = '🙈';
        } else {
            generatedPassword.type = 'password';
            toggleVisibilityBtn.textContent = '👁️';
        }
    });

    // Copy to clipboard event
    copyBtn.addEventListener('click', () => {
        if (generatedPassword.disabled || !generatedPassword.value || generatedPassword.value.includes("Error")) {
            showAlert("Nothing to copy!", "error");
            return;
        }

        generatedPassword.select();
        generatedPassword.setSelectionRange(0, 99999); // For mobile devices

        navigator.clipboard.writeText(generatedPassword.value)
            .then(() => {
                console.log('Password copied!');

                if (tooltip) {
                    tooltip.textContent = 'Copied!';
                    tooltip.classList.add('show');

                    setTimeout(() => {
                        tooltip.classList.remove('show');
                        tooltip.textContent = '';
                    }, 1500);
                } else {
                    showAlert("Password copied to clipboard!", "success");
                }
            })
            .catch(err => {
                console.error('Failed to copy!', err);
                showAlert("Failed to copy password!", "error");
            });
    });

} else {
    console.error('One or more elements are missing from the DOM.');
}

function showAlert(message, type = 'error') {
    if (!alertBox) return;

    alertBox.textContent = message;

    // Reset classes
    alertBox.className = 'alert';

    if (type === 'success') {
        alertBox.classList.add('success');
    }

    alertBox.classList.add('show');
}

function hideAlert() {
    if (!alertBox) return;

    alertBox.className = 'alert hidden';
}
