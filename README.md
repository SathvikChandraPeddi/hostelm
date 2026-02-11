# HostelM - Hostel Discovery Platform

A modern hostel discovery app for students built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔍 **Students** - Browse and search hostels near colleges
- 🏠 **Owners** - Add, edit, and manage hostel listings  
- 👨‍💼 **Admins** - Manage users and approve hostels

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Vercel

## Setup

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd hostelm
npm install
```

### 2. Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in order:
   - `lib/supabase/complete-schema.sql` - Base tables
   - `lib/supabase/fix-users-sync.sql` - User sync trigger & admin policies
   - `lib/supabase/fix-rls-recursion.sql` - RLS fixes

### 3. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development
```bash
npm run dev
```

## Deploy to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for production"
git push
```

### 2. Deploy on Vercel
1. Import your repo at [vercel.com/new](https://vercel.com/new)
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy!

### 3. Make yourself admin
After signup, run in Supabase SQL Editor:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/hostels` | Browse all hostels (students) |
| `/hostel/[id]` | Hostel details |
| `/dashboard` | User dashboard (redirects by role) |
| `/dashboard/owner` | Owner's hostel management |
| `/dashboard/admin` | Admin panel |
| `/login` | Sign in |
| `/signup` | Register |

## License

MIT
