# Taskly

A production-ready full-stack MERN application for role-based team collaboration. Manage projects, assign tasks, track progress, and monitor dashboards with Admin/Member permissions.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js (Vite), React Router, Axios, Tailwind CSS |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas (Mongoose)            |
| Auth       | JWT + bcrypt                        |
| Deployment | Railway (backend), Vercel (frontend)|

---

## Features

### Authentication
- User signup / login with JWT
- Password hashing with bcrypt
- Protected routes (frontend + backend)
- Role-based access: **Admin** and **Member**

### Admin
- Create / edit / delete projects
- Add/remove team members from projects
- Create and assign tasks to members
- Full dashboard analytics (projects, tasks, team productivity)

### Member
- View assigned projects and tasks
- Update task status (Todo → In Progress → Completed)
- Personal dashboard with upcoming deadlines

### Tasks
- Priority levels: Low / Medium / High
- Status: Todo / In Progress / Completed
- Overdue detection
- Task comments
- Search and filter

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth + error middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── utils/          # Token generator + seed script
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── context/    # Auth context
│       ├── pages/      # Page components
│       └── services/   # Axios API service
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)

### 1. Clone the repo
```bash
git clone <your-repo-url>
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
cp .env.example .env
# Edit .env with your backend URL
npm install
npm run dev
```

### 4. Seed sample data (optional)
```bash
cd backend
npm run seed
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/team-task-manager
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write access
4. Whitelist your IP (or use `0.0.0.0/0` for all IPs)
5. Get the connection string and paste it into `MONGO_URI`

---

## Railway Deployment (Backend)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and create a new project
3. Connect your GitHub repo
4. Set the root directory to `backend`
5. Add environment variables in Railway dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE=7d`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend-url.vercel.app`
6. Railway auto-detects Node.js and runs `npm start`

---

## Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set root directory to `frontend`
4. Add environment variable:
   - `VITE_API_URL=https://your-railway-backend.up.railway.app/api`
5. Deploy

---

## API Endpoints

### Auth
| Method | Endpoint            | Access  | Description          |
|--------|---------------------|---------|----------------------|
| POST   | /api/auth/register  | Public  | Register new user    |
| POST   | /api/auth/login     | Public  | Login                |
| GET    | /api/auth/me        | Private | Get current user     |
| GET    | /api/auth/users     | Admin   | Get all users        |

### Projects
| Method | Endpoint            | Access       | Description          |
|--------|---------------------|--------------|----------------------|
| POST   | /api/projects       | Admin        | Create project       |
| GET    | /api/projects       | Private      | Get projects         |
| GET    | /api/projects/:id   | Private      | Get project by ID    |
| PUT    | /api/projects/:id   | Admin        | Update project       |
| DELETE | /api/projects/:id   | Admin        | Delete project       |

### Tasks
| Method | Endpoint              | Access       | Description          |
|--------|-----------------------|--------------|----------------------|
| POST   | /api/tasks            | Admin        | Create task          |
| GET    | /api/tasks            | Private      | Get tasks            |
| PUT    | /api/tasks/:id        | Private      | Update task          |
| DELETE | /api/tasks/:id        | Admin        | Delete task          |
| POST   | /api/tasks/:id/comments | Private    | Add comment          |

### Dashboard
| Method | Endpoint        | Access  | Description          |
|--------|-----------------|---------|----------------------|
| GET    | /api/dashboard  | Private | Get dashboard stats  |

---

## Demo Credentials

After running `npm run seed` in the backend:

| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin  | admin@demo.com    | admin123   | Harshit Pandey |
| Member | priya@demo.com    | member123  |
| Member | rahul@demo.com    | member123  |
| Member | sneha@demo.com    | member123  |

---

## Health Check

```
GET /api/health
```

Returns server status and environment info.
