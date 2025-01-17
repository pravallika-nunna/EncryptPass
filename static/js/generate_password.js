// Add an event listener for form submission
document.getElementById("passwordForm").addEventListener("submit", async function (event) {
    // Prevent default form submission behavior
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Convert checkboxes to boolean values
    data.include_upper = data.include_upper === "on";
    data.include_lower = data.include_lower === "on";
    data.include_numbers = data.include_numbers === "on";
    data.include_special = data.include_special === "on";

    // Convert the length field to an integer
    data.length = parseInt(data.length, 10);

    // Send a POST request to the server
    try {
        const response = await fetch("/generate_password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        // Parse the JSON response
        const result = await response.json();

        // Display the result
        if (result.success) {
            document.getElementById("generatedPassword").textContent = result.password;
        } else {
            document.getElementById("generatedPassword").textContent = `Error: ${result.error}`;
        }
    } catch (error) {
        // Handle errors (e.g., network issues)
        document.getElementById("generatedPassword").textContent = `Error: ${error.message}`;
    }
});