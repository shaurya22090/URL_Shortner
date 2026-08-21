# URL Shortener API

A backend REST API that shortens long URLs into short, shareable links — similar to bit.ly. Built as a hands-on project to learn Node.js, Express, MongoDB, and authentication.

Each user has their own account. Visiting a shortened link redirects to the original URL, and click activity is tracked per link. Users can only view and manage the links they created.

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — web framework for routing and middleware
- **MongoDB** — database (hosted on MongoDB Atlas)
- **Mongoose** — ODM for schema modeling and database interaction
- **bcrypt** — password hashing
- **jsonwebtoken (JWT)** — authentication tokens
- **dotenv** — environment variable management

## Features

- User registration and login with hashed passwords (bcrypt)
- JWT-based authentication — protected routes require a valid token
- Per-user data ownership — each user can only see and manage their own shortened links
- Shorten any valid long URL into a unique short code
- Returns the existing short URL if the same long URL is submitted again (no duplicates)
- Redirects short URLs to their original destination
- Tracks click count per shortened link
- Validates input — rejects missing or malformed URLs
- Persistent storage — data survives server restarts

## Getting Started

### Prerequisites

- Node.js installed
- A MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository

   ```
   git clone https://github.com/shaurya22090/URL_Shortner.git
   cd URL_Shortner
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```
   MONGO_URI=your_mongodb_connection_string_here
   JWT_Secrete_key=your_own_random_secret_string_here
   ```

4. Start the server

   ```
   node routes/main.js
   ```

   The server will run on `http://localhost:3000`.

## API Endpoints

### Register a new user

```
POST /auth/register
```

**Request body:**

```json
{
  "username": "shaurya",
  "password": "yourpassword"
}
```

Passwords are hashed with bcrypt before being stored — raw passwords are never saved. On success, a JWT is returned immediately so the new user is logged in.

**Response:**

```json
{
  "message": "SignUp successful!",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error responses:**

- `400` — username already in use

---

### Login

```
POST /auth/login
```

**Request body:**

```json
{
  "username": "shaurya",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Use this token in the `Authorization` header for all protected routes below, formatted as:

```
Authorization: Bearer <token>
```

**Error responses:**

- `401` — invalid username or password

---

### Shorten a URL 🔒 _(requires authentication)_

```
POST /urls
```

**Request body:**

```json
{
  "LongURL": "https://www.example.com/some/very/long/path"
}
```

**Response:**

```json
{
  "_id": "64f8a1b2c3d4e5f678901234",
  "LongURL": "https://www.example.com/some/very/long/path",
  "ShortURL": "http://localhost:3000/aZ3xQ1",
  "Clicks": 0,
  "CreatedAt": "2026-08-01T10:00:00.000Z",
  "CreatedBy": "64f7a0c1b2d3e4f567890123"
}
```

If the same `LongURL` is submitted again, the existing document is returned instead of creating a duplicate.

**Error responses:**

- `401` — missing, invalid, or expired token
- `400` — missing `LongURL` field
- `400` — `LongURL` is not a valid URL

---

### Get all your shortened URLs 🔒 _(requires authentication)_

```
GET /urls
```

Returns every short URL created by the currently authenticated user.

**Response:**

```json
[
  {
    "_id": "64f8a1b2c3d4e5f678901234",
    "LongURL": "https://www.example.com/some/very/long/path",
    "ShortURL": "http://localhost:3000/aZ3xQ1",
    "Clicks": 4,
    "CreatedAt": "2026-08-01T10:00:00.000Z",
    "CreatedBy": "64f7a0c1b2d3e4f567890123"
  }
]
```

**Error responses:**

- `401` — missing, invalid, or expired token
- `404` — you haven't created any short URLs yet

---

### Get a specific link's info 🔒 _(requires authentication)_

```
GET /urls/:shortCode
```

Returns the full record for a given short code, including current click count. Only accessible by the user who created the link.

**Response:**

```json
{
  "_id": "64f8a1b2c3d4e5f678901234",
  "LongURL": "https://www.example.com/some/very/long/path",
  "ShortURL": "http://localhost:3000/aZ3xQ1",
  "Clicks": 4,
  "CreatedAt": "2026-08-01T10:00:00.000Z",
  "CreatedBy": "64f7a0c1b2d3e4f567890123"
}
```

**Error responses:**

- `401` — missing, invalid, or expired token
- `403` — link exists but wasn't created by you
- `404` — short code not found

---

### Redirect to original URL

```
GET /:shortcode
```

Visiting a shortened link (e.g. `http://localhost:3000/aZ3xQ1`) redirects the browser to the original long URL and increments its click count. Publicly accessible — no authentication required.

**Error response:**

- `404` — URL not found

## Project Structure

```
URL_Shortner/
├── connection/
│   └── connect.js              # MongoDB connection setup
├── middleware/
│   └── authMiddleware.js       # JWT verification middleware
├── models/
│   ├── DbsSchema.js            # URL schema and Mongoose model
│   ├── UserSchema.js           # User schema and Mongoose model
│   └── shortCodeGenrater.js    # Random short code generator
├── routes/
│   └── main.js                 # Express app, routes, and server entry point
├── .env                         # Environment variables (not committed)
├── .gitignore
└── package.json
```

## What This Project Demonstrates

- RESTful API design with Express
- Schema modeling and CRUD operations with Mongoose/MongoDB
- Async/await for handling database operations
- Password security with bcrypt hashing
- Authentication and authorization with JWT
- Custom Express middleware for route protection
- Per-user data scoping and access control
- Input validation and error handling
- Environment-based configuration for sensitive credentials
- Generating unique identifiers with collision checking

## Future Improvements

- Deploy to a live hosting service with a real domain
- Add expiration dates for shortened links
- Add a simple frontend for ease of use
- Rate limiting to prevent abuse
- Refresh tokens for longer-lived sessions
