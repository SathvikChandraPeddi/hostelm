'use client';

import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const footerLinks = {
    product: [
        { label: 'Browse Hostels', href: '/hostels' },
        { label: 'List Your Hostel', href: '/signup' },
        { label: 'Join a Hostel', href: '/join-hostel' },
        { label: 'For Owners', href: '/signup' },
    ],
    company: [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Press', href: '#' },
    ],
    support: [
        { label: 'Help Center', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
    ],
};

const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">HostelM</span>
                        </Link>
                        <p className="text-slate-400 mb-6 max-w-sm">
                            Find your perfect student accommodation. Compare prices, amenities, and locations to make the best choice for your college life.
                        </p>
                        
                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a href="mailto:hello@hostelm.com" className="flex items-center gap-3 text-slate-400 hover:text-violet-400 transition-colors">
                                <Mail className="w-4 h-4" />
                                <span>hello@hostelm.com</span>
                            </a>
                            <a href="tel:+919876543210" className="flex items-center gap-3 text-slate-400 hover:text-violet-400 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span>+91 98765 43210</span>
                            </a>
                            <div className="flex items-center gap-3 text-slate-400">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>Hyderabad, Telangana, India</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-slate-400 hover:text-violet-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-slate-400 hover:text-violet-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-slate-400 hover:text-violet-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800">
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <p className="text-slate-500 text-sm flex items-center gap-1">
                            © {currentYear} HostelM. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in India
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors"
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
