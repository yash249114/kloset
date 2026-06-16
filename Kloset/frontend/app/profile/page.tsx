'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  MapPin, 
  Wallet, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Check, 
  Building,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { userAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { User, Address, AddAddressPayload } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ProfileSkeleton } from '@/components/ui/Skeleton';

type ProfileTab = 'personal' | 'addresses' | 'business' | 'wallet';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [profileLoading, setProfileLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  // Personal Info Form
  const [personalForm, setPersonalForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
  });

  // Business Info Form
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    business_address: '',
    pickup_address: '',
    return_address: '',
    gst_details: '',
    pan_details: '',
    bank_details: '',
    business_description: '',
  });

  // New Address Form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<AddAddressPayload>({
    label: '',
    full_address: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to access your profile.');
      router.push('/auth/login?redirect=/profile');
      return;
    }

    async function loadProfileData() {
      if (!isAuthenticated) return;
      setProfileLoading(true);
      try {
        const fullUser = await userAPI.getProfile();
        setUser(fullUser);
        
        setPersonalForm({
          name: fullUser.name || '',
          email: fullUser.email || '',
          phone: fullUser.phone || '',
          gender: fullUser.gender || '',
          date_of_birth: fullUser.date_of_birth ? fullUser.date_of_birth.substring(0, 10) : '',
        });

        setBusinessForm({
          business_name: fullUser.business_name || '',
          business_address: fullUser.business_address || '',
          pickup_address: fullUser.pickup_address || '',
          return_address: fullUser.return_address || '',
          gst_details: fullUser.gst_details || '',
          pan_details: fullUser.pan_details || '',
          bank_details: fullUser.bank_details || '',
          business_description: fullUser.business_description || '',
        });

        const userAddresses = await userAPI.getAddresses();
        setAddresses(userAddresses);
      } catch (err) {
        console.error('Failed to load profile details', err);
        toast.error('Failed to fetch profile settings from API.');
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfileData();
  }, [isAuthenticated, authLoading, router, setUser]);

  const handleUpdatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    try {
      await userAPI.updateProfile(personalForm);
      const updatedUser = { ...user, ...personalForm };
      setUser(updatedUser);
      toast.success('Personal profile details updated.');
    } catch (err) {
      toast.error('Failed to save profile changes.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    try {
      await userAPI.updateProfile(businessForm);
      const updatedUser = { ...user, ...businessForm };
      setUser(updatedUser);
      toast.success('Bespoke business settings updated.');
    } catch (err) {
      toast.error('Failed to save business settings.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.label || !newAddress.full_address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill in all address parameters.');
      return;
    }
    setUpdating(true);
    try {
      const added = await userAPI.addAddress(newAddress);
      setAddresses([...addresses, added]);
      setShowAddAddress(false);
      setNewAddress({
        label: '',
        full_address: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
      });
      toast.success('New delivery dispatch destination created.');
    } catch (err) {
      toast.error('Failed to create address registry.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await userAPI.deleteAddress(id);
      setAddresses(addresses.filter((addr) => addr.id !== id));
      toast.success('Address removed from registry.');
    } catch (err) {
      toast.error('Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await userAPI.setDefaultAddress(id);
      setAddresses(addresses.map((addr) => ({
        ...addr,
        is_default: addr.id === id,
      })));
      toast.success('Default delivery destination updated.');
    } catch (err) {
      toast.error('Failed to set default address.');
    }
  };

  if (authLoading || profileLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none text-left">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Banner header info */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/80">
          <div>
            <span className="text-xs font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
              Atelier Profile Registry
            </span>
            <h1 className="text-3xl font-display font-medium text-charcoal">
              {user?.name || 'Couture Member'}
            </h1>
            <p className="text-xs text-charcoal-light font-mono mt-1">
              Verifications: {user?.is_verified ? (
                <span className="text-success font-bold">✓ ESCROW VERIFIED</span>
              ) : (
                <span className="text-error font-bold">UNVERIFIED MEMBER</span>
              )}
            </p>
          </div>

          <div className="flex gap-4">
            <Card hoverEffect={false} padding="sm" className="bg-white border-border flex items-center gap-3">
              <div className="p-2 bg-champagne/10 text-champagne rounded">
                <Wallet size={16} />
              </div>
              <div>
                <span className="text-[9px] font-mono text-charcoal-light uppercase block font-semibold">Wallet Balance</span>
                <span className="font-mono text-xs font-bold text-charcoal">₹{(user?.wallet_balance || 0).toLocaleString()}</span>
              </div>
            </Card>

            <Card hoverEffect={false} padding="sm" className="bg-white border-border flex items-center gap-3">
              <div className="p-2 bg-success/10 text-success rounded">
                <ShieldCheck size={16} />
              </div>
              <div>
                <span className="text-[9px] font-mono text-charcoal-light uppercase block font-semibold">Trust Index</span>
                <span className="font-mono text-xs font-bold text-charcoal">{(user?.trust_score || 95)}%</span>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Side Tabs navigation */}
          <div className="flex flex-col gap-1.5 md:col-span-1">
            {[
              { id: 'personal', label: 'Account Profile', icon: <UserIcon size={14} /> },
              { id: 'addresses', label: 'Delivery Registry', icon: <MapPin size={14} /> },
              { id: 'business', label: 'Atelier Settings', icon: <Building size={14} /> },
              { id: 'wallet', label: 'Escrow Ledger', icon: <Wallet size={14} /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springTransition}
                  className={`w-full h-[52px] px-4 text-xs font-mono font-bold uppercase tracking-wider rounded flex items-center gap-3 transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-charcoal text-ivory' 
                      : 'bg-white border border-border/60 hover:bg-ivory-dark text-charcoal-light'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Tab Panels */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={springTransition}
              >
                {/* 1. PERSONAL TAB */}
                {activeTab === 'personal' && (
                  <Card hoverEffect={false} padding="lg" className="bg-white border-border shadow-sm">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase mb-6 flex items-center gap-2">
                      <UserIcon size={14} /> Personal Identity Registry
                    </h3>

                    <form onSubmit={handleUpdatePersonal} className="space-y-4 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Full Legal Name"
                          name="name"
                          value={personalForm.name}
                          onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                          required
                        />

                        <Input
                          label="Contact Phone"
                          name="phone"
                          value={personalForm.phone}
                          onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                          required
                        />
                      </div>

                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={personalForm.email}
                        disabled
                        helperText="Primary identity email. Contact verification support to modify."
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                            Gender
                          </label>
                          <select
                            className="w-full h-[52px] px-4 text-xs font-mono bg-white border border-border rounded focus:outline-none focus:border-champagne"
                            value={personalForm.gender}
                            onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                          >
                            <option value="">Select Gender</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="unspecified">Prefer not to say</option>
                          </select>
                        </div>

                        <Input
                          label="Date of Birth"
                          name="date_of_birth"
                          type="date"
                          value={personalForm.date_of_birth}
                          onChange={(e) => setPersonalForm({ ...personalForm, date_of_birth: e.target.value })}
                        />
                      </div>

                      <div className="pt-4 text-right">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={updating}
                          className="h-[52px] px-8 cursor-pointer"
                        >
                          <Check size={14} className="mr-2" /> Save Account Profile
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* 2. DELIVERY REGISTRY */}
                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <Card hoverEffect={false} padding="lg" className="bg-white border-border shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase flex items-center gap-2">
                          <MapPin size={14} /> Registered Shipments Locations
                        </h3>
                        {!showAddAddress && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddAddress(true)}
                            className="h-[52px] text-[10px] px-4 font-mono font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Plus size={12} className="mr-1" /> Add Address
                          </Button>
                        )}
                      </div>

                      {/* Add Address Form */}
                      <AnimatePresence>
                        {showAddAddress && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={springTransition}
                            onSubmit={handleAddAddress}
                            className="p-5 border border-border/80 bg-[#FAF9F6] rounded-lg mb-6 space-y-4 overflow-hidden"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Input
                                label="address label (e.g. Home, Office, Atelier)"
                                name="label"
                                value={newAddress.label}
                                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                required
                              />
                              <Input
                                label="postal pincode"
                                name="pincode"
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                required
                              />
                            </div>

                            <Input
                              label="street address details"
                              name="full_address"
                              value={newAddress.full_address}
                              onChange={(e) => setNewAddress({ ...newAddress, full_address: e.target.value })}
                              required
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Input
                                label="City"
                                name="city"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                required
                              />
                              <Input
                                label="State"
                                name="state"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                required
                              />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 accent-champagne"
                                  checked={newAddress.is_default}
                                  onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                                />
                                Designate Default Destination
                              </label>

                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => setShowAddAddress(false)}
                                  className="h-[52px] text-[10px] px-4"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  variant="primary"
                                  isLoading={updating}
                                  className="h-[52px] text-[10px] px-6"
                                >
                                  Save Location
                                </Button>
                              </div>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      {/* Addresses Grid list */}
                      {addresses.length === 0 ? (
                        <p className="text-xs font-mono text-charcoal-light font-light py-8 text-center bg-ivory-dark/30 rounded border border-dashed border-border">
                          No delivery dispatch locations listed. Add a default location.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {addresses.map((addr) => (
                            <motion.div 
                              key={addr.id}
                              whileHover={{ y: -2 }}
                              transition={springTransition}
                              className={`p-4 border rounded-lg flex items-start justify-between gap-4 ${
                                addr.is_default 
                                  ? 'border-champagne bg-champagne/[0.02]' 
                                  : 'border-border bg-white hover:border-champagne/40'
                              }`}
                            >
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-mono font-bold text-charcoal uppercase tracking-wider">{addr.label}</h4>
                                  {addr.is_default && (
                                    <span className="bg-champagne/15 text-champagne text-[8px] font-mono uppercase font-bold px-2 py-0.5 rounded">
                                      Default Destination
                                    </span>
                                  )}
                                </div>
                                <p className="text-charcoal-light font-sans mt-1 leading-relaxed">{addr.full_address}</p>
                                <p className="text-[10px] font-mono text-charcoal-light/75">
                                  {addr.city}, {addr.state} - <strong className="text-charcoal">{addr.pincode}</strong>
                                </p>
                              </div>

                              <div className="flex gap-1.5 flex-shrink-0">
                                {!addr.is_default && (
                                  <motion.button
                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={springTransition}
                                    className="p-2 border border-border bg-white hover:bg-ivory-dark text-charcoal-light rounded text-[9px] font-mono uppercase font-bold cursor-pointer"
                                  >
                                    Set Default
                                  </motion.button>
                                )}
                                <motion.button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={springTransition}
                                  className="p-2 border border-border bg-white hover:border-red-50 hover:text-error text-charcoal-light rounded cursor-pointer"
                                  title="Delete location"
                                >
                                  <Trash2 size={13} />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* 3. BUSINESS TAB */}
                {activeTab === 'business' && (
                  <Card hoverEffect={false} padding="lg" className="bg-white border-border shadow-sm">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase mb-6 flex items-center gap-2">
                      <Building size={14} /> Bespoke Host Settings
                    </h3>

                    <form onSubmit={handleUpdateBusiness} className="space-y-4 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Atelier Business Name"
                          name="business_name"
                          value={businessForm.business_name}
                          onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
                          placeholder="e.g. Devika Couture Rental Studio"
                        />
                        <Input
                          label="GSTIN (Optional)"
                          name="gst_details"
                          value={businessForm.gst_details}
                          onChange={(e) => setBusinessForm({ ...businessForm, gst_details: e.target.value })}
                          placeholder="e.g. 07AAAAA1111A1Z1"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="PAN Card Number"
                          name="pan_details"
                          value={businessForm.pan_details}
                          onChange={(e) => setBusinessForm({ ...businessForm, pan_details: e.target.value })}
                          placeholder="e.g. ABCDE1234F"
                        />
                        <Input
                          label="Payout Settlement Bank Details"
                          name="bank_details"
                          value={businessForm.bank_details}
                          onChange={(e) => setBusinessForm({ ...businessForm, bank_details: e.target.value })}
                          placeholder="Account Number & IFSC Code"
                        />
                      </div>

                      <Input
                        label="Registered Business Address"
                        name="business_address"
                        value={businessForm.business_address}
                        onChange={(e) => setBusinessForm({ ...businessForm, business_address: e.target.value })}
                        placeholder="Complete legal registry address details"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Garment Pickup Address"
                          name="pickup_address"
                          value={businessForm.pickup_address}
                          onChange={(e) => setBusinessForm({ ...businessForm, pickup_address: e.target.value })}
                          placeholder="Registry for logistics dispatch"
                        />
                        <Input
                          label="Garment Return Address"
                          name="return_address"
                          value={businessForm.return_address}
                          onChange={(e) => setBusinessForm({ ...businessForm, return_address: e.target.value })}
                          placeholder="Registry for returned garment delivery"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                          Studio Description
                        </label>
                        <textarea
                          className="w-full min-h-[100px] p-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne resize-none leading-relaxed"
                          value={businessForm.business_description}
                          onChange={(e) => setBusinessForm({ ...businessForm, business_description: e.target.value })}
                          placeholder="Provide a bio about your curation process, tailoring adjustments, and designer focus."
                        />
                      </div>

                      <div className="pt-4 text-right">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={updating}
                          className="h-[52px] px-8 cursor-pointer"
                        >
                          <Check size={14} className="mr-2" /> Save Atelier Settings
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* 4. WALLET LEDGER TAB */}
                {activeTab === 'wallet' && (
                  <Card hoverEffect={false} padding="lg" className="bg-white border-border shadow-sm">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase mb-6 flex items-center gap-2">
                      <Wallet size={14} /> Kloset Escrow Wallet Ledger
                    </h3>

                    <div className="border border-border/80 rounded-lg p-6 bg-[#FAF9F6] text-center space-y-4 mb-6">
                      <span className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase block font-semibold">
                        Available Escrow Balance
                      </span>
                      <h2 className="text-4xl font-display font-medium text-charcoal">
                        ₹{(user?.wallet_balance || 0).toLocaleString('en-IN')}
                      </h2>
                      <p className="text-[10px] text-charcoal-light font-mono leading-relaxed max-w-md mx-auto font-light">
                        Escrow payouts are held securely during the active booking periods and settled directly to your registered bank account upon order checkout completion.
                      </p>

                      <div className="pt-2 flex justify-center gap-4">
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => toast.info('Payout settlement automated at calendar end.')}
                          className="h-[52px] text-[10px] px-6 font-mono font-bold uppercase cursor-pointer"
                        >
                          Withdraw Payout
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => toast.info('Credits can be loaded at checkouts.')}
                          className="h-[52px] text-[10px] px-6 font-mono font-bold uppercase cursor-pointer"
                        >
                          Add Wallet Credits
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-6">
                      <h4 className="text-[10px] font-mono font-bold tracking-widest text-charcoal uppercase mb-3 flex items-center gap-1.5">
                        <FileCheck size={13} className="text-champagne" /> Ledger Transaction Logs
                      </h4>
                      <p className="text-xs font-mono text-charcoal-light font-light text-center py-6">
                        No transactions recorded in the current billing cycle.
                      </p>
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
