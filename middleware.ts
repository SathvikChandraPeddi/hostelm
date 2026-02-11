import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Role-based route configuration
const ROLE_ROUTES = {
    admin: ['/dashboard/admin'],
    owner: ['/dashboard/owner', '/dashboard/add-hostel', '/dashboard/edit-hostel'],
    student: ['/student'],
} as const;

// Routes that require authentication but no specific role
const PROTECTED_ROUTES = ['/dashboard', '/join-hostel'];

// Auth routes (redirect if already logged in)
const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Check if route needs authentication
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );
    const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // Redirect to login if not authenticated on protected routes
    if ((isProtectedRoute || isRoleProtectedRoute(pathname)) && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // Redirect to dashboard if already authenticated on auth routes
    if (isAuthRoute && user) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    // NOTE: Role-based access control is now handled by page-level guards
    // in lib/auth-guard.ts to avoid duplicate database queries.
    // The page guards use React's cache() for deduplication.

    return supabaseResponse;
}

// Helper to check if route is role-protected
function isRoleProtectedRoute(pathname: string): boolean {
    return (
        pathname.startsWith('/dashboard/admin') ||
        pathname.startsWith('/dashboard/owner') ||
        pathname.startsWith('/dashboard/add-hostel') ||
        pathname.startsWith('/dashboard/edit-hostel') ||
        pathname.startsWith('/student')
    );
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
