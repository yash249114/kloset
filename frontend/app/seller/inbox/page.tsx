'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Send, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const MOCK_CONVERSATIONS = [
  { id: '1', name: 'Priya M.', lastMsg: 'Is the Ivory Lehenga available for Diwali?', time: '2h ago', unread: true },
  { id: '2', name: 'Ananya S.', lastMsg: 'Can I get express delivery to Pune?', time: '1d ago', unread: false },
  { id: '3', name: 'Rahul V.', lastMsg: 'The fit was perfect! Will rent again.', time: '3d ago', unread: false },
];

export default function SellerInboxPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  const handleSend = () => {
    if (!message.trim()) return;
    toast.success('Message sent.');
    setMessage('');
  };

  return (
    <div className="space-y-8 text-left font-sans select-none text-charcoal">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}>
        <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Messages</span>
        <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Inbox</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light" size={14} />
            <input type="text" placeholder="Search conversations..."
              className="w-full h-[44px] pl-10 pr-4 text-xs font-sans bg-white border border-border rounded outline-none focus:border-champagne" />
          </div>
          {MOCK_CONVERSATIONS.map((conv) => (
            <button key={conv.id} onClick={() => setActiveChat(conv.id)}
              className={`w-full p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                activeChat === conv.id ? 'border-champagne bg-champagne/5' : 'border-border bg-white hover:border-champagne/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-charcoal">{conv.name}</span>
                <span className="text-[9px] font-mono text-charcoal-light">{conv.time}</span>
              </div>
              <p className="text-[10px] text-charcoal-light truncate">{conv.lastMsg}</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-8">
          <Card padding="md" className="bg-white border-border min-h-[400px] flex flex-col">
            {activeChat ? (
              <>
                <div className="flex-1 flex items-center justify-center text-charcoal-light">
                  <MessageSquare size={24} className="mb-2 mx-auto" />
                  <p className="text-xs font-mono">Select a conversation to start chatting with renters.</p>
                </div>
                <div className="flex gap-3 pt-4 border-t border-border mt-4">
                  <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 h-[48px] px-4 text-xs font-sans bg-warm-white border border-border rounded outline-none focus:border-champagne"
                  />
                  <Button variant="primary" onClick={handleSend} className="h-[48px] px-6 cursor-pointer">
                    <Send size={14} className="mr-1" /> Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-charcoal-light py-16">
                <MessageSquare size={32} className="mb-3 text-champagne" />
                <p className="text-xs font-mono">Select a conversation to start messaging.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
