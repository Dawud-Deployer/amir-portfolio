'use client';

import Link from 'next/link';
import { Music2, Heart } from 'lucide-react';
import { getSocialIcon } from '@/components/social-icon';
import type { FooterSettings, SocialLink, NavigationItem } from '@/lib/types/database';

type PublicFooterProps = {
  settings: FooterSettings;
  socialLinks: SocialLink[];
  navItems: NavigationItem[];
};

export function PublicFooter({ settings, socialLinks, navItems }: PublicFooterProps) {
  return (
    <footer className="bg-background border-t border-border/50">
      <div className="container-px mx-auto max-w-7xl py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-full border border-primary/40">
                <Music2 className="w-4 h-4 text-primary" />
              </div>
              <span className="heading-serif text-lg font-semibold">{settings.artist_name}</span>
            </div>
            {settings.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {settings.short_description}
              </p>
            )}
          </div>

          {settings.show_navigation && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Navigation</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {settings.show_social && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Connect</h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.icon);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary text-muted-foreground transition-all"
                      aria-label={link.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {settings.show_contact_cta && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Booking & Inquiries</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For bookings, events, and collaborations, reach out through the contact page.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          {settings.copyright_text && (
            <p className="text-xs text-muted-foreground">{settings.copyright_text}</p>
          )}
          {settings.attribution && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {settings.attribution} <Heart className="w-3 h-3 text-primary" />
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
