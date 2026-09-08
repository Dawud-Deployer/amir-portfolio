import { getSocialIcon } from '@/components/social-icon';
import type { LucideIcon } from 'lucide-react';
import {
  Send, Youtube, Music2, Instagram, Facebook,
  Music, Video, Mail, Globe, MessageCircle, Camera, Play,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  send: Send,
  youtube: Youtube,
  music: Music,
  'music-2': Music2,
  instagram: Instagram,
  facebook: Facebook,
  video: Video,
  mail: Mail,
  globe: Globe,
  'message-circle': MessageCircle,
  camera: Camera,
  play: Play,
};

export function getSocialIcon(name: string | null): LucideIcon {
  if (!name) return Globe;
  return iconMap[name] || Globe;
}
