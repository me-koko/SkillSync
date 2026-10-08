# SkillSync 🎓

> **"Learn together. Teach what you know."**  
> A peer-to-peer skill exchange and collaborative learning platform designed specifically for college students.

---

## 🌟 Overview

**SkillSync** connects college students who want to teach what they already know and learn what they need. Students can discover peers, evaluate compatibility through an intelligent matching algorithm, form structured reciprocal skill-exchange agreements, collaborate in study groups, manage study tasks, and chat in real time.

---

## 🎯 Core Features

1. **Reciprocal Skill Exchanges**: Establish structured 1-on-1 learning agreements (e.g. *User A teaches React* ↔ *User B teaches Python*), set weekly meeting schedules, track progress (Proposed, Active, Paused, Completed), and exchange peer reviews.
2. **Deterministic Compatibility Matcher**: An intelligent algorithm computing a 0–100% compatibility score based on mutual skill fit, level synergy, shared interests, and free time slots with clear human-readable explanations (*"High match: You can teach React, They want to learn React, Both free on weekends"*).
3. **Multi-Faceted Discover Feed**: Search and filter peers by skill, major, university, availability day, learning format, and proficiency level.
4. **Study Groups**: Create public or private subject circles (e.g. *DSA Grind*, *React Beginners*, *System Design*) with role-based member management (Owner, Moderator, Member), group discussion boards, and task tracking.
5. **Task Management**: Kanban-ready study tasks with priorities (Low, Medium, High), due dates, assignees, and quick status toggle checkboxes.
6. **Real-Time Communication (Socket.IO)**: 1-on-1 direct messaging between connections, study group discussion channels, online/offline presence tracking, and typing indicators.
7. **Real-Time Notifications**: Instant socket alerts for connection requests, accepted agreements, new chat messages, and task updates.
8. **Interactive 7-Step Onboarding**: Smooth profile setup covering bio, teaching skills with levels (Beginner to Expert), target learning goals, academic/personal interests, weekly availability slots, and format preferences.
9. **Credential Persistence & Seamless Auth**: Remember Me authentication support, secure JWT handling, and automatic credential persistence for quick logins.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 with Vite and TypeScript
- **Styling**: Tailwind CSS, modern clean student-friendly SaaS interface
- **Icons**: Lucide React
- **Routing**: React Router v6 with protected routes and layouts
- **State & Query**: TanStack React Query + React Contexts (`AuthContext`, `SocketContext`)
- **Real-Time Client**: Socket.IO Client
- **Validation**: Zod schema validation

### Backend
- **Runtime**: Node.js + Express.js with TypeScript
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Real-Time Server**: Socket.IO Server
- **Authentication**: JWT authentication + bcrypt password hashing
- **File Upload & Storage**: Modular `StorageService` supporting Cloudinary with local disk storage fallback

---

## 📂 Project Structure

```
skillsync/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Navbar, Sidebar, Button, Input, Modal, Badge, Avatar, Toast
│   │   │   ├── discover/      # UserCard, MatchExplanationModal
│   │   │   ├── exchanges/     # ExchangeCard, CreateExchangeModal, ReviewModal
│   │   │   ├── groups/        # GroupCard, CreateGroupModal
│   │   │   ├── chat/          # ChatWindow, ConversationList
│   │   │   └── tasks/         # TaskItem, CreateTaskModal
│   │   ├── contexts/          # AuthContext, SocketContext
│   │   ├── layouts/           # RootLayout (marketing), AppLayout (authenticated)
│   │   ├── pages/             # Landing, Login, Register, Onboarding, Home, Discover,
│   │   │                      # Profile, Connections, Exchanges, Groups, GroupDetail,
│   │   │                      # Tasks, Messages, Notifications, Settings
│   │   ├── services/          # Centralized Axios API services
│   │   ├── types/             # TypeScript data models and interfaces
│   │   ├── App.tsx            # Application router
│   │   ├── main.tsx           # React root
│   │   └── index.css          # Tailwind CSS
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma      # Normalized PostgreSQL schema
│   │   └── seed.ts            # Database seed script
│   ├── src/
│   │   ├── config/            # Environment & Prisma client singleton
│   │   ├── controllers/       # Auth, User, Discover, Connection, Exchange, Group, Task, Message, Review
│   │   ├── middleware/        # JWT auth, Zod validation, global error handler
│   │   ├── routes/            # REST API endpoints
│   │   ├── services/          # Matching engine, Notification dispatcher, Modular storage
│   │   ├── socket/            # Socket.IO manager (Presence, Chat)
│   │   ├── utils/             # JWT & Response helpers
│   │   └── server.ts          # Express + Socket.IO server entry point
│   ├── uploads/               # Local file storage fallback
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── README.md
└── .env.example
```

