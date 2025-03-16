document.addEventListener('DOMContentLoaded', () => {  // Ensure the DOM is loaded first
    const passwordInput = document.getElementById('password');
    const toggleVisibilityBtn = document.getElementById('toggleVisibility');
    const copyPasswordBtn = document.getElementById('copyPassword');
    const resultContainer = document.getElementById('result');

    const strengthElement = document.getElementById('strength');
    const feedbackElement = document.getElementById('feedback');
    const crackTimeElement = document.getElementById('crack_time');
    const lengthRatingElement = document.getElementById('length_rating');
    const pwnedElement = document.getElementById('pwned');
    const pwnedCountElement = document.getElementById('pwned_count');

    const infoButton = document.getElementById('pwnedInfoButton');
    const infoText = document.getElementById('pwnedInfoText');

    infoButton.addEventListener('click', () => {
        // Toggle the hidden class
        infoText.classList.toggle('hidden');
    });

    // Hide result container initially
    resultContainer.style.display = "none";

    // Add event listener for input event
    passwordInput.addEventListener('input', checkPasswordStrength);

    async function checkPasswordStrength() {
        const password = passwordInput.value;
        if (!password) {
            resultContainer.style.display = "none";
            return;
        }

        try {
            const response = await fetch("/password_strength", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: password }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch password strength');
            }

            const data = await response.json();

            resultContainer.style.display = "block";
            strengthElement.textContent = data.strength;
            feedbackElement.textContent = data.feedback;
            crackTimeElement.textContent = data.crack_time;
            pwnedElement.textContent = data.pwned ? "Yes" : "No";
            pwnedCountElement.textContent = data.pwned_count;
            lengthRatingElement.textContent = data.length_rating;

        } catch (error) {
            showAlert('Error fetching password strength: ' + error.message,'error');
        }
    }

    // Toggle password visibility
    toggleVisibilityBtn.addEventListener('click', () => {
        const isPasswordHidden = passwordInput.type === 'password';

        // Toggle password field type
        passwordInput.type = isPasswordHidden ? 'text' : 'password';

        // Update icon name
        const iconName = isPasswordHidden ? 'eye-off-outline' : 'eye-outline';
        document.getElementById('visibilityIcon').setAttribute('name', iconName);
    });


    // Copy password to clipboard
    copyPasswordBtn.addEventListener('click', async () => {
        try {
            if (!passwordInput.value.trim()) {
                showAlert('No password to copy!', 'error');
                return;
            }
            await navigator.clipboard.writeText(passwordInput.value);
            
            showAlert('Password copied to clipboard!', 'success');
        } catch (error) {
            console.error("Failed to copy password:", error);
            showAlert('Failed to copy password. Please try again.','error');
        }
    });

});

// Reusable Alert Function with Auto-dismiss and Close Button
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');

    // Set the message
    alertBox.textContent = message;

    // Create and add the close button (×)
    let closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.marginLeft = '12px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.onclick = () => {
        alertBox.classList.remove('show');
    };

    // Clear previous close buttons if they exist
    const existingCloseBtn = alertBox.querySelector('span');
    if (existingCloseBtn) {
        existingCloseBtn.remove();
    }

    alertBox.appendChild(closeBtn);

    // Apply type (error/success) and show alert
    alertBox.className = `alert ${type} show`;

    // Auto-dismiss after 5 seconds with fade out effect
    setTimeout(() => {
        alertBox.style.opacity = '0';
        alertBox.style.transform = 'translateY(-20px)';

        // Remove 'show' class after transition completes (optional clean-up)
        setTimeout(() => {
            alertBox.classList.remove('show');
            alertBox.style.opacity = '';
            alertBox.style.transform = '';
        }, 300);
    }, 3000);
}


