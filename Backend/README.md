# Backend Setup Instructions

## Prerequisites

- Node.js installed (v14 or higher)
- MySQL database running
- Database 'UrbanBarrels' created with users table

## Installation Steps

### 1. Install Node.js Dependencies

Navigate to the Backend folder and run:

```bash
cd Backend
npm install
```

### 2. Configure Database Connection

Open `server.js` and update the MySQL connection settings (lines 15-19):

```javascript
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Change to your MySQL username
  password: "", // Change to your MySQL password
  database: "UrbanBarrels",
});
```

### 3. Ensure Database is Set Up

Make sure you've run the SQL file to create the database and insert admin users:

- Run the SQL commands in `Backend/Queries/Initial.sql`
- This creates the UrbanBarrels database
- Creates the users table
- Inserts 3 admin users

### 4. Start the Backend Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Important Security Notes

⚠️ **WARNING: This implementation stores passwords in plain text!**

For production, you MUST:

1. Hash passwords using bcrypt or similar library
2. Use environment variables for database credentials
3. Implement JWT or session-based authentication
4. Add input validation and sanitization
5. Use HTTPS in production

## API Endpoints

### POST /api/login

Authenticate admin users

- Request body: `{ email: string, password: string }`
- Response: `{ success: boolean, message: string, user?: object }`

### POST /api/register

Register new customer users

- Request body: `{ name: string, email: string, password: string }`
- Response: `{ success: boolean, message: string, user?: object }`

## Testing

1. Start the backend server
2. Open `frontend/login.html` in your browser
3. Try logging in with one of the admin credentials from the database
4. Check the browser console for any errors

## Troubleshooting

### CORS Errors

If you see CORS errors, make sure the backend server is running and CORS is enabled in `server.js`

### Database Connection Failed

- Verify MySQL is running
- Check database credentials in `server.js`
- Ensure database 'UrbanBarrels' exists

### Can't connect to server

- Ensure backend server is running on port 3000
- Check if another application is using port 3000
- Verify API_URL in `loginauthentication.js` matches your server URL
