'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, ShieldCheck, Star, Mail, Phone, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { userAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function SellerProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    business_name: '',
    business_address: '',
    business_description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        business_name: user.business_name || '',
        business_address: user.business_address || '',
        business_description: user.business_description || '',
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile(profile);
      if (user) setUser({ ...user, ...profile });
      toast.success('Profile updated.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      <div>
        <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Settings</span>
        <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Seller Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card padding="md" className="bg-white border-border text-center">
          <div className="w-20 h-20 rounded-full bg-champagne/10 text-champagne border border-champagne/20 flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h3 className="font-display text-lg font-semibold text-charcoal">{user?.name || 'Seller'}</h3>
          <p className="text-xs text-charcoal-light font-mono mt-1 flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-success" /> Trust Score: {user?.trust_score || 95}%
          </p>
          <p className="text-[10px] text-charcoal-light font-mono mt-1">{user?.email}</p>
        </Card>

        <div className="lg:col-span-2">
          <Card padding="lg" className="bg-white border-border">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                <Input label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <Input label="Business Name" value={profile.business_name} onChange={(e) => setProfile({ ...profile, business_name: e.target.value })} />
              <Input label="Business Address" value={profile.business_address} onChange={(e) => setProfile({ ...profile, business_address: e.target.value })} />
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">Business Description</label>
                <textarea value={profile.business_description} onChange={(e) => setProfile({ ...profile, business_description: e.target.value })}
                  className="w-full min-h-[100px] p-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne resize-none leading-relaxed"
                />
              </div>
              <Button type="submit" variant="primary" isLoading={saving} className="cursor-pointer">
                <Save size={14} className="mr-2" /> Save Profile
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
