# Deploying NexusBlog to Vercel

NexusBlog is pre-configured for deployment on **Vercel** with full static asset caching, SPA client routing, dynamic serverless API execution (`/api/health`, `/sitemap.xml`, `/robots.txt`), and WordPress 301 migration redirects.

---

## ⚡ Option 1: Deploy via Vercel Dashboard & GitHub (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git init
   git add .
   git commit -m "NexusBlog enterprise platform"
   git remote add origin https://github.com/your-username/nexusblog.git
   git branch -M main
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository.
   - Vercel will automatically detect **Vite** as the framework preset.
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Configure Environment Variables** in Project Settings:
   - `APP_URL`: Your production URL (e.g. `https://your-domain.vercel.app`)
   - `DATABASE_URL`: PostgreSQL connection string (e.g. Supabase connection pooler)
   - `SUPABASE_URL`: Your Supabase project URL (`https://xyz.supabase.co`)
   - `SUPABASE_ANON_KEY`: Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for serverless admin functions)
   - `PAYLOAD_SECRET`: Any 32+ character random string

4. **Click "Deploy"**:
   - Your application will build and deploy worldwide across Vercel Edge CDN in seconds.

---

## 💻 Option 2: Deploy via Vercel CLI

If you have Node.js and the Vercel CLI installed on your machine:

```bash
# 1. Install Vercel CLI (if not already installed)
npm i -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy preview
vercel

# 4. Deploy directly to production
vercel --prod
```

During prompts:
- Set up and deploy: **Yes**
- Which scope: Select your team or personal account
- Link to existing project: **No** (creates new)
- Project name: `nexusblog` (or your choice)
- In which directory is your code located: `./`
- Want to modify these settings: **No** (Vercel automatically uses `vercel.json`)

---

## 📁 Included Vercel Configuration Highlights

- **`vercel.json`**:
  - Automatically routes `/api/*` to serverless function endpoints.
  - Automatically maps `/sitemap.xml` and `/robots.txt` dynamically.
  - Implements SPA fallback (`/(.*)` -> `/index.html`) for dynamic client-side article, category, author, and admin routes.
  - Injects high-security HTTP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`).
  - Sets immutable 1-year cache headers for `/assets/*` bundles.
- **`api/index.ts`**:
  - Serverless Express execution handler compatible with Vercel's Node.js runtime.
  - Preserves 301 WordPress migration redirects and dynamic XML sitemap generation.
