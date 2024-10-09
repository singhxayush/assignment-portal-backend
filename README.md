# Assignment Submission Portal

A backend system for managing assignment submissions between users and admins. Built with Node.js, Express, and MongoDB.

## Table of Contents
- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication Routes](#authentication-routes)
  - [Assignment Routes](#assignment-routes)
  - [Admin Routes](#admin-routes)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)

## Features
- User Authentication (JWT)
- Role-based Access Control (Admin/User)
- Assignment Creation and Management
- Multiple Admin Assignment System
- Assignment Status Tracking
- Feedback System

## Setup and Installation
1. **Clone the repository**
```bash
git clone <repository-url>
cd assignment-portal
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory and add:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

4. **Run the application**
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 8080) |
| MONGO_DB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT authentication |

## API Documentation

### Authentication Routes

#### Register User
```http
POST /api/register
```
**Request Body:**
```json
{
    "fullName": "John Doe",
    "username": "johndoe",
    "password": "password123",
    "isAdmin": false
}
```
**Response:** `201 Created`
```json
{
    "_id": "user_id",
    "fullName": "John Doe",
    "username": "johndoe",
    "isAdmin": false
}
```

#### Login
```http
POST /api/login
```
**Request Body:**
```json
{
    "username": "johndoe",
    "password": "password123"
}
```
**Response:** `200 OK`
```json
{
    "user": {
        "_id": "user_id",
        "fullName": "John Doe",
        "username": "johndoe",
        "isAdmin": false
    },
    "token": "jwt_token"
}
```

### Assignment Routes

#### Create Assignment (User Only)
```http
POST /api/assignments
```
**Request Body:**
```json
{
    "task": "Create a landing page using HTML and CSS",
    "assignedAdmins": ["admin1", "admin2"]
}
```
**Response:** `201 Created`
```json
{
    "_id": "assignment_id",
    "task": "Create a landing page using HTML and CSS",
    "userId": {
        "fullName": "John Doe",
        "username": "johndoe"
    },
    "status": "pending",
    "feedback": "",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
}
```

#### Get Assignments
```http
GET /api/assignments
```
**Response for Users:** `200 OK`
```json
[
    {
        "_id": "assignment_id",
        "task": "Create a landing page using HTML and CSS",
        "status": "pending",
        "feedback": "",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
    }
]
```

### Admin Routes

#### Get All Admins
```http
GET /api/admins
```
**Response:** `200 OK`
```json
[
    {
        "_id": "admin_id",
        "fullName": "Admin Name",
        "username": "admin1"
    }
]
```

#### Accept Assignment
```http
POST /api/assignments/:id/accept
```
**Request Body:**
```json
{
    "feedback": "Great work! All requirements met."
}
```
**Response:** `200 OK`
```json
{
    "_id": "assignment_id",
    "status": "accepted",
    "feedback": "Great work! All requirements met.",
    "updatedAt": "timestamp"
}
```

#### Reject Assignment
```http
POST /api/assignments/:id/reject
```
**Request Body:**
```json
{
    "feedback": "Please improve the responsive design"
}
```
**Response:** `200 OK`
```json
{
    "_id": "assignment_id",
    "status": "rejected",
    "feedback": "Please improve the responsive design",
    "updatedAt": "timestamp"
}
```

## Database Schema

### User Schema
```javascript
{
    fullName: String,
    username: String (unique),
    password: String (hashed),
    isAdmin: Boolean
}
```

### Assignment Schema
```javascript
{
    userId: ObjectId (ref: 'User'),
    task: String,
    assignedAdmins: [ObjectId] (ref: 'User'),
    status: String (enum: ['pending', 'accepted', 'rejected']),
    feedback: String,
    timestamps: true
}
```

## Error Handling
All endpoints return error responses in the following format:
```json
{
    "error": "Error message description"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error