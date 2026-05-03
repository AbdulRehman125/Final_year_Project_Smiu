# AI IELTS Platform

![AI IELTS Banner](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20tRPC%20%7C%20Prisma%207%20%7C%20Better%20Auth-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A state-of-the-art IELTS preparation platform powered by AI, featuring a robust full-stack architecture built with modern web technologies and an agentic AI workflow.

## 🚀 Tech Stack

- **Framework**: [Next.js 16.x](https://nextjs.org/) (App Router, Proxy Layer)
- **Authentication**: [Better Auth](https://www.better-auth.com/) (with [Better Auth UI](https://ui.better-auth.com/))
- **Email Service**: [Resend](https://resend.com/) & [React Email](https://react.email/)
- **API Layer**: [tRPC v11](https://trpc.io/) (TanStack Native)
- **Database ORM**: [Prisma v7](https://www.prisma.io/) (Postgres Adapter)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 📂 Project Structure

```text
├── app/                  # Next.js 16 App Router
│   ├── auth/             # Authentication Pages (Sign-in, Sign-up, etc.)
│   ├── dashboard/        # Protected User Dashboard
│   ├── api/              # API Route Handlers (tRPC, Better Auth)
│   ├── globals.css       # Global Styles (Tailwind v4)
│   └── layout.tsx        # Root Layout with Auth & tRPC Providers
├── components/           # React Component Library
│   ├── landing/          # Landing Page Components
│   ├── ui/               # Base Shadcn UI Components
│   └── ...               # Auth UI & Business Components
├── lib/                  # Shared Business Logic
│   ├── auth.ts           # Better Auth Server Config
│   ├── auth-client.ts    # Better Auth Client SDK
│   ├── db.ts             # Prisma Client & Neon/Postgres Adapter
│   └── utils.ts          # Utility Functions
├── prisma/               # Database Layer (Schema & Migrations)
├── server/               # tRPC v11 Backend Routers & Context
├── proxy.ts              # Next.js 16 Edge Proxy (formerly middleware.ts)
└── skills-lock.json      # AI Agent Skills Catalog
```

---

## 🤖 AI Agent Skills

This repository is optimized for AI-assisted development with a dedicated set of skills managed via `skills-lock.json`. 

- **Frontend & Design**: Advanced Shadcn orchestration, Tailwind v4 design systems, and Framer Motion micro-interactions.
- **Authentication**: Expert-level Better Auth setup (MFA, Organizations, Email/Password, Better Auth UI).
- **Database Management**: Prisma v7 optimization, schema design, and advanced Client API usage.
- **Communication**: Full Resend stack for transactional emails, React Email templates, and automated email inboxes.
- **Architecture**: Next.js 16 best practices, tRPC v11 patterns, and Zod-powered type safety.
- **Quality**: WCAG 2.2 accessibility compliance and SEO optimization.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/)
- PostgreSQL Database

### Installation

1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd ai-ielts
   pnpm install
   ```

2. **Environment Variables**:
   Create a `.env` file:
   ```env
   DATABASE_URL="your-postgresql-url"
   BETTER_AUTH_SECRET="your-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   RESEND_API_KEY="re_..."
   ```

### Database Setup

```bash
pnpm dlx prisma generate
pnpm dlx prisma db push
```

### Running the App

```bash
pnpm dev
```

---

## 📜 License

MIT License.
