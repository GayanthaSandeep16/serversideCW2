# TravelTales

A tourism blog platform where users can share travel stories, follow other travelers, and explore country information. Built for the University of Westminster 6C0SC022W Coursework 2 (2023/24).

## Project Overview

TravelTales allows users to:

- Register and log in to create, edit, and delete blog posts about visited countries.
- Follow/unfollow other users and view their posts in a personalized feed.
- Like, dislike, and comment on posts.
- Search posts by country or username, with sorting options.
- View country details (flag, currency, capital) via an external API or Coursework 1 microservice.

The project uses Node.js and SQLite for the back-end, with a REST API. The front-end uses JavaScript (e.g., React, EJS, or vanilla JS) with Fetch/Axios for API calls.

## Project Structure

```
TravelTales/
├── backend/                  # Back-end Node.js application
├── frontend/                 # Front-end JavaScript application
└── README.md                
```

## Prerequisites

- **Node.js** (v18 or higher): Install from https://nodejs.org/
- **SQLite3**: Install from https://www.sqlite.org/download.html and add to PATH.
- **Docker** (optional): For CW1 microservice or containerized deployment.

## Setup Instructions

### Back-End

1. Navigate to the back-end folder:

   ```bash
   cd backend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and update:

     ```
     PORT=3000
     JWT_SECRET=your-secure-jwt-secret-key
     COUNTRY_API_URL=https://restcountries.com/v3.1
     ```
   - If using CW1 microservice:
     - Run the CW1 Docker container and get its API key.
     - Update `.env` with:

       ```
       INTERNAL_SERVICE_URL=http://<cw1-container-ip>:8080
       AUTH_TOKEN=your-cw1-api-key
       ```
4. Initialize the SQLite database:

   ```bash
   cd D:\serversideCw2\serversideCW2\backend
   >> node src\script\database.js
   ```
5. Start the back-end server:

   ```bash
   npm start
   ```

   The API will be available at `http://localhost:3000`.

### Front-End

1. Navigate to the front-end folder:

   ```bash
   cd frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the front-end application:

   ```bash
   npm start
   ```

   The front-end will typically run at `http://localhost:3000` or another port (check console output).

## Running with Coursework 1 Microservice (Optional)

- If using CW1 for country data:
  1. Deploy the CW1 microservice in a Docker container.
  2. Obtain the API key from the CW1 service.
  3. Update the back-end `.env` file with the CW1 URL and API key (see above).
- If not using CW1, the back-end defaults to the REST Countries API (`https://restcountries.com/v3.1`), and no API key is needed.

## Testing

- Use Postman or `curl` to test the API endpoints (e.g., `POST /api/users/register`, `GET /api/blogs/search`).
- Ensure the database is initialized and the server is running.

## Notes

- The back-end API supports all required features: user management, blog posts, search, follow system, comments, likes, and country data.
- The front-end handles navigation, post display, and sorting (newest, most liked, most commented).