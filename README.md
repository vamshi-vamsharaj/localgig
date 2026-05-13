<div align="center">

# 🌐 LocalGig

### *Hyperlocal Freelance Marketplace — Connect. Work. Earn.*

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square)](https://github.com/vamshi-vamsharaj/localgig/pulls)
[![Stars](https://img.shields.io/github/stars/vamshi-vamsharaj/localgig?style=flat-square&color=gold)](https://github.com/vamshi-vamsharaj/localgig/stargazers)
[![Issues](https://img.shields.io/github/issues/vamshi-vamsharaj/localgig?style=flat-square)](https://github.com/vamshi-vamsharaj/localgig/issues)

<br/>

> **LocalGig** is a full-stack hyperlocal freelance marketplace that bridges the gap between clients who need tasks done and skilled freelancers in their area. Built with a modern Next.js 15 App Router architecture, featuring real-time messaging, location-aware task discovery, and a comprehensive dashboard — all in a responsive, production-grade UI.

<br/>

[🚀 Live Demo](https://localgig.vercel.app/) &nbsp;·&nbsp; [🐛 Report Bug](https://github.com/vamshi-vamsharaj/localgig/issues) &nbsp;·&nbsp; [💡 Request Feature](https://github.com/vamshi-vamsharaj/localgig/issues)

</div>



## 🎯 What Is LocalGig?

The global freelance economy is dominated by platforms serving remote work — but what about tasks that need a local touch? Lawn care, furniture assembly, local delivery, tutoring, home repairs — these are best done by someone *nearby*.

**LocalGig** solves this by combining the power of a freelance marketplace with location-aware task discovery, giving clients a way to post hyperlocal gigs and giving freelancers a streamlined pipeline from discovery to application to communication — all in one platform.

---

## ✨ Features

### 🔐 Authentication & Security
- Secure **Sign Up / Sign In** flows with session management
- **Protected routes** — dashboard and user-specific pages are auth-gated
- Role-aware UI that adapts to the logged-in user's context

### 📋 Task Management
- **Post tasks** with rich details: title, description, budget, deadline, and location
- **Browse & discover** open tasks with location-based filtering
- Full **CRUD lifecycle** for tasks — post, update, close, or delete

### 🙋 Freelancer Applications
- One-click **apply to tasks** with optional cover message
- Clients can **view all applicants** per task with status tracking
- Freelancers get a dedicated **"Applied Tasks"** view to track their pipeline

### 💬 Messaging System
- **In-app chat** between clients and applicants
- Persistent conversation threads tied to task context
- Clean, WhatsApp-inspired UI with real-time-ready architecture

### 🗂️ Dashboard & Analytics
- Unified **dashboard home** with key stats and activity snapshot
- Separate panels for **posted tasks**, **applied tasks**, **saved tasks**, and **applicants**
- Stats cards showing task counts, application rates, and activity trends

### 📍 Location-Aware Discovery
- **Location picker** integrated into task creation
- Dedicated **API route for location data** (`/api/tasks/locations`)
- Enables hyperlocal search — find gigs in your neighborhood

### 🔖 Saved Tasks
- Bookmark interesting gigs for later with a **"Save Task"** feature
- Dedicated **Saved Tasks** view with instant unsave capability

### ⚙️ User Settings & Profile
- Editable **profile management** (name, bio, avatar, skills)
- Notification preferences and account settings via tabbed UI
- Clean toggle switches and form validation

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | Server/client components, routing, SSR |
| **Language** | TypeScript | Type safety across the full stack |
| **Frontend** | React 19 | Interactive UI with hooks & context |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first design with accessible components |
| **Database** | MongoDB (via Mongoose) | Flexible, document-oriented data storage |
| **Auth** | Custom Auth (`better-auth`) | Secure session-based authentication |
| **API** | Next.js Route Handlers | RESTful endpoints for all core resources |
| **Deployment** | Vercel-ready | Optimized for edge deployments |

---

## 📁 Project Structure

```
localgig/
│
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public-facing pages (no auth required)
│   │   ├── sign-in/              # Authentication — Sign In
│   │   ├── sign-up/              # Authentication — Sign Up
│   │   ├── tasks/                # Public task browsing
│   │   │   └── new/              # Post a new task (redirects if unauthed)
│   │   └── page.tsx              # Landing / Home page
│   │
│   ├── api/                      # REST API route handlers
│   │   ├── auth/[...all]/        # Auth endpoints (session, login, logout)
│   │   ├── applications/         # Apply to / manage applications
│   │   └── tasks/
│   │       ├── route.ts          # Task CRUD
│   │       └── locations/        # Location data endpoint
│   │
│   └── dashboard/                # Protected dashboard (auth required)
│       ├── applicants/           # View applicants for your tasks
│       ├── applied/              # Tasks you've applied to
│       ├── messages/             # In-app messaging
│       ├── post-task/            # Create a new task
│       ├── posted/               # Your posted tasks
│       ├── saved/                # Bookmarked tasks
│       ├── settings/             # Profile & preferences
│       └── tasks/                # Browse tasks from dashboard
│
├── components/                   # Reusable React components
│   ├── dashboard/
│   │   ├── messages/             # Chat UI: input, window, bubbles, conversations
│   │   ├── settings/             # Profile form, settings sections, toggles
│   │   ├── tasks/                # Task creation form, location picker
│   │   ├── ApplicationCard.tsx
│   │   ├── DashboardClient.tsx
│   │   ├── FindTasks.tsx
│   │   └── ...
│   ├── ui/                       # shadcn/ui base components
│   ├── app-sidebar.tsx           # Navigation sidebar
│   └── navbar.tsx                # Top navigation bar
│
├── lib/                          # Core business logic
│   ├── actions/                  # Server Actions (data fetching & mutations)
│   ├── auth/                     # Auth config (client + server)
│   ├── models/                   # Mongoose schemas (User, Task, Application, Message)
│   ├── schemas/                  # Zod validation schemas
│   ├── types/                    # Shared TypeScript types
│   ├── db.ts                     # MongoDB connection singleton
│   └── utils.ts                  # Utility helpers
│
├── hooks/                        # Custom React hooks
├── scripts/                      # DB seed scripts
├── .env.local                    # Environment variables (not committed)
└── next.config.ts                # Next.js configuration
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** `v18.0+`
- **npm** or **yarn**
- A **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/vamshi-vamsharaj/localgig.git
cd localgig
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local  # if example exists, otherwise create manually
```

Then populate it with your values:

```env
# ── Database ────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/localgig

# ── Authentication ───────────────────────────────────────
BETTER_AUTH_SECRET=your_super_secret_key_here
BETTER_AUTH_URL=http://localhost:3000

# ── App ─────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> 💡 **Tip:** Generate a secure secret with `openssl rand -base64 32`

### 4. Seed the Database *(Optional)*

```bash
npx tsx scripts/seedTask.ts
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 🔌 API Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| `GET` | `/api/tasks` | Fetch all tasks | ❌ |
| `POST` | `/api/tasks` | Create a new task | ✅ |
| `GET` | `/api/tasks/locations` | Get distinct task locations | ❌ |
| `POST` | `/api/applications` | Apply to a task | ✅ |
| `GET` | `/api/applications` | Get applications (by task or user) | ✅ |
| `POST` | `/api/auth/[...all]` | Auth endpoints (login, logout, session) | — |

---

## 💡 Why I Built This

Most freelance platforms (Fiverr, Upwork, Toptal) are built for remote, digital work. But a massive segment of everyday tasks — home repairs, tutoring, errands, local delivery — are *inherently local*.

I wanted to build something that:

1. **Solves a real problem** — a Craigslist alternative with a proper UX
2. **Challenged me technically** — App Router, server actions, real-time chat architecture, and auth from scratch
3. **Resembles a production product** — not a tutorial clone, but something with real-world architecture decisions

LocalGig became my vehicle for exploring **full-stack development at depth**: from database schema design to component architecture to protected routing patterns.

---

## 🧩 Challenges & Learnings

### 🔄 App Router Mental Model
Shifting from the Pages Router to App Router required rethinking how data flows. Learning when to use Server Components vs Client Components, and how to co-locate server actions, was a significant architectural challenge.

### 🔐 Auth Without a Library Shortcut
Building auth with `better-auth` (rather than NextAuth) gave me deep insight into how session management, cookie handling, and middleware-based route protection actually work under the hood.

### 🗃️ Schema Design for Relationships
MongoDB is schemaless, but real applications aren't. Designing the relationships between `User`, `Task`, `Application`, and `Message` models — and ensuring efficient queries — required careful Mongoose schema design.

### 💬 Messaging Architecture
Building a chat system that is context-aware (tied to a task + two participants) while remaining extensible for real-time features (WebSocket/SSE) was an interesting product and engineering design challenge.

### 📍 Location-Aware Features
Implementing location-based task discovery required a custom API endpoint aggregating distinct locations and building a reusable `LocationPicker` component — a small feature with significant UX impact.

---

## 🔮 Future Improvements

- [ ] **Real-time messaging** via WebSockets or Server-Sent Events (SSE)
- [ ] **Map integration** (Google Maps / Mapbox) for visual task discovery
- [ ] **Push notifications** for new applications and messages
- [ ] **Payment integration** (Stripe) for task escrow and payouts
- [ ] **Reviews & ratings** system for clients and freelancers
- [ ] **Task status tracking** (Open → In Progress → Completed)
- [ ] **Mobile app** via React Native or Expo
- [ ] **Admin dashboard** for platform moderation
- [ ] **AI-powered task matching** based on skills and location
- [ ] **Email notifications** (Resend / SendGrid) for key events

---

## 🤝 Contributing

Contributions are what make open source great. Any contributions you make are **greatly appreciated**.

1. **Fork** the project
2. **Create** your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'feat: add AmazingFeature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

Please read the [Contributing Guidelines](CONTRIBUTING.md) and ensure your code follows the existing TypeScript and ESLint conventions.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

---

## 👤 Author

<div align="center">

**Vamshi Shyamala**

[![GitHub](https://img.shields.io/badge/GitHub-vamshi--vamsharaj-181717?style=for-the-badge&logo=github)](https://github.com/vamshi-vamsharaj)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/vamshi-shyamala)

*Full-Stack Developer passionate about building products that solve real problems.*

</div>

---

<div align="center">

**If you find this project useful, please consider giving it a ⭐ — it means a lot!**

Made with ❤️ by [Vamshi Shyamala](https://github.com/vamshi-vamsharaj)

</div>
