// EMAIL TOGGLE: Set to true to enable email notifications, false to disable (for testing)
const SEND_EMAIL = false;

// Backend API URL
const API_URL = 'http://localhost:3000';

// EmailJS Configuration
const EMAILJS_USER_ID = "49ST1ACb66DTSZ7Kr";           
const EMAILJS_SERVICE_ID = "service_gqp4jfc";          
const EMAILJS_TEMPLATE_ID = "template_eq7ezoa";        

// ==========================================
// STATE MANAGEMENT (Retrieved from sessionStorage)
// ==========================================
let generatedOTP = sessionStorage.getItem('generatedOTP');
let otpExpiry = parseInt(sessionStorage.getItem('otpExpiry'));
let userEmail = sessionStorage.getItem('tempEmail');
let userName = sessionStorage.getItem('tempName');
let userId = sessionStorage.getItem('tempId');
let userRole = sessionStorage.getItem('tempRole');
let timerInterval = null;

// ==========================================
// DOM ELEMENTS
// ==========================================
const otpForm = document.getElementById('otpForm');
const otpInput = document.getElementById('otp');
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
const errorMsg = document.getElementById('error');
const emailDisplay = document.getElementById('userEmail');
const timerElement = document.getElementById('timer');
const timerText = document.getElementById('timerText');

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (!userEmail || !generatedOTP) {
        alert('Session expired or invalid access. Redirecting to login.');
        window.location.href = 'login.html';
        return;
    }

    emailDisplay.textContent = userEmail;
    
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_USER_ID);
    }

    startTimer();
    console.log('🚀 OTP Verification initialized');
});

// ==========================================
// VERIFY OTP
// ==========================================
otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const enteredOTP = otpInput.value.trim();

    if (enteredOTP.length !== 6) {
        showError('Please enter a 6-digit OTP');
        return;
    }

    // Check expiry
    if (Date.now() > otpExpiry) {
        showError('OTP has expired. Please try again.');
        return;
    }

    if (enteredOTP === generatedOTP) {
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Logging in...';
        showSuccess('OTP Verified! Logging you in...');

        const user = {
            id: userId,
            name: userName,
            email: userEmail,
            role: userRole
        };

        // Complete login
        const rememberMe = sessionStorage.getItem('rememberMe') === 'true';
        if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            sessionStorage.setItem('user', JSON.stringify(user));
        }

        // Cleanup session
        sessionStorage.removeItem('generatedOTP');
        sessionStorage.removeItem('otpExpiry');
        sessionStorage.removeItem('tempEmail');
        sessionStorage.removeItem('tempName');
        sessionStorage.removeItem('tempId');
        sessionStorage.removeItem('tempRole');

        // Redirect
        const redirectUrl = user.role === 'admin' ? "../Admin/admin.html" : "index.html";
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1000);
    } else {
        showError('Invalid OTP. Please try again.');
        otpInput.value = '';
        otpInput.focus();
    }
});

// ==========================================
// RESEND OTP
// ==========================================
resendBtn.addEventListener('click', async () => {
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    clearError();

    try {
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        otpExpiry = Date.now() + 5 * 60 * 1000;

        // Update session
        sessionStorage.setItem('generatedOTP', generatedOTP);
        sessionStorage.setItem('otpExpiry', otpExpiry.toString());

        const templateParams = {
            to_name: userName,
            to_email: userEmail,
            otp_code: generatedOTP,
            user_name: userName,
            from_name: "Urban Barrels",
            message: `Your new verification code is: ${generatedOTP}. Valid for 5 minutes.`
        };

        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        
        showSuccess('New OTP sent! Check your email.');
        clearInterval(timerInterval);
        startTimer();
        otpInput.value = '';
        otpInput.focus();
    } catch (error) {
        console.error('Resend error:', error);
        showError('Failed to resend OTP.');
    } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
    }
});

// ==========================================
// HELPERS
// ==========================================
function startTimer() {
    updateTimer();
    timerElement.classList.remove('expired', 'warning');
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const timeLeft = otpExpiry - Date.now();
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerElement.classList.add('expired');
        timerText.textContent = 'OTP Expired';
        verifyBtn.disabled = true;
        return;
    }

    const mins = Math.floor(timeLeft / 60000);
    const secs = Math.floor((timeLeft % 60000) / 1000);
    if (timeLeft < 60000) timerElement.classList.add('warning');
    timerText.textContent = `Expires in ${mins}:${secs.toString().padStart(2, '0')}`;
}

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

function clearError() {
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
}

if (otpInput) {
    otpInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}
