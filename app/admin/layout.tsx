import AdminShell from '@/components/admin/admin-shell';
import { getSiteSettings } from '@/lib/services/public-data';

export const dynamic = 'force-dynamic';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  
  return <AdminShell logoUrl={settings?.logo_url}>{children}</AdminShell>;
}
