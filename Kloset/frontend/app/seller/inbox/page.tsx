'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Send, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { messagingAPI } from '@/lib/api';
import type { Conversation, Message } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SellerInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const convs = await messagingAPI.getConversations();
      setConversations(convs);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await messagingAPI.getMessages(conversationId);
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const convs = await messagingAPI.getConversations();
        setConversations(convs);
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (activeChat) {
      const init = async () => {
        try {
          const msgs = await messagingAPI.getMessages(activeChat);
          setMessages(msgs);
        } catch {
          setMessages([]);
        }
      };
      init();
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  const handleSend = async () => {
    if (!messageText.trim() || !activeChat) return;
    setSending(true);
    try {
      await messagingAPI.sendMessage(activeChat, messageText.trim());
      setMessageText('');
      await loadMessages(activeChat);
      toast.success('Message sent.');
    } catch {
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 text-left font-sans select-none text-charcoal">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}
        className="flex items-center justify-between"
      >
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Messages</span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Inbox</h1>
        </div>
        <button onClick={loadConversations} className="text-xs font-mono uppercase tracking-wider text-champagne hover:text-charcoal transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0">
          <RefreshCcw size={12} /> Refresh
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light" size={14} />
            <input type="text" placeholder="Search conversations..."
              className="w-full h-[44px] pl-10 pr-4 text-xs font-sans bg-white border border-border rounded outline-none focus:border-champagne" />
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="shimmer h-16 rounded bg-ivory-dark animate-pulse" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-charcoal-light">
              <MessageSquare size={20} className="mx-auto mb-2 text-champagne" />
              <p>No conversations yet.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button key={conv.id} onClick={() => setActiveChat(conv.id)}
                className={`w-full p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                  activeChat === conv.id ? 'border-champagne bg-champagne/5' : 'border-border bg-white hover:border-champagne/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-charcoal">{conv.participant_name}</span>
                  <div className="flex items-center gap-2">
                    {conv.unread_count > 0 && (
                      <span className="bg-champagne text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{conv.unread_count}</span>
                    )}
                    <span className="text-[9px] font-mono text-charcoal-light">{conv.last_message_time}</span>
                  </div>
                </div>
                <p className="text-[10px] text-charcoal-light truncate">{conv.last_message}</p>
              </button>
            ))
          )}
        </div>

        <div className="md:col-span-8">
          <Card padding="md" className="bg-white border-border min-h-[400px] flex flex-col">
            {activeChat ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 scroll-rail max-h-[400px]">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center text-charcoal-light py-16">
                      <MessageSquare size={24} className="mb-2 mx-auto text-champagne" />
                      <p className="text-xs font-mono">No messages in this conversation yet.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-charcoal/10 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                          {msg.sender_name[0]}
                        </div>
                        <div className="bg-ivory-dark rounded-lg p-3 text-xs max-w-[75%]">
                          <span className="font-bold text-[10px] text-champagne block mb-0.5">{msg.sender_name}</span>
                          <p className="text-charcoal">{msg.text}</p>
                          <span className="text-[9px] text-charcoal-light/60 block mt-1">{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-3 pt-4 border-t border-border mt-auto">
                  <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your reply..."
                    className="flex-1 h-[48px] px-4 text-xs font-sans bg-warm-white border border-border rounded outline-none focus:border-champagne"
                  />
                  <Button variant="primary" onClick={handleSend} isLoading={sending} className="h-[48px] px-6 cursor-pointer">
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
