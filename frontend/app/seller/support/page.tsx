'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supportAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SellerSupportPage() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await supportAPI.createTicket({
        renterName: user?.name || 'Seller',
        renterEmail: user?.email || 'seller@kloset.com',
        subject: subject.trim(),
        description: description.trim(),
        priority: 'medium',
      });
      toast.success('Support ticket created.');
      setShowForm(false);
      setSubject('');
      setDescription('');
    } catch {
      toast.error('Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Assistance</span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Seller Support</h1>
        </div>
        <Button variant="gold" onClick={() => setShowForm(!showForm)} className="h-10 text-[10px] px-4 font-mono uppercase cursor-pointer">
          <Plus size={14} className="mr-1" /> New Ticket
        </Button>
      </div>

      {showForm && (
        <Card padding="lg" className="bg-white border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" required />
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px] p-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne resize-none leading-relaxed"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="h-10 text-[10px] px-4 cursor-pointer">Cancel</Button>
              <Button type="submit" variant="primary" isLoading={submitting} className="h-10 text-[10px] px-6 cursor-pointer">
                <Send size={12} className="mr-1" /> Submit
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card padding="lg" className="bg-white border-border text-center py-12">
        <MessageSquare size={28} className="mx-auto text-champagne mb-3" />
        <p className="text-xs font-mono text-charcoal-light">Our seller support team is available 24/7. Create a ticket and we&apos;ll respond within 24 hours.</p>
        <div className="mt-4 text-[10px] text-charcoal-light font-mono">
          <p>Email: sellers@klosetluxe.com</p>
          <p>Phone: +91 1800 123 4567</p>
        </div>
      </Card>
    </motion.div>
  );
}
