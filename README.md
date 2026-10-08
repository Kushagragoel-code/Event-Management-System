# Event Management System

## Project Description
A full-stack web application allowing Admins to create and manage events, while Users can view and register for upcoming events. Built with client-side rendering.

## Features
- User Authentication (Register/Login) with JWT.
- Role-based Access Control (Admin vs. User).
- **Admin:** Create, Read, Update, and Delete events.
- **User:** View all events and register for events.

## Tech Stack
- **Frontend:** React.js, Vite, React Router, Axios
- **Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

## API Endpoints
**Auth**
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

**Events**
- `GET /api/events` - Get all events (Admin/User)
- `POST /api/events` - Create an event (Admin Only)
- `GET /api/events/:id` - Get single event details (Admin/User)
- `PUT /api/events/:id` - Update an event (Admin Only)
- `DELETE /api/events/:id` - Delete an event (Admin Only)

## Setup Instructions
1. Clone the repository: `git clone [YOUR_GITHUB_REPO_URL]`
2. **Backend Setup:**
   - Navigate to `/Backend`: `cd Backend`
   - Install dependencies: `npm install`
   - Create a `.env` file based on `.env.example`.
   - Start the server: `npm run dev`
3. **Frontend Setup:**
   - Navigate to the frontend app: `cd Frontend/vite-project`
   - Install dependencies: `npm install`
   - Create a `.env` file based on `.env.example`.
   - Start the React app: `npm run dev`

## Environment Variables
*See `.env.example` files in both the Backend and Frontend directories.*
- **Backend:** `PORT`, `MONGO_URI`, `JWT_SECRET`
- **Frontend:** `VITE_API_URL`

## Team Members
- [Your Name] - [Roll No.] (Team Lead)
- [Member 1 Name] - [Roll No.]
- [Member 2 Name] - [Roll No.]
- [Member 3 Name] - [Roll No.]

## Deployment Links
- **GitHub Repository:** [URL]
- **Frontend (Vercel):** [URL]
- **Backend:** [URL]