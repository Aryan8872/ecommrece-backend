# E-Commerce Application

## Overview
This is a full-stack e-commerce application with user authentication, product management, and an admin panel.

## Getting Started

### Starting the Backend Server

**Option 1: Using the batch file**
1. Navigate to the backend directory
2. Double-click on `start-server.bat`

**Option 2: Using the terminal**
1. Open a terminal in the backend directory
2. Run: `npm start`

### Starting the Frontend Application

1. Navigate to the frontend directory (`ecomerce proj`)
2. Open a terminal and run:
   ```
   npm install
   npm run dev
   ```

## Common Issues

### Network Error when Logging In

If you see a "Network Error" when trying to log in, it means the backend server is not running. Please follow the instructions above to start the backend server.

### Admin Login

To access the admin panel:
1. Go to `/admin/login`
2. Log in with admin credentials
3. You will be redirected to the admin dashboard at `/admin`

## Features

- User authentication (login/register)
- Product browsing and management
- Admin panel for user and product management
- Role-based access control