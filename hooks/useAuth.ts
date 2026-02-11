'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/lib/types';

interface AuthState {
    user: SupabaseUser | null;
    profile: User | null;
    loading: boolean;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        loading: true,
    });

    const supabase = createClient();

    const fetchProfile = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        return data as User | null;
    }, [supabase]);

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const profile = await fetchProfile(user.id);
                setState({ user, profile, loading: false });
            } else {
                setState({ user: null, profile: null, loading: false });
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setState({ user: session.user, profile, loading: false });
                } else {
                    setState({ user: null, profile: null, loading: false });
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile]);

    const signOut = async () => {
        setState({ user: null, profile: null, loading: false });
        try {
            // Clear all Supabase auth data from localStorage immediately
            if (typeof window !== 'undefined') {
                const keysToRemove = Object.keys(localStorage).filter(key =>
                    key.startsWith('sb-') || key.includes('supabase')
                );
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }
            // Also try the API call with a timeout
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Sign out timeout')), 3000)
            );
            await Promise.race([supabase.auth.signOut(), timeout]);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return {
        user: state.user,
        profile: state.profile,
        loading: state.loading,
        signOut,
    };
}
