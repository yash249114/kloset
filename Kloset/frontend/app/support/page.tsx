'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, Phone, ChevronRight, Plus, Clock, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supportAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

const STATUS_MAP: Record<string, { label: string; variant: 'gold' | 'sage' | 'rose' | 'outline' }> = {
  open: { label: 'Open', variant: 'gold' },
  in_progress: { label: 'In Progress', variant: 'sage' },
  resolved: { label: 'Resolved', variant: 'sage' },
  closed: { label: 'Closed', variant: 'outline' },
};

export default function SupportPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const [tickets, setTickets] = useState<Array<{ id: string; subject: string; description: string; status: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const resp = await supportAPI.getMyTickets();
      setTickets(resp.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicFaq = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      loadPublicFaq();
      return;
    }
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated, authLoading]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in both subject and description.');
      return;
    }
    setSubmitting(true);
    try {
      await supportAPI.createTicket({
        renterName: user?.name || 'Guest',
        renterEmail: user?.email || 'guest@kloset.com',
        subject: subject.trim(),
        description: description.trim(),
        priority: 'medium',
      });
      toast.success('Support ticket created. Our team will respond within 24 hours.');
      setShowNewTicket(false);
      setSubject('');
      setDescription('');
      if (isAuthenticated) loadTickets();
    } catch {
      toast.error('Failed to create support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="text-left mb-10"
        >
          <span className="text-xs font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
            Client Services
          </span>
          <h1 className="text-3xl font-display font-medium text-charcoal">Atelier Support</h1>
          <p className="text-xs text-charcoal-light font-mono mt-1">
            We respond to all queries within 24 hours
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: MessageSquare, label: 'Live Chat', desc: 'Chat with our team', action: () => toast.info('Live chat coming soon.') },
            { icon: Mail, label: 'Email Us', desc: 'support@klosetluxe.com', action: () => window.open('mailto:support@klosetluxe.com') },
            { icon: Phone, label: 'Phone Support', desc: '+91 1800 123 4567', action: () => toast.info('Phone support available 9 AM - 9 PM IST.') },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
              onClick={item.action}
              className="bg-white border border-border rounded-xl p-6 text-left flex items-start gap-4 cursor-pointer hover:shadow-sm transition-shadow"
            >
              <div className="p-3 bg-champagne/10 text-champagne rounded-lg">
                <item.icon size={20} />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-charcoal">{item.label}</h3>
                <p className="text-[10px] font-mono text-charcoal-light mt-0.5">{item.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-medium text-charcoal">Your Tickets</h2>
              <Button
                variant="gold"
                onClick={() => setShowNewTicket(true)}
                className="h-10 text-[10px] px-4 font-mono uppercase cursor-pointer"
              >
                <Plus size={14} className="mr-1" /> New Ticket
              </Button>
            </div>

            <AnimatePresence>
              {showNewTicket && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springTransition}
                >
                  <Card padding="lg" className="bg-white border-border mb-6 overflow-hidden">
                    <form onSubmit={handleCreateTicket} className="space-y-4">
                      <Input
                        label="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of your issue"
                        required
                      />
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe your issue in detail..."
                          className="w-full min-h-[120px] p-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne resize-none leading-relaxed"
                          required
                        />
                      </div>
                      <div className="flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={() => setShowNewTicket(false)} className="h-10 text-[10px] px-4 cursor-pointer">
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={submitting} className="h-10 text-[10px] px-6 cursor-pointer">
                          <Send size={12} className="mr-1" /> Submit
                        </Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white border border-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <Card padding="lg" className="bg-white border-border text-center py-12">
                <MessageSquare size={28} className="mx-auto text-champagne mb-3" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal">No Support Tickets</h3>
                <p className="text-[10px] font-mono text-charcoal-light/70 mt-1">
                  Create a ticket and our atelier team will assist you.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const statusInfo = STATUS_MAP[ticket.status] || STATUS_MAP.open;
                  return (
                    <motion.div
                      key={ticket.id}
                      whileHover={{ y: -2 }}
                      transition={springTransition}
                      className="bg-white border border-border rounded-xl p-6 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-display text-sm font-semibold text-charcoal">{ticket.subject}</h3>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                        <p className="text-xs text-charcoal-light line-clamp-2">{ticket.description}</p>
                        <p className="text-[9px] font-mono text-charcoal-light/60 mt-2 flex items-center gap-1">
                          <Clock size={10} /> {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-champagne flex-shrink-0 mt-1" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <Card padding="lg" className="bg-white border-border text-center py-12">
            <AlertCircle size={28} className="mx-auto text-champagne mb-3" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal">Need Help?</h3>
            <p className="text-[10px] font-mono text-charcoal-light/70 mt-1 max-w-md mx-auto">
              Sign in to track your support tickets or reach out via the channels above.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/auth/login?redirect=/support" className="btn btn-primary h-11 px-6 text-xs font-mono uppercase cursor-pointer">
                Sign In
              </Link>
              <Link href="/auth/register?redirect=/support" className="btn btn-outline h-11 px-6 text-xs font-mono uppercase cursor-pointer">
                Register
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
