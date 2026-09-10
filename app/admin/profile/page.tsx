'use client';
import { triggerRevalidation } from '@/lib/services/revalidation';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Camera, Save, Lock, User, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, validateImageFile } from '@/lib/services/media-service';
import { AdminLayout } from '@/components/admin/admin-layout';
import { TextInput } from '@/components/admin/admin-form-field';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const supabase = createClient();
  
  const [fullName, setFullName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleProfileSave = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    try {
      const media = await uploadMedia(file, { category: 'avatars' });
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: media.public_url, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      toast.success('Profile photo updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
          await triggerRevalidation();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  if (!user || !profile) {
    return (
      <AdminLayout title="Profile" subtitle="Manage your admin account">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Profile" subtitle="Manage your admin account">
      <div className="mx-auto max-w-2xl space-y-8 pb-12">
        {/* Profile Card */}
        <section className="rounded-lg border border-border bg-white p-6 shadow-brand-sm">
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
          </div>

          <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
              <AvatarFallback className="text-2xl">{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/jpeg,image/png,image/webp"
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn-outline flex items-center gap-2"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <span>{isUploading ? 'Uploading...' : 'Change photo'}</span>
              </button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WebP. Max 10MB.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <TextInput
              label="Display Name"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
            
            <TextInput
              label="Email Address"
              id="email"
              value={user.email || ''}
              readOnly
              className="bg-muted text-muted-foreground"
              help="Contact an administrator to change your email address."
            />
            
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleProfileSave}
                disabled={isSavingProfile || fullName === profile.full_name}
                className="btn-primary flex items-center gap-2"
              >
                {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </section>

        {/* Password Card */}
        <section className="rounded-lg border border-border bg-white p-6 shadow-brand-sm">
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <TextInput
              label="Current Password"
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            
            <TextInput
              label="New Password"
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            
            <TextInput
              label="Confirm New Password"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSavingPassword || !newPassword || !confirmPassword}
                className="btn-primary flex items-center gap-2"
              >
                {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </section>

        {/* Account Info Card */}
        <section className="rounded-lg border border-border bg-white p-6 shadow-brand-sm">
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Account Information</h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="font-medium text-foreground">Role</span>
              <span className="text-muted-foreground">{isAdmin ? 'Administrator' : 'User'}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="font-medium text-foreground">Account Created</span>
              <span className="text-muted-foreground">{profile.created_at ? format(new Date(profile.created_at), 'PPpp') : 'Unknown'}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium text-foreground">Last Updated</span>
              <span className="text-muted-foreground">{profile.updated_at ? format(new Date(profile.updated_at), 'PPpp') : 'Unknown'}</span>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
