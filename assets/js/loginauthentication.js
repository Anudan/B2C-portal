// EMAIL TOGGLE: Set to true to enable email notifications, false to disable (for testing)
const SEND_EMAIL = true;

// Backend API URL
const API_URL = 'http://localhost:3000';

document.getElementById("loginForm").addEventListener("submit", async function(event){
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let error = document.getElementById("error");

    if(email === "" || password === ""){
        error.textContent = "Please fill all fields.";
        return;
    }

    // Show loading state
    error.textContent = "Logging in...";
    error.style.color = "blue";

    try {
        // Call backend API for authentication
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            error.textContent = "";
            error.style.color = "red"; // Reset color
            
            // Store user info in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user));
            
            // Determine redirect based on role
            let redirectUrl;
            if (data.user.role === 'admin') {
                redirectUrl = "../Admin/admin.html";
            } else {
                // Customer - redirect to home
                redirectUrl = "index.html";
            }
            
            if (SEND_EMAIL) {
                // Initialize EmailJS
                emailjs.init("49ST1ACb66DTSZ7Kr");

                // Send email
                const templateParams = {
                    to_name: data.user.name,
                    to_email: data.user.email,
                    message: "Hi " + data.user.name + ", \n\n" + (data.user.role === 'admin' ? 'Admin' : 'You') + " logged in successfully at " + new Date().toLocaleString()
                };

                emailjs.send("service_gqp4jfc", "template_eq7ezoa", templateParams)
                    .then(function(response) {
                        console.log('SUCCESS!', response.status, response.text);
                        alert("Login successful! Email notification sent.");
                        window.location.href = redirectUrl;
                    }, function(error) {
                        console.log('FAILED...', error);
                        alert("Login successful, but failed to send email.");
                        window.location.href = redirectUrl;
                    });
            } else {
                // Email disabled - redirect directly
                alert("Login successful!");
                window.location.href = redirectUrl;
            }
        } else {
            error.textContent = data.message || "Invalid email or password";
            error.style.color = "red";
            document.getElementById("loginForm").reset();
        }
    } catch (err) {
        console.error('Login error:', err);
        error.textContent = "Unable to connect to server. Please try again.";
        error.style.color = "red";
    }
});