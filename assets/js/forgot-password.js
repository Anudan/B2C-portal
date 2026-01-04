// ==========================================
// CONFIGURATION - UPDATE THESE VALUES
// ==========================================
const EMAILJS_USER_ID = "49ST1ACb66DTSZ7Kr";        // Your EmailJS Public Key
const EMAILJS_SERVICE_ID = "service_gqp4jfc";          // Your EmailJS Service ID
const EMAILJS_TEMPLATE_ID = "template_eq7ezoa";        // Your EmailJS Template ID
const API_BASE_URL = "http://localhost:3000";          // Your backend URL
const REDIRECT_URL = "../index.html";                  // Your homepage URL

// Initialize EmailJS
(function() {
  emailjs.init(EMAILJS_USER_ID);
})();

// ==========================================
// STATE MANAGEMENT
// ==========================================
let generatedOTP = null;
let otpExpiry = null;
let userEmail = null;
let currentStep = 1;

// ==========================================
// DOM ELEMENTS
// ==========================================
const pageTitle = document.getElementById('pageTitle');
const pageDescription = document.getElementById('pageDescription');
const emailForm = document.getElementById('emailForm');
const otpForm = document.getElementById('otpForm');
const emailInput = document.getElementById('email');
const otpInput = document.getElementById('otp');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
const msg = document.getElementById('msg');
const msg2 = document.getElementById('msg2');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');

// ==========================================
// STEP 1: SEND OTP
// ==========================================
emailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  
  if (!email) {
    showMessage(msg, 'Please enter your email address', 'error');
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage(msg, 'Please enter a valid email address', 'error');
    return;
  }

  // Disable button and show loading
  sendOtpBtn.disabled = true;
  sendOtpBtn.textContent = 'Sending...';

  try {
    // Check if email exists in database
    console.log('Checking email:', email);
    const checkResponse = await fetch(`${API_BASE_URL}/api/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const checkData = await checkResponse.json();
    console.log('Email check response:', checkData);

    if (!checkData.success) {
      showMessage(msg, 'Email not found in our system', 'error');
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = 'Send OTP';
      return;
    }

    // Generate 6-digit OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    userEmail = email;

    console.log('Generated OTP:', generatedOTP);
    console.log('OTP will expire at:', new Date(otpExpiry));

    // Send OTP via EmailJS
    const templateParams = {
      to_email: email,
      otp_code: generatedOTP,
      user_name: checkData.userName || 'User',
      from_name: 'Urban Barrels'
    };

    console.log('Sending email via EmailJS...');
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

    console.log('OTP sent successfully!');
    showMessage(msg, '✓ OTP sent successfully! Check your email.', 'success');
    
    // Move to step 2 after 1.5 seconds
    setTimeout(() => {
      goToStep2();
    }, 1500);

  } catch (error) {
    console.error('Error sending OTP:', error);
    showMessage(msg, 'Failed to send OTP. Please try again.', 'error');
    sendOtpBtn.disabled = false;
    sendOtpBtn.textContent = 'Send OTP';
  }
});

// ==========================================
// STEP 2: VERIFY OTP AND LOGIN
// ==========================================
otpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const enteredOTP = otpInput.value.trim();

  if (enteredOTP.length !== 6) {
    showMessage(msg2, 'Please enter a 6-digit OTP', 'error');
    return;
  }

  console.log('Verifying OTP...');

  // Check if OTP has expired
  const currentTime = Date.now();
  if (currentTime > otpExpiry) {
    console.error('OTP expired');
    showMessage(msg2, '⏱ OTP has expired. Please request a new one.', 'error');
    setTimeout(() => {
      goToStep1();
    }, 2000);
    return;
  }

  // Verify OTP matches
  if (enteredOTP === generatedOTP) {
    console.log('OTP verified successfully!');
    
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';
    
    showMessage(msg2, '✓ OTP Verified! Logging you in...', 'success');
    
    // Login user by email
    try {
      console.log('Logging in user:', userEmail);
      
      const response = await fetch(`${API_BASE_URL}/api/login-by-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        // Store user session
        sessionStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('User logged in:', data.user);
        
        showMessage(msg2, '✓ Login successful! Redirecting...', 'success');
        
        // Clear sensitive data
        generatedOTP = null;
        otpExpiry = null;
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = REDIRECT_URL;
        }, 1500);
      } else {
        console.error('Login failed:', data.message);
        showMessage(msg2, 'Login failed. Please try again.', 'error');
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify OTP';
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage(msg2, 'Error logging in. Please try again.', 'error');
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify OTP';
    }
    
  } else {
    console.error('Invalid OTP entered');
    showMessage(msg2, '❌ Invalid OTP. Please try again.', 'error');
    otpInput.value = '';
    otpInput.focus();
  }
});

// ==========================================
// RESEND OTP
// ==========================================
resendBtn.addEventListener('click', async () => {
  console.log('Resending OTP...');
  
  resendBtn.disabled = true;
  resendBtn.textContent = 'Sending...';

  try {
    // Generate new OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    otpExpiry = Date.now() + 5 * 60 * 1000;

    console.log('New OTP generated:', generatedOTP);
    console.log('New OTP will expire at:', new Date(otpExpiry));

    // Send via EmailJS
    const templateParams = {
      to_email: userEmail,
      otp_code: generatedOTP,
      user_name: 'User',
      from_name: 'Urban Barrels'
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

    console.log('New OTP sent successfully');
    showMessage(msg2, '✓ New OTP sent! Check your email.', 'success');
    otpInput.value = '';
    otpInput.focus();

  } catch (error) {
    console.error('Resend error:', error);
    showMessage(msg2, 'Failed to resend OTP. Please try again.', 'error');
  } finally {
    resendBtn.disabled = false;
    resendBtn.textContent = 'Resend';
  }
});

// ==========================================
// UI HELPER FUNCTIONS
// ==========================================

/**
 * Transition to Step 2 (OTP Verification)
 */
function goToStep2() {
  currentStep = 2;
  emailForm.classList.add('hidden');
  otpForm.classList.remove('hidden');
  step1.classList.remove('active');
  step2.classList.add('active');
  pageTitle.textContent = 'Verify OTP';
  pageDescription.textContent = 'Enter the 6-digit code we sent to ' + userEmail;
  msg.classList.remove('show');
  otpInput.focus();
  console.log('Moved to Step 2: OTP Verification');
}

/**
 * Go back to Step 1 (Email Entry)
 */
function goToStep1() {
  currentStep = 1;
  otpForm.classList.add('hidden');
  emailForm.classList.remove('hidden');
  step2.classList.remove('active');
  step1.classList.add('active');
  pageTitle.textContent = 'Forgot Password';
  pageDescription.textContent = "Enter your email address and we'll send you a 6-digit OTP to verify your identity.";
  msg2.classList.remove('show');
  emailInput.value = '';
  otpInput.value = '';
  sendOtpBtn.disabled = false;
  sendOtpBtn.textContent = 'Send OTP';
  generatedOTP = null;
  otpExpiry = null;
  userEmail = null;
  console.log('Moved to Step 1: Email Entry');
}

/**
 * Display a message to the user
 * @param {HTMLElement} element - The message element
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = 'show';
  element.style.color = type === 'success' ? '#28a745' : '#dc3545';
  element.style.background = type === 'success' ? 'rgba(40,167,69,.1)' : 'rgba(220,53,69,.1)';
}

// ==========================================
// INPUT VALIDATION
// ==========================================

// Only allow numeric input for OTP
otpInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// Log initialization
console.log('Forgot Password OTP System Initialized');
console.log('Current Step:', currentStep);