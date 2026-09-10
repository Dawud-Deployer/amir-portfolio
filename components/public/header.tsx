'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavigationItem, SocialLink } from '@/lib/types/database';
import { getSocialIcon } from '@/components/social-icon';

type PublicHeaderProps = {
  navItems: NavigationItem[];
  socialLinks: SocialLink[];
  siteName: string;
  logoUrl?: string;
};

// Modern hamburger icon with smooth animation
function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      className="lg:hidden p-2.5 rounded-lg transition-all duration-200 hover:bg-primary/10 active:scale-95"
      onClick={onClick}
      aria-label="Open navigation menu"
      aria-expanded={isOpen}
      aria-controls="mobile-nav"
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5 relative">
        <motion.span
          animate={isOpen ? { rotate: 45, y: 12 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-6 h-0.5 bg-foreground rounded-full block origin-center"
        />
        <motion.span
          animate={isOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-5 h-0.5 bg-foreground rounded-full block"
        />
        <motion.span
          animate={isOpen ? { rotate: -45, y: -12 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-6 h-0.5 bg-foreground rounded-full block origin-center"
        />
      </div>
    </button>
  );
}

export function PublicHeader({ navItems, socialLinks, siteName, logoUrl }: PublicHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/98 dark:bg-[hsl(0_0%_16%/0.98)] backdrop-blur-lg border-b-2 border-primary/10 py-3.5 shadow-[0_8px_32px_rgba(16,185,129,0.08)]'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="container-px mx-auto max-w-7xl flex items-center justify-between">

          {/* ── Logo / brand - BOLD ── */}
          <Link
            href="/"
            className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-200"
            aria-label={`${siteName} — Home`}
          >
            {logoUrl ? (
              <div className={`relative h-11 w-11 flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300 border-2 border-primary/20 ${
                  scrolled ? 'opacity-100' : 'opacity-95 hover:opacity-100'
                }`}>
                <Image
                  src={logoUrl}
                  alt={siteName}
                  width={44}
                  height={44}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className={`flex items-center justify-center w-11 h-11 rounded-lg border-2 transition-all duration-300 ${
                scrolled
                  ? 'border-primary bg-primary/10 hover:bg-primary/15'
                  : 'border-white/40 bg-white/15 hover:bg-white/20'
              }`}>
                <Leaf
                  className={`w-5 h-5 transition-colors duration-300 ${
                    scrolled ? 'text-primary' : 'text-white'
                  }`}
                  aria-hidden="true"
                />
              </div>
            )}
            <span className={`heading-serif text-lg font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-foreground' : 'text-white'
            }`}>
              {siteName}
            </span>
          </Link>

          {/* ── Desktop nav - BOLD STYLING ── */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.open_in_new_tab ? '_blank' : undefined}
                  rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                  className={`relative px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 group border border-transparent ${
                    scrolled
                      ? isActive
                        ? 'text-white bg-primary shadow-[0_4px_16px_hsl(145_100%_43%/0.25)]'
                        : 'text-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/20'
                      : isActive
                        ? 'text-white bg-primary shadow-[0_4px_16px_rgba(255,255,255,0.25)]'
                        : 'text-white/90 hover:text-white hover:bg-white/15 hover:border-white/20'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop social icons - BOLD ── */}
          <div className="hidden lg:flex items-center gap-3">
            {socialLinks.slice(0, 3).map((link) => {
              const Icon = getSocialIcon(link.icon);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-all duration-200 p-2.5 rounded-lg border border-transparent font-bold ${
                    scrolled
                      ? 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30'
                      : 'text-white/70 hover:text-white hover:bg-white/15 hover:border-white/20'
                  }`}
                  aria-label={link.label}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </a>
              );
            })}
          </div>

          {/* ── Mobile menu button - MODERN HAMBURGER ── */}
          <HamburgerButton isOpen={mobileOpen} onClick={() => setMobileOpen(true)} />
        </div>
      </header>

      {/* ── Mobile navigation overlay - NO BLUE-BLACK, CONSISTENT ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] lg:hidden bg-white dark:bg-[hsl(0_0%_11%)]"
            role="dialog"
            aria-label="Navigation menu"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b-2 border-primary/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-primary/30 bg-primary/10 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Leaf className="w-5 h-5 text-primary" aria-hidden="true" />
                  )}
                </div>
                <span className="heading-serif text-lg font-bold text-foreground">{siteName}</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-lg text-foreground hover:bg-primary/10 active:scale-95 transition-all border-2 border-transparent hover:border-primary/30"
                aria-label="Close navigation menu"
              >
                <motion.div
                  animate={{ rotate: 45 }}
                  className="w-6 h-6 flex flex-col justify-center items-center gap-1.5 relative"
                >
                  <span className="w-6 h-0.5 bg-foreground rounded-full block" />
                  <span className="w-5 h-0.5 bg-foreground rounded-full block" />
                  <span className="w-6 h-0.5 bg-foreground rounded-full block" />
                </motion.div>
              </button>
            </div>

            {/* Nav links - BOLD ── */}
            <nav className="flex flex-col px-4 py-4 gap-2" aria-label="Mobile navigation">
              {navItems.map((item, i) => {
                const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));
                return (
                  <motion.div
                    key={item.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <Link
                      href={item.url}
                      target={item.open_in_new_tab ? '_blank' : undefined}
                      rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                      className={`flex items-center px-5 py-4 rounded-lg text-base font-bold transition-all border-2 ${
                        isActive
                          ? 'bg-primary text-white border-primary shadow-[0_4px_16px_hsl(145_100%_43%/0.25)]'
                          : 'text-foreground border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Social links - BOLD ── */}
            {socialLinks.length > 0 && (
              <div className="px-6 pt-6 pb-8 border-t-2 border-primary/10 mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-4">
                  Connect With Me
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {socialLinks.map((link) => {
                    const Icon = getSocialIcon(link.icon);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 font-bold hover:shadow-[0_4px_16px_hsl(145_100%_43%/0.25)]"
                        aria-label={link.label}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
