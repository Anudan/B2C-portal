
// EMAIL TOGGLE: Set to true to enable email notifications, false to disable (for testing)
const SEND_EMAIL = false;

// Function to calculate age from date of birth
function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

document.getElementById("registerForm").addEventListener("submit", function(event){
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let dob = document.getElementById("dob").value;
    let error = document.getElementById("error");

    if(username === "" || email === "" || password === "" || dob === ""){
        error.textContent = "Please fill all fields.";
        return;
    }

    // Check if user is at least 18 years old
    const age = calculateAge(dob);
    if(age < 18){
        error.textContent = "You must be at least 18 years old to register.";
        error.style.color = "red";
        alert("You must be at least 18 years old to register.");
        return;
    }

    // Clear any previous error messages
    error.textContent = "";
    
    // Proceed with registration
    if (SEND_EMAIL) {
        // Initialize EmailJS
        emailjs.init("49ST1ACb66DTSZ7Kr");

        // Send email to the new user
        const templateParams = {
            to_name: username,
            to_email: email,
            message: "Welcome to Urban Barrels, " + username + "!\n\nYour account has been successfully created.\n\nUsername: " + username + "\nEmail: " + email + "\nDate of Birth: " + dob
        };

        emailjs.send("service_gqp4jfc", "template_lkdy2rh", templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert("Registration Successful! Welcome email sent.");
                window.location.href = "login.html";
            }, function(error) {
                console.log('FAILED...', error);
                alert("Registration Successful, but failed to send notification. Error: " + JSON.stringify(error));
                window.location.href = "login.html";
            });
    } else {
        // Email disabled - redirect directly
        alert("Registration Successful! (Email notifications disabled)");
        window.location.href = "login.html";
    }
});
