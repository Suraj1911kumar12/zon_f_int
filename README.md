# MERN Stack Task Management System

A Task Management Application built using MongoDB, Express.js, React, and Node.js. The entire project is written in TypeScript and styled with Tailwind CSS v4 on the frontend.

## Features

- **User Authentication**: Secure register and login using JWT tokens and password hashing.
- **Task CRUD Operations**: Users can create, read, update, and delete tasks.
- **Double Presentation Layouts**: Toggle between **Grid View** (responsive card grids) and **Table View** (structured tabular lists) in the dashboard.
- **Detailed Pagination & Filters**: Full page windowing (e.g. `1 ... 5 [6] 7 ... 10`), custom page size selections, query keyword search, and status filters.
- **Validation**: Title duplicate checking (prevents tasks with identical names) and input validation.
- **Rich User Experience**: Show/hide password toggles, custom confirmation dialogs, and instant toast notifications via `sonner`.

---

## Project Structure

```
zonvoir_interview/
├── backend/           # Express Server & API (Node.js + TS)
│   ├── src/
│   │   ├── config/    # Database configuration
│   │   ├── middleware/# Auth middleware
│   │   ├── models/    # Mongoose models (User, Task)
│   │   ├── routes/    # Route controllers (auth, tasks)
│   │   └── server.ts  # Express App Entry Point
│   └── .env           # Backend Configuration File
└── frontend/          # React Web Client (Vite + React + TS)
    ├── src/
    │   ├── context/   # Authentication Provider
    │   ├── pages/     # View Pages (Dashboard, Login, Register)
    │   ├── App.tsx    # Main Client Routes
    │   └── index.css  # Tailwind Import Stylesheet
    └── .env           # Frontend Configuration File
```

---

## Getting Started

### Prerequisites

- **Node.js**: Installed on your machine (v18+ recommended)
- **MongoDB**: A running MongoDB Atlas database instance (or a local MongoDB installation)

---

### Backend Setup

1. **Navigate to the Backend directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
   JWT_SECRET=your_jwt_secret_key_here
   ```
   *Note: If your database password contains special characters like `@`, make sure they are URL-encoded (e.g. `@` becomes `%40`).*

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The backend server will start on `http://localhost:5000`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

### Frontend Setup

1. **Navigate to the Frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The frontend app will launch on `http://localhost:5173`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user profile.
- `POST /api/auth/login` - Validate user and sign a JWT authentication token.
- `GET /api/auth/me` - Retrieve details of the current logged-in user.

### Tasks (Requires Bearer Token Header)
- `GET /api/tasks` - Fetch user tasks with pagination (`page`, `limit`), `status` filtering, and `search` query keywords.
- `POST /api/tasks` - Create a new task (validates against duplicate titles).
- `PUT /api/tasks/:id` - Update title, status, description, or due date.
- `DELETE /api/tasks/:id` - Remove a task from database.
