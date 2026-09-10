'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { getSocialIcon } from '@/components/social-icon';
import type { FooterSettings, SocialLink, NavigationItem } from '@/lib/types/database';

type PublicFooterProps = {
  settings: FooterSettings;
  socialLinks: SocialLink[];
  navItems: NavigationItem[];
  logoUrl?: string | null;
};

export function PublicFooter({ settings, socialLinks, navItems, logoUrl }: PublicFooterProps) {
  const year = new Date().getFullYear();
  const copyright = settings.copyright_text || `© ${year} ${settings.artist_name}. All rights reserved.`;

  return (
    <footer className="bg-white dark:bg-[hsl(0_0%_11%)] text-foreground border-t-2 border-primary/10">
      {/* ── Accent rule ── */}
      <div className="h-1 w-full accent-line opacity-60" />

      <div className="container-px mx-auto max-w-7xl py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">

          {/* ── Brand column - BOLD ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 border-2 border-primary/30 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Leaf className="w-5 h-5 text-primary" aria-hidden="true" />
                )}
              </div>
              <span className="heading-serif text-lg font-black text-foreground">
                {settings.artist_name}
              </span>
            </div>
            {settings.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[26ch] font-medium">
                {settings.short_description}
              </p>
            )}
          </div>

          {/* ── Navigation column - BOLD ── */}
          {settings.show_navigation && navItems.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3">
                Explore
              </h3>
              <ul className="space-y-2" role="list">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Social column - BOLD ── */}
          {settings.show_social && socialLinks.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3">
                Connect
              </h3>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.icon);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-11 h-11 rounded-lg border-2 border-primary/30 text-foreground bg-primary/5 hover:text-white hover:border-primary hover:bg-primary hover:shadow-[0_4px_16px_hsl(145_100%_43%/0.25)] transition-all duration-200 font-bold"
                      aria-label={link.label}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Contact/Booking CTA - BOLD ── */}
          {settings.show_contact_cta && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3">
                Booking & Inquiries
              </h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed font-medium">
                For bookings, events, and collaborations.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-lg border-2 border-primary bg-primary text-white hover:shadow-[0_8px_32px_hsl(145_100%_43%/0.3)] hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Get in Touch
              </Link>
            </div>
          )}
        </div>

        {/* ── Bottom bar - BOLD ── */}
        <div className="mt-8 pt-4 border-t-2 border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground text-center sm:text-left font-semibold">{copyright}</p>
          {settings.attribution && (
            <p className="text-sm text-muted-foreground font-semibold">{settings.attribution}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
