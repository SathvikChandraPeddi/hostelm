# 🏠 HostelM - Modern Hostel Management System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)

A premium hostel discovery and management platform for students, hostel owners, and administrators.

[Live Demo](#) • [Features](#-features) • [Setup](#-setup) • [Deploy](#-deploy-to-vercel)

</div>

---

## ✨ Features

### 👨‍🎓 For Students
- 🔍 Browse and search hostels with advanced filters
- 📍 Find hostels by location, price, and availability
- 🎫 Join hostels using unique hostel codes
- 💳 Track and manage monthly payments
- 🎫 Raise tickets/complaints
- 📢 Receive hostel updates and announcements

### 🏠 For Hostel Owners
- ➕ Add and manage hostel listings
- 📸 Upload multiple hostel images
- 👥 Manage enrolled students
- 💰 Track student payments & generate dues
- 🎫 Respond to student tickets
- 📣 Post updates and announcements

### 👨‍💼 For Admins
- 📊 Dashboard with platform statistics
- 👥 Manage all users
- 🏨 Oversee all hostels
- 🎫 Handle escalated tickets
- 📢 Post platform-wide announcements

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## 🚀 Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone & Install

```bash
git clone https://github.com/SathvikChandraPeddi/hostelm.git
cd hostelm
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following scripts in order:
   - `lib/supabase/complete-schema.sql` - Creates all tables
   - `lib/supabase/fix-users-sync.sql` - Sets up user sync trigger
   - `lib/supabase/fix-rls-recursion.sql` - Fixes RLS policies

3. Enable **Storage** and create a bucket named `hostel-images` (make it public)

### 3. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: **Supabase Dashboard → Settings → API**

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SathvikChandraPeddi/hostelm&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Option 2: Manual Deploy

1. **Push to GitHub** (already done ✅)

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click **Deploy**

3. **Configure Custom Domain** (optional)
   - Go to Project Settings → Domains
   - Add your custom domain

---

## 👤 Making Yourself Admin

After signing up, run this SQL in Supabase SQL Editor:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

---

## 📁 Project Structure

```
hostelm/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Auth callback
│   ├── dashboard/         # Dashboard routes
│   │   ├── admin/         # Admin pages
│   │   └── owner/         # Owner pages
│   ├── hostel/[id]/       # Hostel detail page
│   ├── hostels/           # Browse hostels
│   ├── student/           # Student pages
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── landing/          # Landing page components
│   └── admin/            # Admin components
├── lib/                   # Utilities & server actions
│   ├── supabase/         # Supabase client & schemas
│   └── actions.ts        # Server actions
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

---

## 🛣️ Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/hostels` | Public | Browse all hostels |
| `/hostel/[id]` | Public | Hostel details |
| `/login` | Public | Sign in |
| `/signup` | Public | Register |
| `/join-hostel` | Student | Join hostel with code |
| `/student/dashboard` | Student | Student dashboard |
| `/student/payments` | Student | Payment history |
| `/student/tickets` | Student | Support tickets |
| `/dashboard/owner` | Owner | Manage hostels |
| `/dashboard/owner/students/[id]` | Owner | Manage students |
| `/dashboard/admin` | Admin | Admin panel |

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">

Made with ❤️ by [Sathvik Chandra Peddi](https://github.com/SathvikChandraPeddi)

</div>
