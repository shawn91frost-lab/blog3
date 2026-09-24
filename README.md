# NexusBlog — Headless React + Payload CMS + PostgreSQL Platform

NexusBlog is an enterprise publication platform combining a bespoke **React 19 + Vite 8** frontend with a standalone **Payload CMS** backend powered by **PostgreSQL**.

---

## 🏛️ System Architecture

```
┌──────────────────────────────────────┐
│        React + Vite Frontend         │  (Port 3000)
│   Home, Blog, Dynamic Pages, Search  │
└──────────────────┬───────────────────┘
                   │
           REST / GraphQL API
         (VITE_PAYLOAD_API_URL)
                   │
                   ▼
┌──────────────────────────────────────┐
│             Payload CMS              │  (Port 3001)
│  Admin Studio, Collections, Globals  │
│  Users, Posts, Pages, Media, Menus   │
└──────────────────┬───────────────────┘
                   │
             pg Connection
             (DATABASE_URI)
                   │
                   ▼
┌──────────────────────────────────────┐
│         PostgreSQL Database          │
│   Supabase / Neon / AWS RDS / Local  │
└──────────────────────────────────────┘
```

- **Frontend**: Preserves all existing React components, Tailwind CSS styling, client-side routing, and search interactions.
- **Backend**: Payload CMS manages posts, generic pages, categories, tags, media assets, navigation menus, and global site settings.
- **Database**: Standard relational PostgreSQL database.

---

## 🚀 Quick Start & Development Setup

### 1. Prerequisites
- **Node.js**: `v18.20.0` or `v20.0.0+`
- **npm** or **pnpm**
- **PostgreSQL**: A local PostgreSQL instance or a free cloud instance from [Supabase](https://supabase.com) or [Neon](https://neon.tech).

### 2. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/shawn91frost-lab/blog3.git
cd blog3

# Install frontend dependencies
npm install

# Install CMS dependencies
cd cms
npm install
cd ..
```

### 3. Configure Environment Variables

1. In the project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. In the `cms` directory, copy `.env.example` to `cms/.env`:
   ```bash
   cp cms/.env.example cms/.env
   ```
3. Update `DATABASE_URI` and `PAYLOAD_SECRET` in `cms/.env`:
   ```env
   PORT=3001
   DATABASE_URI="postgresql://postgres:yourpassword@localhost:5432/nexusblog"
   PAYLOAD_SECRET="your_32_character_random_payload_secret_key_here"
   CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
   ```

### 4. Seed the Database (Optional but Recommended)

To automatically populate PostgreSQL with initial categories, tags, articles, dynamic pages, and create the default admin user (`admin@nexusblog.dev`):

```bash
npm run seed:cms
```

Default Admin Credentials:
- **Email**: `admin@nexusblog.dev`
- **Password**: `Password123!`

### 5. Start Development Servers

You can run both services independently or together:

```bash
# Terminal 1: Run Payload CMS backend
npm run dev:cms
# CMS Admin runs on: http://localhost:3001/admin
# CMS REST API:      http://localhost:3001/api

# Terminal 2: Run React / Vite frontend
npm run dev:frontend
# Frontend runs on:  http://localhost:3000
```

---

## 📝 Content Management Workflows

### Creating Dynamic Pages Without Writing React Code
1. Navigate to `http://localhost:3001/admin` and log in.
2. Select **Pages** -> **Create New**.
3. Set Title: `Engineering Services`.
4. Set Slug: `services`.
5. Enter rich text content, set Status to **Published**, and click **Save**.
6. Open `http://localhost:3000/services` in your browser. The frontend dynamically resolves the route and renders the CMS content without modifying any React source code!

### Managing Main Navigation
1. Open Payload Admin -> **Navigation**.
2. Edit **Header Top Navigation**.
3. Add links, link to CMS Pages directly, or reorder menu items.
4. The React header immediately reflects your menu changes.

### Publishing Workflow
- **Draft**: Work in progress visible only to authenticated Admins and Editors in the CMS.
- **Published**: Publicly visible across the frontend and indexed in the sitemap.

---

## 🔐 Security & Access Control

- **Role-Based Access Control (RBAC)**:
  - `admin`: Full access to manage users, site settings, collections, and publishing status.
  - `editor`: Can manage, edit, and publish posts, pages, and media. Cannot modify administrators.
  - `author`: Can create and edit their own articles; cannot publish unreviewed content or access site settings.
- **Zero Secret Leakage**: `DATABASE_URI` and `PAYLOAD_SECRET` live exclusively in the backend (`cms/.env`). Neither is ever bundled into Vite client scripts.

---

## 🌐 Production Deployment Architecture

### Recommended Split Deployment

1. **Frontend (React / Vite)**:
   - **Deploy on**: [Vercel](https://vercel.com)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_PAYLOAD_API_URL=https://your-cms-backend.up.railway.app/api`

2. **Backend (Payload CMS)**:
   - **Deploy on**: [Railway](https://railway.app), [Render](https://render.com), or AWS ECS
   - **Root Directory**: `cms`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Environment Variables**:
     - `DATABASE_URI`: PostgreSQL connection string (from Supabase or Neon)
     - `PAYLOAD_SECRET`: 32+ character random key
     - `CORS_ORIGINS`: `https://your-frontend.vercel.app`
     - `PORT`: `3001` (or provided by host)

3. **Database (PostgreSQL)**:
   - Hosted on [Supabase Database](https://supabase.com) or [Neon Serverless Postgres](https://neon.tech).
