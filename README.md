# AI IELTS Platform

![AI IELTS Banner](https://img.shields.io/badge/Stack-Next.js%20%7C%20tRPC%20%7C%20Prisma%20%7C%20Better%20Auth-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A state-of-the-art IELTS preparation platform powered by AI, featuring a robust full-stack architecture built with modern web technologies.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API Layer**: [tRPC v11](https://trpc.io/) (TanStack Native)
- **Database ORM**: [Prisma v7](https://www.prisma.io/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 📂 Project Structure

```text
├── app/                  # Next.js App Router
│   ├── api/              # API Route Handlers
│   │   ├── auth/         # Better Auth Endpoints
│   │   └── trpc/         # tRPC API Handler
│   ├── globals.css       # Global Styles (Tailwind v4)
│   ├── layout.tsx        # Root Layout with Providers
│   └── page.tsx          # Home Page
├── components/           # React Components
│   ├── ui/               # Shadcn UI Components
│   └── trpc-provider.tsx # tRPC & React Query Provider
├── generated/            # Custom Prisma Client Output
├── hooks/                # Custom React Hooks
├── lib/                  # Shared Business Logic
│   ├── auth.ts           # Better Auth Configuration
│   ├── db.ts             # Prisma Client & Driver Adapter
│   └── utils.ts          # Utility Functions
├── prisma/               # Database Layer
│   ├── schema.prisma     # Prisma Schema Definition
│   └── migrations/       # Database Migration History
├── server/               # tRPC Server Logic
│   ├── routers/          # API Sub-routers (user, etc.)
│   ├── index.ts          # Main App Router
│   ├── trpc.ts           # tRPC Initialization & Context
│   └── client.ts         # tRPC React Hooks Client
├── public/               # Static Assets
├── prisma.config.ts      # Prisma ORM Configuration
└── tsconfig.json         # TypeScript Configuration
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/)
- PostgreSQL Database (Neon, Local, etc.)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd ai-ielts
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your-postgresql-url"
   BETTER_AUTH_SECRET="your-random-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

### Database Setup

1. **Generate Prisma Client**:
   ```bash
   pnpm dlx prisma generate
   ```

2. **Push Schema to Database**:
   ```bash
   pnpm dlx prisma db push
   ```

3. **(Optional) Seed Database**:
   If you have a seed script defined in `package.json`:
   ```bash
   pnpm dlx prisma db seed
   ```

### Running the App

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 🔐 Core Modules Guide

### Better Auth
Authentication is handled via **Better Auth**. It uses a custom Prisma adapter to store users and sessions.
- **Config**: `lib/auth.ts`
- **Models**: `User`, `Session`, `Account`, `Verification` in `schema.prisma`.

### tRPC v11
Type-safe API communication.
- **Server**: Defined in `server/trpc.ts` with a secure context that includes the user session.
- **Procedures**: Use `protectedProcedure` for authenticated-only actions.
- **Client**: Use hooks from `@/server/client`.

### Prisma 7
Using the latest Prisma architecture with **Driver Adapters** for optimal performance with PostgreSQL.
- **Client**: Located at `@/lib/db`.
- **Output**: Generates to `@/generated/prisma` to keep `node_modules` clean.

### Shadcn & Framer Motion
- UI components are managed via **Shadcn**.
- Interactive elements use **Framer Motion** for smooth, premium-feel transitions.

---

## 📜 License

This project is licensed under the MIT License.
