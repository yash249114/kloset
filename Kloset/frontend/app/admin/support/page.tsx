'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, RefreshCcw, Search, ChevronRight, Clock } from 'lucide-react';
import { supportAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  renterName?: string;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'gold' | 'sage' | 'rose' | 'outline' }> = {
  open: { label: 'Open', variant: 'gold' },
  in_progress: { label: 'In Progress', variant: 'sage' },
  resolved: { label: 'Resolved', variant: 'sage' },
  closed: { label: 'Closed', variant: 'outline' },
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const resp = await supportAPI.getAllTickets();
      setTickets(resp.tickets || resp || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const filteredTickets = query
    ? tickets.filter(t =>
        (t.subject?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (t.renterName?.toLowerCase() || '').includes(query.toLowerCase())
      )
    : tickets;

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left select-none bg-admin-bg min-h-screen text-[#E8E8E8] font-sans"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">Client Services</span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">Support Tickets</h1>
        </div>
        <button onClick={loadTickets}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" size={16} />
        <input type="text" placeholder="Search tickets..." value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-[48px] pl-12 pr-4 text-xs font-sans bg-[#1A1A1A] border border-[#2A2A2A] rounded outline-none focus:border-[#C9A96E] text-[#E8E8E8] placeholder-[#8C8C8C]" />
      </div>

      <Card padding="md" theme="admin">
        {loading ? (
          <div className="space-y-4 animate-pulse">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-[#2A2A2A] rounded" />)}</div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare size={28} className="mx-auto text-[#C9A96E] mb-3" />
            <p className="text-xs font-mono text-[#8C8C8C]">No support tickets found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const statusInfo = STATUS_MAP[ticket.status] || STATUS_MAP.open;
              return (
                <div key={ticket.id} className="flex items-center justify-between p-5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg hover:bg-[#222] transition-colors cursor-pointer">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#E8E8E8]">{ticket.subject}</span>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-[10px] text-[#8C8C8C] font-mono flex items-center gap-1">
                      <Clock size={10} /> {new Date(ticket.created_at).toLocaleDateString('en-IN')} &middot; {ticket.renterName || 'Anonymous'}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-[#C9A96E]" />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
