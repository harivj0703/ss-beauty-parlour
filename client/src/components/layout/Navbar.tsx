'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, ChevronDown, User, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Hair Care', href: '/services?category=hair-care' },
      { label: 'Skin Care', href: '/services?category=skin-care' },
      { label: 'Nail Care', href: '/services?category=nail-care' },
      { label: 'Makeup', href: '/services?category=makeup' },
      { label: 'Body Spa', href: '/services?category=body-spa' },
      { label: 'Bridal', href: '/services?category=bridal' },
    ],
  },
  { label: 'Packages', href: '/packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [userMenu, setUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'STAFF') return '/staff';
    return '/dashboard';
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'glass shadow-luxury py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="container-luxury flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow transition-transform group-hover:scale-110">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-heading font-bold text-xl leading-none text-gradient">
              SS Beauty
            </div>
            <div className="text-[10px] text-muted font-body tracking-widest uppercase">
              Parlour
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isLightBgPage = ['/booking', '/dashboard', '/login', '/register', '/services', '/packages', '/gallery', '/blog', '/contact', '/about'].includes(pathname) || pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
            const isDefaultWhite = !scrolled && !isLightBgPage;
            return link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setDropdown(link.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <button
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    pathname.startsWith(link.href)
                      ? scrolled || isLightBgPage
                        ? 'text-primary bg-primary/10'
                        : 'text-white bg-white/20'
                      : scrolled || isLightBgPage
                      ? 'text-foreground hover:text-primary hover:bg-primary/5'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', dropdown === link.label && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {dropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-52 glass rounded-2xl shadow-luxury-lg overflow-hidden"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="flex items-center px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? scrolled || isLightBgPage
                      ? 'text-primary bg-primary/10'
                      : 'text-white bg-white/20'
                    : scrolled || isLightBgPage
                    ? 'text-foreground hover:text-primary hover:bg-primary/5'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA + User */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full glass border transition-all",
                  scrolled || ['/booking', '/dashboard', '/login', '/register', '/services', '/packages', '/gallery', '/blog', '/contact', '/about'].includes(pathname) || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
                    ? "border-primary/20 hover:border-primary/40 bg-primary/5 text-foreground"
                    : "border-white/20 hover:border-white/40 bg-white/10 text-white"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  {user?.firstName}
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5", scrolled || ['/booking', '/dashboard', '/login', '/register', '/services', '/packages', '/gallery', '/blog', '/contact', '/about'].includes(pathname) || pathname.startsWith('/dashboard') || pathname.startsWith('/admin') ? "text-primary" : "text-white")} />
              </button>
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl shadow-luxury-lg overflow-hidden"
                    onMouseLeave={() => setUserMenu(false)}
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted">{user?.email}</p>
                    </div>
                    <Link href={getDashboardLink()} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors">
                      <Bell className="w-4 h-4" /> Notifications
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenu(false); router.push('/'); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "px-5 py-2 text-sm font-medium rounded-full transition-all",
                  scrolled || ['/booking', '/dashboard', '/login', '/register', '/services', '/packages', '/gallery', '/blog', '/contact', '/about'].includes(pathname) || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
                    ? "text-primary hover:bg-primary/5"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
              >
                Sign In
              </Link>
              <Link href="/booking" className="btn-luxury text-sm px-6 py-2.5">
                Book Now ✨
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "lg:hidden w-10 h-10 flex items-center justify-center rounded-full glass border",
            scrolled || ['/booking', '/dashboard', '/login', '/register', '/services', '/packages', '/gallery', '/blog', '/contact', '/about'].includes(pathname) || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
              ? "border-primary/20 text-primary"
              : "border-white/20 text-white"
          )}
        >
          {mobileOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-primary/10 mt-3"
          >
            <div className="container-luxury py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname === link.href ? 'text-primary bg-primary/10' : 'hover:bg-primary/5 hover:text-primary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link href={getDashboardLink()} className="btn-luxury-outline text-sm py-2.5 text-center rounded-xl">
                      Dashboard
                    </Link>
                    <button onClick={() => logout()} className="w-full py-2.5 text-sm text-red-500 font-medium">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="btn-luxury-outline text-sm py-2.5 text-center rounded-xl">Sign In</Link>
                    <Link href="/booking" className="btn-luxury text-sm py-2.5 text-center rounded-xl">Book Now ✨</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
