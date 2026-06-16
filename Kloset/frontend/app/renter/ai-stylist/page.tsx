'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Sparkles,
  User,
  Bot,
  Trash2,
  MessageSquare,
  Clock,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const INITIAL_BOT_MESSAGE: ChatMessage = {
  sender: 'bot',
  text: 'Namaste! Welcome to Kloset. I am your AI Stylist, powered by Gemini. How can I help you find or care for the perfect heritage outfit today?',
  timestamp: 'Just now',
};

const STORAGE_KEY = 'kloset_ai_messages';

export default function AIStylistHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const setAIStylistOpen = useUIStore((s) => s.setAIStylistOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to view your stylist history.');
      router.push('/auth/login?redirect=/renter/ai-stylist');
      return;
    }

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setMessages(Array.isArray(parsed) ? parsed : []);
          } catch {
            setMessages([]);
          }
        }
      }
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated, authLoading]);

  const handleClearHistory = () => {
    setClearing(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
      setMessages([]);
      toast.success('Chat history cleared.');
    } catch {
      toast.error('Failed to clear chat history.');
    } finally {
      setClearing(false);
    }
  };

  const handleContinueChat = () => {
    setAIStylistOpen(true);
  };

  const userMessages = messages.filter((m) => m.sender === 'user');
  const botMessages = messages.filter((m) => m.sender === 'bot');
  const totalInteractions = userMessages.length;

  if (authLoading || loading) {
    return (
      <div className="bg-ivory min-h-screen pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-10 space-y-3">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-3 w-80" />
          </div>
          <div className="flex gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-2/3' : 'w-3/5'} rounded-lg`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none text-left">
      <div className="max-w-3xl mx-auto px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-charcoal-light mb-6">
          <Link href="/profile" className="hover:text-charcoal transition-colors">Account Studio</Link>
          <ChevronRight size={10} />
          <span className="text-champagne">AI Stylist</span>
        </div>

        {/* Header */}
        <div className="mb-10 text-left">
          <span className="text-xs font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
            AI Stylist Consultation
          </span>
          <h1 className="text-3xl font-display font-medium text-charcoal">
            Chat History
          </h1>
          <p className="text-xs text-charcoal-light font-mono mt-1">
            Review your past consultations with the Kloset AI Stylist.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card hoverEffect={false} padding="sm" className="bg-white border-border text-center">
            <MessageSquare size={16} className="mx-auto text-champagne mb-1" />
            <span className="text-lg font-display font-bold text-charcoal block">{totalInteractions}</span>
            <span className="text-[9px] font-mono text-charcoal-light uppercase">Questions Asked</span>
          </Card>
          <Card hoverEffect={false} padding="sm" className="bg-white border-border text-center">
            <Bot size={16} className="mx-auto text-champagne mb-1" />
            <span className="text-lg font-display font-bold text-charcoal block">{botMessages.length}</span>
            <span className="text-[9px] font-mono text-charcoal-light uppercase">AI Responses</span>
          </Card>
          <Card hoverEffect={false} padding="sm" className="bg-white border-border text-center">
            <Clock size={16} className="mx-auto text-champagne mb-1" />
            <span className="text-lg font-display font-bold text-charcoal block">
              {messages.length > 0
                ? new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : '—'}
            </span>
            <span className="text-[9px] font-mono text-charcoal-light uppercase">Last Active</span>
          </Card>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <h2 className="text-sm font-display font-semibold text-charcoal">Conversation</h2>
          <div className="flex gap-3">
            {messages.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearHistory}
                isLoading={clearing}
                className="h-10 text-[10px] px-4 font-mono font-bold uppercase tracking-wider cursor-pointer"
              >
                <Trash2 size={12} className="mr-1" /> Clear History
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleContinueChat}
              className="h-10 text-[10px] px-4 font-mono font-bold uppercase tracking-wider cursor-pointer"
            >
              <Sparkles size={12} className="mr-1" /> Continue Chat
            </Button>
          </div>
        </div>

        {/* Chat messages */}
        {messages.length === 0 ? (
          <Card hoverEffect={false} padding="lg" className="bg-white border-border text-center py-16">
            <div className="w-16 h-16 rounded-full bg-champagne/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} className="text-champagne" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal">No Chat History</h3>
            <p className="text-[10px] font-mono text-charcoal-light/70 mt-1 max-w-sm mx-auto font-light">
              You haven&apos;t started a consultation with the AI Stylist yet. Ask about outfits, sizing, returns, or styling advice.
            </p>
            <Button
              variant="primary"
              onClick={handleContinueChat}
              className="mt-6 h-[52px] px-8 text-xs font-mono uppercase tracking-widest cursor-pointer"
            >
              <Sparkles size={14} className="mr-2" /> Start Consultation
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springTransition, delay: Math.min(idx * 0.03, 0.3) }}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 ${
                      isUser
                        ? 'bg-charcoal text-white border-charcoal'
                        : 'bg-champagne/10 text-champagne border-champagne/30'
                    }`}>
                      {isUser ? <User size={13} /> : <Bot size={13} />}
                    </div>

                    {/* Bubble */}
                    <div className={`p-4 rounded-lg text-xs leading-relaxed max-w-[80%] border ${
                      isUser
                        ? 'bg-white border-border text-charcoal rounded-tr-none'
                        : 'bg-warm-white border-border text-charcoal-mid rounded-tl-none font-light'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className="text-[8px] font-mono text-charcoal-light/60 block mt-2 text-right flex items-center justify-end gap-1">
                        <Clock size={9} />
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Continue CTA at bottom */}
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.4 }}
            className="mt-10 text-center"
          >
            <Card hoverEffect={false} padding="md" className="bg-white border-border">
              <div className="flex items-center justify-center gap-3">
                <Sparkles size={16} className="text-champagne animate-pulse" />
                <p className="text-xs text-charcoal-light">
                  Want to ask something else?
                </p>
                <button
                  onClick={handleContinueChat}
                  className="text-xs font-mono font-bold text-champagne hover:text-charcoal transition-colors cursor-pointer flex items-center gap-1"
                >
                  Continue Chat <ExternalLink size={11} />
                </button>
              </div>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}
