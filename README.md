# CypressTestRepo

Full-stack MERN Todo application with JWT authentication and role-based access control.

## Functionality

- User registration and login
- JWT-based protected routes
- Todo CRUD (create, read, update, delete)
- Todo fields: title, description, priority (`low`, `medium`, `high`), due date, completed status
- User-scoped todos (users can access only their own todos)
- Admin endpoint to fetch all todos
- React frontend with dashboard, create/edit modal flows, and auth state via context

## Tech Stack

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (local or Atlas)
- **Auth:** JWT + role-based authorization

## Project Structure

- `backend/` Express API and MongoDB models
- `frontend/` React client app

## API Overview

Base URL: `http://localhost:8080/api` (or your configured backend port)

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)

### Todos (Protected)

- `GET /todos`
- `GET /todos/:id`
- `POST /todos`
- `PUT /todos/:id`
- `DELETE /todos/:id`
- `GET /todos/admin/all` (admin only)

---

## Setup

### Prerequisites

- Node.js 18+ (Node 14+ may work, but 18+ is recommended)
- npm
- MongoDB (local instance or MongoDB Atlas)

### 1) Clone and install dependencies

From repo root:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure backend environment

Create `backend/.env`:

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_strong_jwt_secret>
PORT=8080
NODE_ENV=development
```

### 3) Configure frontend environment

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

> If you run backend on a different port (for example `5000`), update `REACT_APP_API_URL` accordingly.

### 4) Run the app

Start backend (terminal 1):

```bash
cd backend
npm run dev
```

Start frontend (terminal 2):

```bash
cd frontend
npm start
```

### 5) Open in browser

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:8080/api/health`

---

## Notes

- Keep secrets in `.env` files and avoid committing them.
- Frontend stores JWT in `localStorage` and sends it as `Authorization: Bearer <token>` via Axios interceptor.
