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
            alert('Error fetching password strength: ' + error.message);
        }
    }

    // Toggle password visibility
    toggleVisibilityBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleVisibilityBtn.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleVisibilityBtn.textContent = '👁️';
        }
    });

    // Copy password to clipboard
    copyPasswordBtn.addEventListener('click', async () => {
        try {
            if (!passwordInput.value.trim()) {
                alert('No password to copy!');
                return;
            }
            await navigator.clipboard.writeText(passwordInput.value);
            alert('Password copied to clipboard!');
        } catch (error) {
            console.error("Failed to copy password:", error);
            alert('Failed to copy password. Please try again.');
        }
    });
});