import { AdminGuard } from '@/components/admin/admin-guard';
import MusicManager from '@/components/admin/music-manager';

export default function AdminMusicPage() {
  return (
    <AdminGuard>
      <MusicManager />
    </AdminGuard>
  );
}