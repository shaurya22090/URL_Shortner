# URL Shortener API

A backend REST API that shortens long URLs into short, shareable links — similar to bit.ly. Built as a hands-on project to learn Node.js, Express, and MongoDB.

Visiting a shortened link redirects to the original URL, and click activity is tracked for each link.

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — web framework for routing and middleware
- **MongoDB** — database (hosted on MongoDB Atlas)
- **Mongoose** — ODM for schema modeling and database interaction
- **dotenv** — environment variable management

## Features

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

   ```bash
   git clone <your-repo-url>
   cd url-shortener
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB connection string:

   ```
   MONGO_URI=your_mongodb_connection_string_here
   ```

4. Start the server

   ```bash
   node main.js
   ```

   The server will run on `http://localhost:3000`.

## API Endpoints

### Shorten a URL

```
POST /URL_Shorten
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
  "CreatedAt": "2026-08-01T10:00:00.000Z"
}
```

If the same `LongURL` is submitted again, the existing document is returned instead of creating a duplicate.

**Error responses:**

- `400` — missing `LongURL` field
- `400` — `LongURL` is not a valid URL

---

### Redirect to original URL

```
GET /:shortcode
```

Visiting a shortened link (e.g. `http://localhost:3000/aZ3xQ1`) redirects the browser to the original long URL and increments its click count.

**Error response:**

- `404` — short code not found

---

### Get link stats

```
GET /info/:shortcode
```

Returns the full record for a given short code, including current click count.

**Response:**

```json
{
  "_id": "64f8a1b2c3d4e5f678901234",
  "LongURL": "https://www.example.com/some/very/long/path",
  "ShortURL": "http://localhost:3000/aZ3xQ1",
  "Clicks": 4,
  "CreatedAt": "2026-08-01T10:00:00.000Z"
}
```

**Error response:**

- `404` — short code not found

## Project Structure

```
url-shortener/
├── connection/
│   └── connect.js         # MongoDB connection setup
├── models/
│   ├── DbsSchema.js        # URL schema and Mongoose model
│   └── shortCodeGenrater.js  # Random short code generator
├── routes/
│   └── main.js              # Express app, routes, and server entry point
├── .env                      # Environment variables (not committed)
├── .gitignore
└── package.json
```

## What This Project Demonstrates

- RESTful API design with Express
- Schema modeling and CRUD operations with Mongoose/MongoDB
- Async/await for handling database operations
- Input validation and error handling
- Environment-based configuration for sensitive credentials
- Generating unique identifiers with collision checking

## Future Improvements

- Deploy to a live hosting service with a real domain
- Add expiration dates for shortened links
- Add a simple frontend for ease of use
- Rate limiting to prevent abuse
