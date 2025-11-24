document.getElementById("registerForm").addEventListener("submit", function(event){
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let error = document.getElementById("error");

    if(username === "" || email === "" || password === ""){
        error.textContent = "Please fill all fields.";
    }
    else {
        // Initialize EmailJS
        emailjs.init("49ST1ACb66DTSZ7Kr");

        // Send email to the new user
        const templateParams = {
            to_name: username,
            to_email: email,
            message: "Welcome to Urban Barrels, " + username + "!\n\nYour account has been successfully created.\n\nUsername: " + username + "\nEmail: " + email
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
    }
});
