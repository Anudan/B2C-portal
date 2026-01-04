// ==========================================
// CONFIGURATION
// ==========================================
const SEND_EMAIL = false; // Set to false to disable email OTP (for testing)
const API_URL = 'http://localhost:3000';

// EmailJS Configuration - REPLACE WITH YOUR ACTUAL CREDENTIALS
const EMAILJS_USER_ID = "49ST1ACb66DTSZ7Kr";           
const EMAILJS_SERVICE_ID = "service_gqp4jfc";          
const EMAILJS_TEMPLATE_ID = "template_eq7ezoa";        

// ==========================================
// STATE MANAGEMENT
// ==========================================
let generatedOTP = null;
let otpExpiry = null;
let userEmail = null;
let userName = null;
let userId = null;
let userRole = null;
let currentStep = 1;
let timerInterval = null;

// ==========================================
// DOM ELEMENTS
// ==========================================
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const loginForm = document.getElementById('loginForm');
const otpForm = document.getElementById('otpForm');
const socialLogin = document.getElementById('socialLogin');
const loginFooter = document.getElementById('loginFooter');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const otpInput = document.getElementById('otp');
const rememberMeCheckbox = document.getElementById('rememberMe');
const loginBtn = document.getElementById('loginBtn');
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
const togglePassword = document.getElementById('togglePassword');
const errorMsg = document.getElementById('error');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const emailDisplay = document.getElementById('userEmail');
const timerElement = document.getElementById('timer');
const timerText = document.getElementById('timerText');
const backToLoginBtn = document.getElementById('backToLogin');

// ==========================================
// INITIALIZE EMAILJS
// ==========================================
console.log('🚀 Initializing EmailJS...');
console.log('User ID:', EMAILJS_USER_ID);
console.log('Service ID:', EMAILJS_SERVICE_ID);
console.log('Template ID:', EMAILJS_TEMPLATE_ID);

// Check if emailjs is loaded
if (typeof emailjs === 'undefined') {
    console.error('❌ EmailJS library not loaded! Check if script tag is present in HTML.');
    alert('Email service not available. Please refresh the page.');
} else {
    emailjs.init(EMAILJS_USER_ID);
    console.log('✅ EmailJS initialized successfully');
}

// ==========================================
// STEP 1: LOGIN WITH EMAIL & PASSWORD
// ==========================================
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
        showError("Please fill all fields.");
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';
    showLoading("Logging in...");

    try {
        console.log('🔐 Attempting login for:', email);

        // Call backend API for authentication
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('📥 Login response:', data);

        if (data.success) {
            // Store user data temporarily (don't log in yet)
            userEmail = email;
            userName = data.user.name;
            userId = data.user.id;
            userRole = data.user.role;

            console.log('✅ Credentials verified. Role:', userRole);

            if (SEND_EMAIL) {
                // Generate and send OTP
                generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
                otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

                console.log('🔢 Generated OTP:', generatedOTP);
                console.log('⏰ OTP will expire at:', new Date(otpExpiry));

                // Check if emailjs is available
                if (typeof emailjs === 'undefined') {
                    console.error('❌ EmailJS not available');
                    showError('Email service not available. Please refresh the page.');
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                    return;
                }

                try {
                    console.log('📧 Preparing to send email...');
                    
                    // Send OTP via EmailJS
                    const templateParams = {
                        to_name: userName,
                        to_email: email,
                        otp_code: generatedOTP,
                        user_name: userName,
                        from_name: "Urban Barrels",
                        message: `Your verification code is: ${generatedOTP}. Valid for 5 minutes.`
                    };

                    console.log('📨 Sending email with params:', {
                        ...templateParams,
                        otp_code: '******' // Hide OTP in logs for security
                    });

                    const emailResponse = await emailjs.send(
                        EMAILJS_SERVICE_ID, 
                        EMAILJS_TEMPLATE_ID, 
                        templateParams
                    );

                    console.log('✅ Email sent successfully!', emailResponse);
                    console.log('Response status:', emailResponse.status);
                    console.log('Response text:', emailResponse.text);
                    
                    showSuccess('Credentials verified! OTP sent to your email.');

                    // Move to step 2 after 1.5 seconds
                    setTimeout(() => {
                        goToStep2();
                    }, 1500);

                } catch (emailError) {
                    console.error('❌ Email send error:', emailError);
                    console.error('Error details:', {
                        name: emailError.name,
                        message: emailError.message,
                        text: emailError.text,
                        status: emailError.status
                    });
                    
                    // Show detailed error to user
                    let errorMessage = 'Failed to send OTP. ';
                    if (emailError.text) {
                        errorMessage += emailError.text;
                    } else if (emailError.message) {
                        errorMessage += emailError.message;
                    }
                    
                    showError(errorMessage);
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                    return;
                }
            } else {
                // Email disabled - skip OTP and login directly
                console.log('⚠️ Email disabled, logging in directly');
                completeLogin(data.user);
            }
        } else {
            showError(data.message || "Invalid email or password");
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    } catch (err) {
        console.error('❌ Login error:', err);
        showError("Unable to connect to server. Please try again.");
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// ==========================================
// STEP 2: VERIFY OTP
// ==========================================
otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const enteredOTP = otpInput.value.trim();

    if (enteredOTP.length !== 6) {
        showError('Please enter a 6-digit OTP');
        return;
    }

    console.log('🔍 Verifying OTP...');
    console.log('Entered:', enteredOTP);
    console.log('Expected:', generatedOTP);
    clearError();

    // Check if OTP has expired
    const currentTime = Date.now();
    if (currentTime > otpExpiry) {
        console.error('⏰ OTP expired');
        showError('OTP has expired. Please login again.');
        clearInterval(timerInterval);
        setTimeout(() => {
            goToStep1();
        }, 2000);
        return;
    }

    // Verify OTP matches
    if (enteredOTP === generatedOTP) {
        console.log('✅ OTP verified successfully!');

        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Logging in...';

        showSuccess('OTP Verified! Logging you in...');

        // Clear timer
        clearInterval(timerInterval);

        // Complete login
        const user = {
            id: userId,
            name: userName,
            email: userEmail,
            role: userRole
        };

        completeLogin(user);

    } else {
        console.error('❌ Invalid OTP entered');
        showError('Invalid OTP. Please try again.');
        otpInput.value = '';
        otpInput.focus();
    }
});

