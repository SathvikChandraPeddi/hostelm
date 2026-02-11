'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Building2, Menu, X, Loader2, IndianRupee, Ticket, Megaphone, Home, Search, LayoutDashboard, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// NavLink component defined outside to prevent re-creation during render
interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    isActive: boolean;
}

function NavLink({ href, children, icon: Icon, isActive }: NavLinkProps) {
    return (
        <Link href={href}>
            <Button
                variant="ghost"
                className={cn(
                    "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors",
                    isActive && "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30"
                )}
            >
                {Icon && <Icon className="w-4 h-4" />}
                {children}
            </Button>
        </Link>
    );
}

// MobileNavLink component defined outside to prevent re-creation during render
interface MobileNavLinkProps {
    href: string;
    children: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    onClick: () => void;
}

function MobileNavLink({ href, children, icon: Icon, isActive, onClick }: MobileNavLinkProps) {
    return (
        <Link href={href} onClick={onClick}>
            <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                    ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}>
                {Icon && <Icon className="w-5 h-5" />}
                <span className="font-medium">{children}</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
            </div>
        </Link>
    );
}

export function Navbar() {
    const { user, loading, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    // Get user role from metadata
    const userRole = user?.user_metadata?.role || 'student';
    const isOwner = userRole === 'owner';
    const isAdmin = userRole === 'admin';

    // Track scroll for navbar background
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change - use setTimeout to avoid sync setState in effect
    useEffect(() => {
        const timeoutId = setTimeout(() => setMobileMenuOpen(false), 0);
        return () => clearTimeout(timeoutId);
    }, [pathname]);

    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/login';
    };

    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    const checkIsActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <>
            <nav className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
                    : "bg-white/50 dark:bg-slate-950/50 backdrop-blur-md"
            )}>
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                                HostelM
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {loading ? (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Loading...</span>
                                </div>
                            ) : user ? (
                                <>
                                    {/* Student Nav */}
                                    {!isOwner && !isAdmin && (
                                        <>
                                            <NavLink href="/hostels" icon={Search} isActive={checkIsActive('/hostels')}>Browse</NavLink>
                                            <NavLink href="/student/payments" icon={IndianRupee} isActive={checkIsActive('/student/payments')}>Payments</NavLink>
                                            <NavLink href="/student/tickets" icon={Ticket} isActive={checkIsActive('/student/tickets')}>Tickets</NavLink>
                                            <NavLink href="/student/updates" icon={Megaphone} isActive={checkIsActive('/student/updates')}>Updates</NavLink>
                                        </>
                                    )}

                                    {/* Owner Nav */}
                                    {isOwner && (
                                        <>
                                            <NavLink href="/dashboard/owner" icon={Home} isActive={checkIsActive('/dashboard/owner')}>My Hostels</NavLink>
                                            <NavLink href="/dashboard/owner/payments" icon={IndianRupee} isActive={checkIsActive('/dashboard/owner/payments')}>Payments</NavLink>
                                            <NavLink href="/dashboard/owner/tickets" icon={Ticket} isActive={checkIsActive('/dashboard/owner/tickets')}>Tickets</NavLink>
                                            <NavLink href="/dashboard/owner/updates" icon={Megaphone} isActive={checkIsActive('/dashboard/owner/updates')}>Updates</NavLink>
                                        </>
                                    )}

                                    {/* Admin Nav */}
                                    {isAdmin && (
                                        <NavLink href="/dashboard/admin" icon={Shield} isActive={checkIsActive('/dashboard/admin')}>Admin Panel</NavLink>
                                    )}

                                    <NavLink href="/dashboard" icon={LayoutDashboard} isActive={checkIsActive('/dashboard')}>Dashboard</NavLink>

                                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

                                    <Button
                                        variant="ghost"
                                        onClick={handleSignOut}
                                        className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <NavLink href="/hostels" icon={Search} isActive={checkIsActive('/hostels')}>Browse Hostels</NavLink>
                                    <NavLink href="/login" isActive={checkIsActive('/login')}>Sign in</NavLink>
                                    <Link href="/signup">
                                        <Button className="ml-2">
                                            Get started
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "fixed inset-0 z-40 md:hidden transition-all duration-300",
                mobileMenuOpen ? "visible" : "invisible"
            )}>
                {/* Backdrop */}
                <div
                    className={cn(
                        "absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                        mobileMenuOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={closeMobileMenu}
                />

                {/* Menu Panel */}
                <div className={cn(
                    "absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out",
                    mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    {/* Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-white">Menu</span>
                        <button
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={closeMobileMenu}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Menu Content */}
                    <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                            </div>
                        ) : user ? (
                            <>
                                {/* User Info */}
                                <div className="px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Signed in as</p>
                                    <p className="font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
                                    <p className="text-xs text-violet-600 dark:text-violet-400 capitalize mt-1">{userRole}</p>
                                </div>

                                {/* Student Nav */}
                                {!isOwner && !isAdmin && (
                                    <>
                                        <MobileNavLink href="/hostels" icon={Search} isActive={checkIsActive('/hostels')} onClick={closeMobileMenu}>Browse Hostels</MobileNavLink>
                                        <MobileNavLink href="/student/dashboard" icon={LayoutDashboard} isActive={checkIsActive('/student/dashboard')} onClick={closeMobileMenu}>Dashboard</MobileNavLink>
                                        <MobileNavLink href="/student/payments" icon={IndianRupee} isActive={checkIsActive('/student/payments')} onClick={closeMobileMenu}>Payments</MobileNavLink>
                                        <MobileNavLink href="/student/tickets" icon={Ticket} isActive={checkIsActive('/student/tickets')} onClick={closeMobileMenu}>Tickets</MobileNavLink>
                                        <MobileNavLink href="/student/updates" icon={Megaphone} isActive={checkIsActive('/student/updates')} onClick={closeMobileMenu}>Updates</MobileNavLink>
                                    </>
                                )}

                                {/* Owner Nav */}
                                {isOwner && (
                                    <>
                                        <MobileNavLink href="/dashboard/owner" icon={Home} isActive={checkIsActive('/dashboard/owner')} onClick={closeMobileMenu}>My Hostels</MobileNavLink>
                                        <MobileNavLink href="/dashboard/owner/payments" icon={IndianRupee} isActive={checkIsActive('/dashboard/owner/payments')} onClick={closeMobileMenu}>Payments</MobileNavLink>
                                        <MobileNavLink href="/dashboard/owner/tickets" icon={Ticket} isActive={checkIsActive('/dashboard/owner/tickets')} onClick={closeMobileMenu}>Tickets</MobileNavLink>
                                        <MobileNavLink href="/dashboard/owner/updates" icon={Megaphone} isActive={checkIsActive('/dashboard/owner/updates')} onClick={closeMobileMenu}>Updates</MobileNavLink>
                                    </>
                                )}

                                {/* Admin Nav */}
                                {isAdmin && (
                                    <MobileNavLink href="/dashboard/admin" icon={Shield} isActive={checkIsActive('/dashboard/admin')} onClick={closeMobileMenu}>Admin Panel</MobileNavLink>
                                )}

                                <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

                                <button
                                    onClick={() => { handleSignOut(); closeMobileMenu(); }}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Sign out</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <MobileNavLink href="/hostels" icon={Search} isActive={checkIsActive('/hostels')} onClick={closeMobileMenu}>Browse Hostels</MobileNavLink>
                                <MobileNavLink href="/login" icon={LayoutDashboard} isActive={checkIsActive('/login')} onClick={closeMobileMenu}>Sign in</MobileNavLink>

                                <div className="pt-4">
                                    <Link href="/signup" onClick={closeMobileMenu}>
                                        <Button className="w-full" size="lg">
                                            Get started
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
