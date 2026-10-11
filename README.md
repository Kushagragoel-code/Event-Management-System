# Event Management System

A full-stack MERN application for organizing and attending college events. Administrators can create, update, and manage events, while regular users can browse, search, filter, and register (RSVP) for events.

## Features

- **User Authentication:** JWT-based user login and registration with password hashing (`bcryptjs`).
- **Role-Based Access Control:** Distinct roles for `User` and `Admin` (with protected admin secret verification).
- **Admin Event Management:** Create, edit, and delete events with capacity and past-date validation.
- **User RSVP System:** Users can register for events, see remaining seat counts, and cancel registrations.
- **Search & Filtering:** Server-side search by title/description, category filtering, and date sorting.
- **Activity Logging:** Request activity logging to server logs (`logs/access.log`).

## Tech Stack

- **Frontend:** React 19, Vite, React Router 7, Vanilla CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account (`User` or `Admin` with `adminKey`)
- `POST /api/auth/login` — Login user and return JWT token
- `GET /api/auth/me` — Get current logged-in user profile (Protected)

### Events
- `GET /api/events` — Get all events (supports `?search=`, `?category=`, `?sort=`)
- `GET /api/events/:id` — Get single event with attendee details
- `POST /api/events` — Create a new event (Admin only)
- `PUT /api/events/:id` — Update event details (Admin only)
- `DELETE /api/events/:id` — Delete an event (Admin only)
- `POST /api/events/:id/register` — Register / RSVP for an event (Protected)
- `POST /api/events/:id/cancel` — Cancel event RSVP (Protected)

## Setup & Running Locally

### 1. Backend Setup
```bash
cd Backend
npm install
npm run dev # or node server.js
```
*Create a `.env` file in `/Backend`:*
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_management
JWT_SECRET=your_secret_key_here
ADMIN_KEY=admin123
```

### 2. Frontend Setup
```bash
cd Frontend/vite-project
npm install
npm run dev
```

## Team Members
- Kushagra Goel (Team Lead)
- Saurav Kumar
- Udit Agarwal
- Aarav Pathak
