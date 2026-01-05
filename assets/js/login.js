
// ==========================================
// DOM ELEMENTS
// ==========================================
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const loginBtn = document.getElementById('loginBtn');
const togglePassword = document.getElementById('togglePassword');
const errorMsg = document.getElementById('error');

// ==========================================
// INITIALIZE EMAILJS
// ==========================================
if (typeof emailjs !== 'undefined') {
    emailjs.init(CONFIG.EMAILJS_USER_ID);
}

// ==========================================
// LOGIN HANDLER
// ==========================================
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showError("Please fill all fields.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';
    showLoading("Logging in...");

    try {
        const response = await fetch(`${CONFIG.API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            if (CONFIG.SEND_EMAIL) {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const expiry = Date.now() + 5 * 60 * 1000;

                // Store state for secondary page
                sessionStorage.setItem('tempEmail', email);
                sessionStorage.setItem('tempName', data.user.name);
                sessionStorage.setItem('tempId', data.user.id);
                sessionStorage.setItem('tempRole', data.user.role);
                sessionStorage.setItem('generatedOTP', otp);
                sessionStorage.setItem('otpExpiry', expiry.toString());
                sessionStorage.setItem('rememberMe', rememberMeCheckbox.checked ? 'true' : 'false');

                // Send OTP
                const templateParams = {
                    to_name: data.user.name,
                    to_email: email,
                    otp_code: otp,
                    user_name: data.user.name,
                    from_name: "Urban Barrels",
                    message: `Your verification code is: ${otp}. Valid for 5 minutes.`
                };

                await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, templateParams);
                
                showSuccess('Credentials verified! Redirecting to OTP verification...');
                setTimeout(() => {
                    window.location.href = 'verify-otp.html';
                }, 1000);

            } else {
                completeLoginDirectly(data.user);
            }
        } else {
            showError(data.message || "Invalid credentials");
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    } catch (err) {
        console.error('Login error:', err);
        showError("Unable to connect to server.");
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

function completeLoginDirectly(user) {
    if (rememberMeCheckbox && rememberMeCheckbox.checked) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        sessionStorage.setItem('user', JSON.stringify(user));
    }
    window.location.href = user.role === 'admin' ? "../Admin/admin.html" : "index.html";
}

// ==========================================
// UI HELPERS
// ==========================================
function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    errorMsg.style.color = '#dc3545';
}

function showSuccess(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    errorMsg.style.color = '#28a745';
}

function showLoading(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    errorMsg.style.color = '#007bff';
}

if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
}
