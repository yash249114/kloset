'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { supportAPI } from '@/lib/api';
import type { SupportTicket } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const STATUS_BADGE: Record<string, 'gold' | 'sage' | 'charcoal' | 'rose'> = {
  open: 'gold',
  in_progress: 'charcoal',
  resolved: 'sage',
  closed: 'rose',
};

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const data = await supportAPI.getTicketById(ticketId);
      setTicket(data);
    } catch {
      toast.error('Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => { await loadTicket(); };
    init();
  }, [ticketId]);

const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await supportAPI.addReply(ticketId, { message: replyText.trim() });
      toast.success('Reply sent.');
      setReplyText('');
      loadTicket();
    } catch {
      toast.error('Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse select-none text-left">
        <div className="h-8 bg-ivory-dark w-1/3 rounded mb-4" />
        <div className="h-48 bg-white border border-border rounded-xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={32} className="mx-auto text-champagne mb-3" />
        <p className="text-xs font-mono text-charcoal-light">Ticket not found.</p>
        <Link href="/seller/support" className="text-xs font-mono text-champagne underline mt-2 inline-block">Back to Support</Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      <div className="flex items-center gap-4">
        <Link href="/seller/support" className="p-2 border border-border rounded hover:bg-ivory-dark transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Support</span>
          <h1 className="text-2xl md:text-3xl font-display font-medium text-charcoal mt-1 truncate max-w-xl">{ticket.subject}</h1>
        </div>
      </div>

      <Card padding="lg" className="bg-white border-border">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Badge variant={STATUS_BADGE[ticket.status] || 'gold'}>{ticket.status}</Badge>
            <span className="text-[9px] font-mono text-charcoal-light">
              <Clock size={10} className="inline mr-1" />
              Created {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="p-4 bg-ivory-dark/30 rounded-lg mb-6">
          <p className="text-xs text-charcoal-light leading-relaxed">{ticket.description}</p>
        </div>

        <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase mb-4 flex items-center gap-2">
          <MessageSquare size={13} /> Conversation
        </h3>

        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto scroll-rail">
          {(!ticket.replies || ticket.replies.length === 0) ? (
            <div className="text-center py-8 text-charcoal-light">
              <MessageSquare size={20} className="mx-auto mb-2 text-champagne" />
              <p className="text-xs font-mono">No replies yet. Our team will respond shortly.</p>
            </div>
          ) : (
            ticket.replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-champagne/10 flex items-center justify-center text-[9px] font-bold flex-shrink-0 text-champagne">
                  {reply.sender[0]?.toUpperCase() || 'S'}
                </div>
                <div className="bg-ivory-dark rounded-lg p-3 text-xs max-w-[80%]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[10px] text-champagne">{reply.sender}</span>
                    <span className="text-[9px] font-mono text-charcoal-light/60">
                      {new Date(reply.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-charcoal leading-relaxed">{reply.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <form onSubmit={handleReply} className="flex gap-3 pt-4 border-t border-border">
            <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 h-[48px] px-4 text-xs font-sans bg-warm-white border border-border rounded outline-none focus:border-champagne" />
            <Button type="submit" variant="primary" isLoading={sending} className="h-[48px] px-6 cursor-pointer">
              <Send size={14} className="mr-1" /> Send
            </Button>
          </form>
        )}
      </Card>
    </motion.div>
  );
}
