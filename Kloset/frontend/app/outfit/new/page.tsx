'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, X, ArrowLeft, Plus, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { outfitsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { OutfitCategory, CreateOutfitPayload } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

const CATEGORIES: OutfitCategory[] = ['lehenga', 'saree', 'anarkali', 'sharara', 'gown', 'sherwani', 'kurta_set', 'co_ord', 'western', 'other'];
const OCCASIONS = ['wedding', 'reception', 'engagement', 'sangeet', 'festive', 'party', 'cocktail', 'casual'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function NewOutfitPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; cloudinary_id: string; is_primary: boolean; sort_order: number }[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as OutfitCategory | '',
    fabric: '',
    city: '',
    state: '',
    pincode: '',
    price_1day: '',
    price_3day: '',
    price_7day: '',
    security_deposit: '',
    delivery_fee: '0',
    delivery_available: true,
    occasions: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    accessories_included: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to list couture.');
      router.push('/auth/login?redirect=/outfit/new');
    }
  }, [isAuthenticated, authLoading]);

  const updateForm = (key: string, value: string | boolean | string[]) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key: 'occasions' | 'colors' | 'sizes' | 'accessories_included', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const objectUrl = URL.createObjectURL(file);
      setUploadedImages((prev) => [
        ...prev,
        { url: objectUrl, cloudinary_id: `temp_${Date.now()}`, is_primary: prev.length === 0, sort_order: prev.length },
      ]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category || !form.price_1day) {
      toast.error('Please fill in required fields: title, category, and rental price.');
      return;
    }
    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateOutfitPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as OutfitCategory,
        occasions: form.occasions,
        colors: form.colors,
        fabric: form.fabric.trim(),
        sizes: form.sizes,
        accessories_included: form.accessories_included,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        price_1day: Number(form.price_1day),
        price_3day: Number(form.price_3day) || Number(form.price_1day) * 2.5,
        price_7day: Number(form.price_7day) || Number(form.price_1day) * 5,
        security_deposit: Number(form.security_deposit) || Number(form.price_1day) * 3,
        delivery_available: form.delivery_available,
        delivery_fee: Number(form.delivery_fee),
        images: uploadedImages,
      };
      await outfitsAPI.create(payload);
      toast.success('Couture listing created! It will be reviewed by our team.');
      router.push('/seller/listings');
    } catch {
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-champagne rounded-full border-t-transparent mb-2" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
        >
          <Link href="/seller/listings" className="text-[10px] font-mono text-champagne hover:text-charcoal transition-colors flex items-center gap-1 mb-4">
            <ArrowLeft size={12} /> Back to My Listings
          </Link>
          <span className="text-xs font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
            New Listing
          </span>
          <h1 className="text-3xl font-display font-medium text-charcoal mb-10">List Your Couture</h1>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.05 }}
          >
            <Card padding="lg" className="bg-white border-border space-y-5">
              <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase flex items-center gap-2">
                <Sparkles size={14} /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Title *" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="e.g. Ivory Zardozi Lehenga" required />
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">Category *</label>
                  <select value={form.category} onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full h-[52px] px-4 text-xs font-sans bg-white border border-border rounded outline-none focus:border-champagne" required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Describe the outfit, its design details, and ideal occasions..."
                  className="w-full min-h-[120px] p-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne resize-none leading-relaxed"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Fabric" value={form.fabric} onChange={(e) => updateForm('fabric', e.target.value)} placeholder="e.g. Silk, Velvet" />
                <Input label="City" value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="e.g. Mumbai" />
                <Input label="State" value={form.state} onChange={(e) => updateForm('state', e.target.value)} placeholder="e.g. Maharashtra" />
              </div>
              <Input label="Pincode" value={form.pincode} onChange={(e) => updateForm('pincode', e.target.value)} placeholder="e.g. 400001" />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.1 }}
          >
            <Card padding="lg" className="bg-white border-border space-y-5">
              <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase flex items-center gap-2">
                <Upload size={14} /> Photos
              </h3>
              <div className="flex flex-wrap gap-4">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative w-28 h-36 rounded-lg overflow-hidden border border-border bg-ivory-dark group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-charcoal/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                    {img.is_primary && <span className="absolute bottom-1 left-1 bg-champagne text-[8px] font-mono font-bold text-white px-1.5 py-0.5 rounded">Primary</span>}
                  </div>
                ))}
                <label className="w-28 h-36 rounded-lg border-2 border-dashed border-border bg-ivory-dark/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-champagne transition-colors">
                  <Plus size={20} className="text-champagne" />
                  <span className="text-[8px] font-mono text-charcoal-light">Add Photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.15 }}
          >
            <Card padding="lg" className="bg-white border-border space-y-5">
              <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase">Pricing & Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="1 Day Rental (₹) *" type="number" value={form.price_1day} onChange={(e) => updateForm('price_1day', e.target.value)} required />
                <Input label="3 Day Rental (₹)" type="number" value={form.price_3day} onChange={(e) => updateForm('price_3day', e.target.value)} />
                <Input label="7 Day Rental (₹)" type="number" value={form.price_7day} onChange={(e) => updateForm('price_7day', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Security Deposit (₹) *" type="number" value={form.security_deposit} onChange={(e) => updateForm('security_deposit', e.target.value)} placeholder="e.g. 8000" required />
                <Input label="Delivery Fee (₹)" type="number" value={form.delivery_fee} onChange={(e) => updateForm('delivery_fee', e.target.value)} />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.2 }}
          >
            <Card padding="lg" className="bg-white border-border space-y-5">
              <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase">Attributes</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-2">Occasions</span>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((occ) => (
                      <button key={occ} type="button" onClick={() => toggleArrayItem('occasions', occ)}
                        className={`h-10 px-4 rounded text-[10px] font-mono uppercase font-bold border cursor-pointer transition-colors ${
                          form.occasions.includes(occ) ? 'bg-charcoal text-ivory border-charcoal' : 'bg-white border-border text-charcoal-light hover:border-charcoal'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-2">Sizes</span>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button key={s} type="button" onClick={() => toggleArrayItem('sizes', s)}
                        className={`w-11 h-11 rounded text-xs font-mono font-bold border cursor-pointer transition-colors ${
                          form.sizes.includes(s) ? 'bg-charcoal text-ivory border-charcoal' : 'bg-white border-border text-charcoal-light hover:border-charcoal'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Colors (comma separated)" value={form.colors.join(', ')} onChange={(e) => updateForm('colors', e.target.value.split(',').map((c) => c.trim()))} placeholder="e.g. Ivory, Gold, Emerald" />
                <Input label="Accessories Included (comma separated)" value={form.accessories_included.join(', ')} onChange={(e) => updateForm('accessories_included', e.target.value.split(',').map((c) => c.trim()))} placeholder="e.g. Dupatta, Jewellery Set, Clutch" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.25 }}
            className="flex gap-4 justify-end"
          >
            <Link href="/seller/listings" className="btn btn-ghost h-[52px] px-8 text-xs font-mono uppercase tracking-widest inline-flex items-center justify-center cursor-pointer">
              Cancel
            </Link>
            <Button type="submit" variant="primary" isLoading={submitting} className="h-[52px] px-8 cursor-pointer">
              <Check size={16} className="mr-2" /> Submit for Review
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
