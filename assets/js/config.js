// CENTRAL CONFIGURATION
// You only need to change settings in this file.

const CONFIG = {
    // EMAIL TOGGLE: Set to true to enable email notifications, false to disable (for testing)
    SEND_EMAIL: true,

    // Backend API URL
    API_URL: 'http://localhost:3000',

    // EmailJS Configuration
    EMAILJS_USER_ID: "49ST1ACb66DTSZ7Kr",
    EMAILJS_SERVICE_ID: "service_gqp4jfc",
    EMAILJS_TEMPLATE_ID: "template_eq7ezoa",
    
    // Registration Email Template (if different)
    EMAILJS_REGISTER_TEMPLATE_ID: "template_lkdy2rh"
};

// Prevent the config from being modified accidentally
Object.freeze(CONFIG);