// ==========================================
// COMPLETE LOGIN FUNCTION
// ==========================================
function completeLogin(user) {
    console.log('✅ Completing login for user:', user);

    // Store user session based on remember me checkbox
    if (rememberMeCheckbox && rememberMeCheckbox.checked) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('rememberMe', 'true');
        console.log('💾 User stored in localStorage (persistent)');
    } else {
        sessionStorage.setItem('user', JSON.stringify(user));
        console.log('💾 User stored in sessionStorage (session only)');
    }

    // Clear sensitive data
    generatedOTP = null;
    otpExpiry = null;

    // Determine redirect URL based on role
    let redirectUrl;
    if (user.role === 'admin') {
        redirectUrl = "../Admin/admin.html";
    } else {
        redirectUrl = "index.html";
    }

    console.log('🔄 Redirecting to:', redirectUrl);

    // Show success message and redirect
    showSuccess('Login successful! Redirecting...');
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 1000);
}

// ==========================================
// RESEND OTP
// ==========================================
resendBtn.addEventListener('click', async () => {
    console.log('🔄 Resending OTP...');

    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    clearError();

    try {
        // Generate new OTP
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        otpExpiry = Date.now() + 5 * 60 * 1000;

        console.log('🔢 New OTP generated:', generatedOTP);
        console.log('⏰ New OTP will expire at:', new Date(otpExpiry));

        // Check if emailjs is available
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS not available');
            showError('Email service not available. Please refresh the page.');
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
            return;
        }

        console.log('📧 Preparing to resend email...');

        // Send via EmailJS
        const templateParams = {
            to_name: userName,
            to_email: userEmail,
            otp_code: generatedOTP,
            user_name: userName,
            from_name: "Urban Barrels",
            message: `Your new verification code is: ${generatedOTP}. Valid for 5 minutes.`
        };

        const emailResponse = await emailjs.send(
            EMAILJS_SERVICE_ID, 
            EMAILJS_TEMPLATE_ID, 
            templateParams
        );

        console.log('✅ New OTP email sent successfully', emailResponse);
        showSuccess('New OTP sent! Check your email.');

        // Reset timer
        clearInterval(timerInterval);
        timerElement.classList.remove('expired');
        startTimer();

        otpInput.value = '';
        otpInput.focus();
        verifyBtn.disabled = false;

    } catch (error) {
        console.error('❌ Resend error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            text: error.text,
            status: error.status
        });
        showError('Failed to resend OTP. Please try again.');
    } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
    }
});

