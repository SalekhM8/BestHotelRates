'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
  });

  if (status === 'loading') {
    return (
      <main className="relative min-h-screen pb-24 pt-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center text-white">Loading...</div>
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!session) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditing(false);
        update(); // Refresh session
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="relative min-h-screen pb-24 pt-32">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">
          My Profile
        </h1>

        <div className="grid gap-6">
          {/* Profile Information */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Personal Information
              </h2>
              {!isEditing && (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                disabled
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+44 7700 900000"
              />

              {isEditing && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    fullWidth
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard size="small">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">0</div>
                <div className="text-sm text-white/80">Total Bookings</div>
              </div>
            </GlassCard>

            <GlassCard size="small">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">0</div>
                <div className="text-sm text-white/80">Wishlist Items</div>
              </div>
            </GlassCard>

            <GlassCard size="small">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">£0</div>
                <div className="text-sm text-white/80">Total Spent</div>
              </div>
            </GlassCard>
          </div>

          {/* Security */}
          <GlassCard>
            <h2 className="text-2xl font-semibold text-white mb-6">
              Security
            </h2>

            <div className="space-y-3">
              <Button variant="secondary" fullWidth>
                Change Password
              </Button>
              <Button variant="secondary" fullWidth>
                Two-Factor Authentication
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

