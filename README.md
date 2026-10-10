# Collaborative Task Manager

A full-stack web application that helps managers create, assign, track, and manage tasks collaboratively. Users can view their assigned tasks, update task statuses, and track task activity.

## Features

- User registration and login using JWT authentication.
- Passwords securely hashed using bcrypt.
- Role-based access control for Managers and Users.
- Managers can create, edit, assign, and delete tasks.
- Users can view their assigned tasks and update their task status.
- Task status tracking: To Do, In Progress, and Completed.
- Activity history for tracking task actions and updates.
- Protected API routes and server-side permission checks.
- Request rate limiting.
- Responsive user interface built with React and Tailwind CSS.
- Dark mode.
- Form validation and loading, empty, and error states.

## Technology Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- React Context API
- JavaScript

**Backend**
- Node.js
- Express.js
- JWT
- bcryptjs
- express-rate-limit

**Database**
- MongoDB
- Mongoose

## Project Structure

```text
collaborative-task-manager/
├── client/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── server/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── server.js
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account or a local MongoDB installation
- Visual Studio Code (recommended)

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd collaborative-task-manager
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Configure the backend

Open a terminal in VS Code and run:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder with these variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Replace the example values with your own configuration. Never commit real database credentials or JWT secrets.

Start the backend:

```bash
npm run dev
```

The backend should run at:

`http://localhost:5000`

### 3. Configure the frontend

Open a second terminal in VS Code and run:

```bash
cd client
npm install
npm run dev
```

Open the local frontend address printed by Vite, usually:

`http://localhost:5173`

Keep both development servers running while using the application.

## User Roles

### Manager

- Create tasks.
- Assign tasks to users.
- Edit and delete tasks they created.
- View task progress.
- View task activity history.

### User

- View tasks assigned to them.
- Update the status of their assigned tasks.
- View relevant task activity history.

Permissions are checked on the backend, not only in the frontend.

## Task Statuses

- **To Do:** The task has not started.
- **In Progress:** Work on the task is underway.
- **Completed:** The task is finished.

## API Endpoints

All endpoints use the base URL:

`http://localhost:5000`

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the current authenticated user |
| GET | `/api/auth/users` | Get users for task assignment (Manager only) |

### Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks` | Get tasks available to the current user |
| POST | `/api/tasks` | Create and assign a task (Manager only) |
| PUT | `/api/tasks/:id` | Edit a task or update its status, depending on permissions |
| DELETE | `/api/tasks/:id` | Delete a task (Manager only) |
| GET | `/api/tasks/:id/activity` | View task activity history when permitted |

Protected endpoints require a valid JWT access token in the request's `Authorization` header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database Models

### User

Stores user information, including:

- Name
- Email
- Hashed password
- Role
- Created and updated timestamps

### Task

Stores task information, including:

- Title
- Description
- Status
- Due date
- Task creator
- Assigned user
- Created and updated timestamps

### ActivityLog

Stores task activity information, including:

- Related task
- User who performed the action
- Action type
- Activity details
- Timestamp

## Five-Minute Demo Walkthrough

1. Start the backend and frontend.
2. Register the first account in a fresh database to create the Manager account, according to the application's current signup logic.
3. Register another account to create a regular User account.
4. Log in as the Manager.
5. Create a task and assign it to the User.
6. Log out and log in as the User.
7. Open the assigned task and update its status.
8. Log back in as the Manager and confirm the task status has changed.
9. Open the task activity history and demonstrate the recorded actions.

Use test accounts only. The first-account Manager behavior depends on the database being empty.

## Security

- Passwords are hashed before being stored.
- JWT authentication protects private endpoints.
- Role-based permissions are enforced by the backend.
- Request rate limiting helps reduce excessive requests.
- Environment variables are used for sensitive configuration.
- The `.env` file should be excluded from Git.

## AI Tools

ChatGPT was used for development guidance, code debugging, troubleshooting, and README preparation. The project was tested during development to verify its main authentication, task management, role-based access, and activity history workflows.

## Future Improvements

Possible future enhancements include project management, task priorities, search and filtering, notifications, and additional reporting features.