// ==========================================
// COUNTDOWN TIMER
// ==========================================
function startTimer() {
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const now = Date.now();
    const timeLeft = otpExpiry - now;

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerElement.classList.add('expired');
        timerElement.classList.remove('warning');
        timerText.textContent = 'OTP Expired';
        showError('OTP has expired. Please login again.');
        verifyBtn.disabled = true;
        return;
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    // Add warning class when less than 1 minute remaining
    if (timeLeft < 60000) {
        timerElement.classList.add('warning');
    } else {
        timerElement.classList.remove('warning');
    }
    
    timerText.textContent = `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ==========================================
// UI HELPER FUNCTIONS
// ==========================================

function goToStep2() {
    currentStep = 2;
    loginForm.classList.add('hidden');
    socialLogin.classList.add('hidden');
    loginFooter.classList.add('hidden');
    otpForm.classList.remove('hidden');
    step1.classList.remove('active');
    step2.classList.add('active');
    pageTitle.textContent = 'Verify OTP';
    pageSubtitle.textContent = 'Enter the 6-digit code we sent to your email';
    emailDisplay.textContent = userEmail;
    clearError();
    otpInput.focus();
    startTimer();
    console.log('📍 Moved to Step 2: OTP Verification');
}

function goToStep1() {
    currentStep = 1;
    otpForm.classList.add('hidden');
    socialLogin.classList.remove('hidden');
    loginFooter.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    step2.classList.remove('active');
    step1.classList.add('active');
    pageTitle.textContent = 'Sign in';
    pageSubtitle.textContent = 'Enter your registered email and password';
    clearError();
    emailInput.value = '';
    passwordInput.value = '';
    otpInput.value = '';
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verify & Login';
    generatedOTP = null;
    otpExpiry = null;
    userEmail = null;
    userName = null;
    userId = null;
    userRole = null;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    console.log('📍 Moved to Step 1: Login');
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    errorMsg.style.color = '#dc3545';
    errorMsg.style.background = 'rgba(220,53,69,.1)';
    errorMsg.style.padding = '10px';
    errorMsg.style.borderRadius = '8px';
    errorMsg.style.marginTop = '10px';
}

function showSuccess(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    errorMsg.style.color = '#28a745';
    errorMsg.style.background = 'rgba(40,167,69,.1)';
    errorMsg.style.padding = '10px';
    errorMsg.style.borderRadius = '8px';
    errorMsg.style.marginTop = '10px';
}

function showLoading(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    errorMsg.style.color = '#007bff';
    errorMsg.style.background = 'rgba(0,123,255,.1)';
    errorMsg.style.padding = '10px';
    errorMsg.style.borderRadius = '8px';
    errorMsg.style.marginTop = '10px';
}

function clearError() {
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
}

// ==========================================
// PASSWORD VISIBILITY TOGGLE
// ==========================================
if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
}

// ==========================================
// INPUT VALIDATION
// ==========================================
if (otpInput) {
    otpInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

// ==========================================
// BACK TO LOGIN BUTTON
// ==========================================
if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔙 User clicked back to login');
        
        // Clear OTP data
        generatedOTP = null;
        otpExpiry = null;
        
        // Return to step 1
        goToStep1();
    });
}

// ==========================================
// CHECK EXISTING SESSION
// ==========================================
window.addEventListener('load', () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
        console.log('👤 User already logged in, redirecting...');
        const userData = JSON.parse(user);
        const redirectUrl = userData.role === 'admin' ? "../Admin/admin.html" : "index.html";
        window.location.href = redirectUrl;
    }
});

// ==========================================
// CLEANUP ON PAGE UNLOAD
// ==========================================
window.addEventListener('beforeunload', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
});

// ==========================================
// INITIALIZATION LOG
// ==========================================
console.log('='.repeat(50));
console.log('🚀 LOGIN WITH 2FA SYSTEM INITIALIZED');
console.log('='.repeat(50));
console.log('📧 Email notifications:', SEND_EMAIL ? 'ENABLED ✅' : 'DISABLED ⚠️');
console.log('📍 Current Step:', currentStep);
console.log('🔧 EmailJS Status:', typeof emailjs !== 'undefined' ? 'Loaded ✅' : 'Not Loaded ❌');
console.log('='.repeat(50));