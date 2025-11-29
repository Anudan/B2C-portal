
// Set your correct login details
const adminname = "Anudan Sainju";
const adminemail = "123anudansainju@gmail.com";
const adminpassword = "admin123";

document.getElementById("loginForm").addEventListener("submit", function(event){
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let error = document.getElementById("error");

    if(email === "" || password === ""){
        error.textContent = "Please fill all fields.";
    }
    else if(email === adminemail && password === adminpassword){
        error.textContent = "";
        
        // Initialize EmailJS
        emailjs.init("49ST1ACb66DTSZ7Kr");

        // Send email
        const templateParams = {
            to_name: adminname,
            to_email: adminemail,
            message: "Hi " + adminname + ", \n\nAdmin logged in successfully at " + new Date().toLocaleString()
        };

        emailjs.send("service_gqp4jfc", "template_eq7ezoa", templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert("Login successful! Email notification sent.");
                // Redirect to admin dashboard
                window.location.href = "../Admin/admin.html";
            }, function(error) {
                console.log('FAILED...', error);
                alert("Login successful, but failed to send email. Error: " + JSON.stringify(error));
                // Redirect anyway as login was successful
                window.location.href = "../Admin/admin.html";
            });
    }
    else{
        error.textContent = "Invalid Username or Password";
        document.getElementById("loginForm").reset();
    }
});