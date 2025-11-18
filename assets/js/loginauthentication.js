
// Set your correct login details
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
        alert("Login successful!");

        // Redirect to admin dashboard
        window.location.href = "../Admin/admin.html";
    }
    else{
        alert("Incorrect Useranme or Password");
        document.getElementById("loginForm").reset();
    }
});

