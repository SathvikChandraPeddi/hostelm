'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Loader2, User, Mail, Lock, UserCircle, ArrowRight, GraduationCap, Home } from 'lucide-react';
import type { UserRole } from '@/lib/types';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('student');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();

        // Create auth user with role in metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role, // Store role in auth metadata as backup
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            // Use upsert to handle both new and existing profiles
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: authData.user.id,
                    name,
                    email,
                    role,
                }, {
                    onConflict: 'id',
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Continue anyway - the auth metadata has the role as backup
            }
        }

        router.push('/dashboard');
        router.refresh();
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="w-full max-w-md animate-fadeInUp">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/40 transition-shadow">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            HostelM
                        </span>
                    </Link>
                </div>

                <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                    <CardHeader className="space-y-2 text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            Join HostelM to find or list hostels
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSignup}>
                        <CardContent className="space-y-5 pt-4">
                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="h-12 pl-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 pl-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="h-12 pl-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Must be at least 6 characters</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">I am a</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('student')}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            role === 'student'
                                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 dark:border-violet-500'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <GraduationCap className={`w-6 h-6 mx-auto mb-2 ${role === 'student' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
                                        <span className={`block text-sm font-medium ${role === 'student' ? 'text-violet-700 dark:text-violet-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                            Student
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('owner')}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            role === 'owner'
                                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 dark:border-violet-500'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <Home className={`w-6 h-6 mx-auto mb-2 ${role === 'owner' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
                                        <span className={`block text-sm font-medium ${role === 'owner' ? 'text-violet-700 dark:text-violet-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                            Hostel Owner
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-medium shadow-lg shadow-violet-500/25 gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                Already have an account?{' '}
                                <Link href="/login" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-semibold transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
                    © 2026 HostelM. All rights reserved.
                </p>
            </div>
        </div>
    );
}
