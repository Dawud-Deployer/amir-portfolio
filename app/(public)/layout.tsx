import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import {
  getNavigationItems, getFooterSettings, getSocialLinks, getSiteSettings
} from '@/lib/services/public-data';

/** Revalidate layout data every 60s; admin saves trigger instant revalidation */
export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navItems, footerSettings, socialLinks, siteSettings] = await Promise.all([
    getNavigationItems(),
    getFooterSettings(),
    getSocialLinks(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader
        navItems={navItems}
        socialLinks={socialLinks}
        siteName={siteSettings?.site_name || 'Amir Hussen'}
        logoUrl={siteSettings?.logo_url || undefined}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter
        settings={footerSettings || {
          artist_name: 'Amir Hussen',
          short_description: '',
          show_newsletter: true,
          show_social: true,
          show_navigation: true,
          show_contact_cta: true,
          copyright_text: '© 2026 Amir Hussen',
          attribution: '',
          id: '', created_at: '', updated_at: '',
        }}
        socialLinks={socialLinks}
        navItems={navItems}
        logoUrl={siteSettings?.logo_url || undefined}
      />
    </div>
  );
}
