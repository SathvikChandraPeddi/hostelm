'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Search, Shield, Star, ArrowRight, MapPin, Users, Sparkles, CheckCircle } from 'lucide-react';

// =============================================
// Animation Variants
// =============================================
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

// =============================================
// Animated Counter Component
// =============================================
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (!isInView) return;
        
        // Use requestAnimationFrame for reduced motion to avoid sync setState
        if (prefersReducedMotion) {
            requestAnimationFrame(() => setCount(target));
            return;
        }

        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [isInView, target, prefersReducedMotion]);

    return (
        <div ref={ref} className="text-3xl md:text-4xl font-bold text-white">
            {count.toLocaleString()}{suffix}
        </div>
    );
}

// =============================================
// Scroll Reveal Section Component
// =============================================
function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeInUp}
            transition={{ delay: prefersReducedMotion ? 0 : delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// =============================================
// Feature Card Component
// =============================================
function FeatureCard({ icon: Icon, color, title, desc, index }: { 
    icon: React.ElementType; 
    color: string; 
    title: string; 
    desc: string;
    index: number;
}) {
    const prefersReducedMotion = useReducedMotion();
    
    const colorMap: { [key: string]: { bg: string; icon: string; glow: string } } = {
        violet: { 
            bg: 'bg-violet-100 dark:bg-violet-900/30', 
            icon: 'text-violet-600 dark:text-violet-400',
            glow: 'group-hover:shadow-violet-500/25'
        },
        indigo: { 
            bg: 'bg-indigo-100 dark:bg-indigo-900/30', 
            icon: 'text-indigo-600 dark:text-indigo-400',
            glow: 'group-hover:shadow-indigo-500/25'
        },
        emerald: { 
            bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
            icon: 'text-emerald-600 dark:text-emerald-400',
            glow: 'group-hover:shadow-emerald-500/25'
        },
        amber: { 
            bg: 'bg-amber-100 dark:bg-amber-900/30', 
            icon: 'text-amber-600 dark:text-amber-400',
            glow: 'group-hover:shadow-amber-500/25'
        },
        rose: { 
            bg: 'bg-rose-100 dark:bg-rose-900/30', 
            icon: 'text-rose-600 dark:text-rose-400',
            glow: 'group-hover:shadow-rose-500/25'
        },
        cyan: { 
            bg: 'bg-cyan-100 dark:bg-cyan-900/30', 
            icon: 'text-cyan-600 dark:text-cyan-400',
            glow: 'group-hover:shadow-cyan-500/25'
        },
    };

    const colors = colorMap[color] || colorMap.violet;

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
            whileHover={prefersReducedMotion ? {} : { y: -8, transition: { duration: 0.3 } }}
            className="h-full group"
        >
            <Card className={`h-full relative overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 ${colors.glow}`}>
                {/* Subtle gradient border on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/0 via-transparent to-indigo-500/0 group-hover:from-violet-500/10 group-hover:to-indigo-500/10 transition-all duration-500" />
                
                <CardContent className="relative p-6">
                    {/* Icon with glow effect */}
                    <div className="relative mb-4">
                        <motion.div 
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors.bg} transition-transform duration-300`}
                            whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        >
                            <Icon className={`w-7 h-7 ${colors.icon}`} />
                        </motion.div>
                        {/* Icon glow */}
                        <div className={`absolute inset-0 ${colors.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {desc}
                    </p>
                    
                    {/* Learn more indicator */}
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// =============================================
// Main Animated Landing Component
// =============================================
export function AnimatedLanding() {
    const prefersReducedMotion = useReducedMotion();
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start']
    });

    // Parallax transforms
    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const foregroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
    const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.8]);
    const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.4, 0]);

    const features = [
        { icon: Search, color: 'violet', title: 'Easy Search', desc: 'Find hostels by location, price, amenities, and more with our powerful filters.' },
        { icon: Shield, color: 'indigo', title: 'Verified Listings', desc: 'All hostels are verified to ensure quality and safety standards.' },
        { icon: Star, color: 'emerald', title: 'Real Reviews', desc: "Read honest reviews from students who've actually stayed there." },
        { icon: MapPin, color: 'amber', title: 'Near Campus', desc: 'Find hostels close to your college or university.' },
        { icon: Users, color: 'rose', title: 'Community', desc: 'Connect with fellow students and find roommates.' },
        { icon: Building2, color: 'cyan', title: 'For Owners', desc: 'List your hostel and reach thousands of students.' },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen overflow-hidden flex items-center">
                
                {/* ===== LAYER 1: Base Background Image with Parallax ===== */}
                <motion.div 
                    className="absolute inset-0"
                    style={{ y: prefersReducedMotion ? 0 : backgroundY }}
                >
                    <div 
                        className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80')`,
                        }}
                    />
                    {/* Image color overlay for brand consistency */}
                    <div className="absolute inset-0 bg-indigo-950/40 mix-blend-multiply" />
                </motion.div>
                
                {/* ===== LAYER 2: Gradient Overlays for Depth ===== */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-950/50 via-transparent to-indigo-950/50" />
                
                {/* ===== LAYER 3: Premium Radial Glow Behind Content ===== */}
                <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] pointer-events-none"
                    style={prefersReducedMotion ? {} : { scale: glowScale, opacity: glowOpacity }}
                >
                    {/* Primary glow */}
                    <div className="absolute inset-0 bg-gradient-radial from-violet-500/30 via-violet-600/10 to-transparent rounded-full blur-3xl" />
                    {/* Secondary accent glow */}
                    <motion.div 
                        className="absolute inset-0 bg-gradient-radial from-fuchsia-500/20 via-transparent to-transparent rounded-full blur-3xl"
                        animate={prefersReducedMotion ? {} : { 
                            scale: [1, 1.15, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </motion.div>
                
                {/* ===== LAYER 4: Animated Decorative Gradient Blobs ===== */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Top-right purple blob */}
                    <motion.div 
                        className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/20 to-purple-600/10 rounded-full blur-[120px]"
                        style={{ y: prefersReducedMotion ? 0 : foregroundY }}
                        animate={prefersReducedMotion ? {} : { 
                            x: [0, 40, 0],
                            y: [0, -30, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Left indigo blob */}
                    <motion.div 
                        className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/20 to-blue-500/10 rounded-full blur-[100px]"
                        animate={prefersReducedMotion ? {} : { 
                            x: [0, -30, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />
                    {/* Bottom-center fuchsia blob */}
                    <motion.div 
                        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-to-t from-fuchsia-500/15 to-pink-500/5 rounded-full blur-[80px]"
                        animate={prefersReducedMotion ? {} : { 
                            scale: [1, 1.3, 1],
                            opacity: [0.15, 0.25, 0.15],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    />
                    {/* Top-left cyan accent */}
                    <motion.div 
                        className="absolute top-16 left-1/4 w-[250px] h-[250px] bg-gradient-to-br from-cyan-400/15 to-teal-500/5 rounded-full blur-[60px]"
                        animate={prefersReducedMotion ? {} : { 
                            x: [0, 25, 0],
                            y: [0, 25, 0],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                    />
                    {/* Bottom-right emerald accent */}
                    <motion.div 
                        className="absolute bottom-32 right-1/4 w-[200px] h-[200px] bg-gradient-to-tl from-emerald-500/10 to-teal-400/5 rounded-full blur-[50px]"
                        animate={prefersReducedMotion ? {} : { 
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                    />
                </div>
                
                {/* ===== LAYER 5: Subtle Animated Grid Pattern ===== */}
                <motion.div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ y: prefersReducedMotion ? 0 : foregroundY }}
                >
                    <div 
                        className="absolute inset-0"
                        style={{ 
                            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
                            backgroundSize: '60px 60px',
                        }} 
                    />
                </motion.div>
                
                {/* ===== LAYER 6: Noise Texture for Premium Feel ===== */}
                <div 
                    className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" 
                    style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                    }} 
                />

                {/* ===== LAYER 7: Hero Content with Parallax ===== */}
                <motion.div 
                    className="container mx-auto px-4 max-w-6xl relative z-10"
                    style={prefersReducedMotion ? {} : { y: contentY, opacity, scale }}
                >
                    <div className="flex flex-col items-center text-center py-20 md:py-32">
                        {/* Glassmorphism Content Container */}
                        <motion.div 
                            className="relative"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Glass background */}
                            <div className="absolute -inset-6 md:-inset-10 lg:-inset-14 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]" />
                            {/* Inner glow effect */}
                            <div className="absolute -inset-6 md:-inset-10 lg:-inset-14 bg-gradient-to-b from-violet-500/[0.05] to-transparent rounded-3xl" />
                            
                            <motion.div 
                                className="relative px-6 md:px-10 py-8"
                                initial="hidden"
                                animate="visible"
                                variants={staggerContainer}
                            >
                                {/* Badge */}
                                <motion.div 
                                    variants={fadeInUp}
                                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 backdrop-blur-md border border-violet-400/20 text-violet-200 text-sm font-medium mb-8 shadow-lg shadow-violet-500/10"
                                >
                                    <motion.div
                                        animate={prefersReducedMotion ? {} : { rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <Sparkles className="w-4 h-4 text-violet-300" />
                                    </motion.div>
                                    <span className="bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent font-semibold">
                                        Find your perfect stay
                                    </span>
                                </motion.div>

                                {/* Headline */}
                                <motion.h1 
                                    variants={fadeInUp}
                                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl leading-[1.1] tracking-tight"
                                >
                                    Discover Amazing
                                    <span className="relative inline-block mx-2">
                                        <motion.span 
                                            className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent"
                                            animate={prefersReducedMotion ? {} : { 
                                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                            }}
                                            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                            style={{ backgroundSize: '200% 200%' }}
                                        >Hostels</motion.span>
                                        {/* Text glow */}
                                        <motion.span 
                                            className="absolute inset-0 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 blur-2xl opacity-40 -z-10"
                                            animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </span>
                                    Near You
                                </motion.h1>

                                {/* Subheadline */}
                                <motion.p 
                                    variants={fadeInUp}
                                    className="text-lg md:text-xl text-slate-300/90 mb-10 max-w-2xl mx-auto leading-relaxed"
                                >
                                    The easiest way to find, compare, and book hostels.
                                    Whether you&apos;re a student or traveler, we&apos;ve got you covered.
                                </motion.p>

                                {/* CTA Buttons */}
                                <motion.div 
                                    variants={fadeInUp}
                                    className="flex flex-col sm:flex-row gap-4 justify-center"
                                >
                                    <Link href="/hostels">
                                        <motion.div
                                            whileHover={prefersReducedMotion ? {} : { scale: 1.03, y: -3 }}
                                            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                                            className="relative group"
                                        >
                                            {/* Button glow effect */}
                                            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                                            <Button size="lg" className="relative h-14 px-8 text-lg bg-gradient-to-r from-violet-500 via-violet-600 to-indigo-600 hover:from-violet-400 hover:via-violet-500 hover:to-indigo-500 shadow-2xl shadow-violet-500/40 transition-all duration-300 gap-2 border-0 font-semibold">
                                                Browse Hostels
                                                <motion.div
                                                    animate={prefersReducedMotion ? {} : { x: [0, 5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                                >
                                                    <ArrowRight className="w-5 h-5" />
                                                </motion.div>
                                            </Button>
                                        </motion.div>
                                    </Link>
                                    <Link href="/signup">
                                        <motion.div
                                            whileHover={prefersReducedMotion ? {} : { scale: 1.03, y: -3 }}
                                            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                                        >
                                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-white/20 bg-white/[0.05] hover:bg-white/[0.12] hover:border-white/30 text-white backdrop-blur-md transition-all duration-300 shadow-xl shadow-black/10 font-semibold">
                                                Create Account
                                            </Button>
                                        </motion.div>
                                    </Link>
                                </motion.div>

                                {/* Trust Badges */}
                                <motion.div 
                                    variants={fadeInUp}
                                    className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-400"
                                >
                                    {['Free to use', 'Verified listings', '24/7 Support'].map((text, i) => (
                                        <motion.div 
                                            key={text}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.05]"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + i * 0.1 }}
                                        >
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                            {text}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Animated Stats */}
                        <motion.div 
                            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-white/10 w-full"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            {[
                                { target: 500, suffix: '+', label: 'Hostels Listed' },
                                { target: 10000, suffix: '+', label: 'Happy Students' },
                                { target: 50, suffix: '+', label: 'Cities Covered' },
                            ].map((stat) => (
                                <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                                    <div className="text-sm text-slate-400">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
                
                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-32 bg-gradient-to-b from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
                <div className="container mx-auto px-4 max-w-6xl">
                    <ScrollReveal className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Why Choose HostelM?
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            We make finding and booking hostels simple, secure, and stress-free.
                        </p>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <FeatureCard key={feature.title} {...feature} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-b from-violet-50 to-white dark:from-indigo-950 dark:to-slate-950 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                </div>
                
                <div className="container mx-auto px-4 max-w-4xl relative">
                    <ScrollReveal>
                        <Card className="border-0 shadow-2xl bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 text-white overflow-hidden relative">
                            {/* Animated grid pattern */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
                            
                            {/* Floating orbs */}
                            <div className="absolute top-8 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute bottom-8 left-8 w-24 h-24 bg-fuchsia-500/20 rounded-full blur-2xl" />
                            
                            <CardContent className="p-10 md:p-14 text-center relative">
                                {/* Sparkle icon */}
                                <motion.div
                                    className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <Sparkles className="w-8 h-8" />
                                </motion.div>
                                
                                <motion.h2 
                                    className="text-3xl md:text-5xl font-bold mb-5 leading-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    Ready to Find Your
                                    <br />
                                    <span className="text-violet-200">Perfect Hostel?</span>
                                </motion.h2>
                                <motion.p 
                                    className="text-lg md:text-xl text-violet-100 mb-10 max-w-xl mx-auto leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Join thousands of students who found their ideal accommodation through HostelM.
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-col sm:flex-row gap-4 justify-center"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative group"
                                    >
                                        {/* Button glow */}
                                        <div className="absolute -inset-1 bg-white rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                                        <Link href="/signup">
                                            <Button size="lg" variant="secondary" className="relative h-14 px-8 text-lg font-semibold shadow-xl bg-white text-violet-600 hover:bg-violet-50">
                                                Create Free Account
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Link href="/hostels">
                                            <Button size="lg" variant="ghost" className="h-14 px-8 text-lg font-semibold text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50">
                                                Browse Hostels
                                            </Button>
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </ScrollReveal>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div 
                        className="flex flex-col md:flex-row items-center justify-between gap-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25"
                                whileHover={{ rotate: 10, scale: 1.05 }}
                            >
                                <Building2 className="w-5 h-5 text-white" />
                            </motion.div>
                            <span className="font-bold text-xl text-slate-900 dark:text-white">HostelM</span>
                        </div>
                        
                        {/* Social proof */}
                        <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span>4.9/5 rating</span>
                            </div>
                            <div className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-700" />
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-violet-500" />
                                <span>10,000+ students</span>
                            </div>
                        </div>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            © 2026 HostelM. All rights reserved.
                        </p>
                    </motion.div>
                </div>
            </footer>
        </div>
    );
}