---

## 🗄️ Database Setup & Prisma Schema

### 1. Requirements
- PostgreSQL 14+ (Local service, Docker container, or cloud PostgreSQL like Supabase/Neon/Railway).
- Node.js 18+ and npm.

### 2. Environment Variables (`server/.env`)
Create a `.env` file inside `server/` (see `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres@localhost:5433/skillsync?schema=public"
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Modular Cloudinary configuration (optional - falls back to local disk storage if not set)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Database Migration
Navigate to the `server/` directory:
```bash
cd server

# Install dependencies
npm install

# Push Prisma schema to PostgreSQL database
npm run db:push
```

---

## 🚀 Running the Application

### 1. Run the Backend Server
```bash
cd server
npm run dev
# Or build & run compiled JavaScript
npm run build
npm start
```
The server will start on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

### 2. Run the Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 REST API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new student account |
| **POST** | `/api/auth/login` | Authenticate student and get JWT |
| **GET** | `/api/auth/me` | Fetch authenticated student profile |
| **POST** | `/api/auth/logout` | Terminate session |
| **GET** | `/api/discover` | Search & filter students with match scores |
| **GET** | `/api/discover/matches`| Retrieve top compatible student matches |
| **GET** | `/api/users/:id` | Fetch full public student profile |
| **PUT** | `/api/users/me` | Update headline, bio, privacy settings |
| **POST** | `/api/users/onboarding`| Complete 7-step onboarding flow |
| **GET** | `/api/connections` | View current, incoming, and sent connections |
| **POST** | `/api/connections` | Send connection request |
| **PUT** | `/api/connections/:id` | Accept or reject connection request |
| **GET** | `/api/exchanges` | View skill exchange agreements |
| **POST** | `/api/exchanges` | Propose new skill exchange agreement |
| **PUT** | `/api/exchanges/:id` | Update agreement status (Active, Paused, Completed) |
| **GET** | `/api/groups` | List study groups (with filters) |
| **POST** | `/api/groups` | Create new study group |
| **GET** | `/api/groups/:id` | Fetch study group workspace details |
| **POST** | `/api/groups/:id/join`| Join public study group |
| **GET** | `/api/tasks` | Get tasks (filter by personal, group) |
| **POST** | `/api/tasks` | Create study task |
| **PUT** | `/api/tasks/:id` | Update task status or details |
| **GET** | `/api/messages/conversations` | Get conversations list with unread counts |
| **GET** | `/api/messages/direct/:peerId` | Get 1-on-1 message history |
| **POST** | `/api/messages` | Send message (direct or group) |
| **GET** | `/api/notifications`| Fetch student notifications |
| **PUT** | `/api/notifications/:id/read` | Mark notification as read |
| **POST** | `/api/reviews` | Submit peer review for completed exchange |

---

## 🔮 Future Improvements

- **WebRTC Video/Audio Calls**: Integrated direct peer-to-peer video study sessions.
- **Campus Verified Email Badges**: Student `.edu` email domain auto-verification.
- **Integrated Code Sandbox**: Interactive collaborative code runner for coding study groups.
- **Mobile Native Apps**: React Native cross-platform app reusing shared services.
