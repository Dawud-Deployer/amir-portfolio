'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavigationItem, SocialLink } from '@/lib/types/database';
import { getSocialIcon } from '@/components/social-icon';

type PublicHeaderProps = {
  navItems: NavigationItem[];
  socialLinks: SocialLink[];
  siteName: string;
};

export function PublicHeader({ navItems, socialLinks, siteName }: PublicHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border/50 py-3' : 'py-5'
        }`}
      >
        <div className="container-px mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-full border border-primary/40">
              <Music2 className="w-4 h-4 text-primary" />
            </div>
            <span className="heading-serif text-lg font-semibold text-foreground tracking-wide">
              {siteName}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-primary group-hover:w-3/4 transition-all duration-300" />
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {socialLinks.slice(0, 3).map((link) => {
              const Icon = getSocialIcon(link.icon);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>

          <button
            className="lg:hidden text-foreground p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden bg-background/98 backdrop-blur-lg"
          >
            <div className="flex items-center justify-between px-4 py-5 border-b border-border/50">
              <span className="heading-serif text-lg font-semibold">{siteName}</span>
              <button onClick={() => setMobileOpen(false)} className="p-2" aria-label="Close menu">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col px-4 py-6 gap-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item.url}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-lg text-foreground hover:text-primary border-b border-border/30 transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="flex items-center gap-6 px-6 py-6">
              {socialLinks.map((link) => {
                const Icon = getSocialIcon(link.icon);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
