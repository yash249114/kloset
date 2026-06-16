'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, RotateCcw, User, Bot } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import Drawer from '@/components/ui/Drawer';
import { client } from '@/lib/api';
import { Z_INDEX } from '@/lib/constants';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const INITIAL_BOT_MESSAGE: ChatMessage = {
  sender: 'bot',
  text: 'Namaste! Welcome to Kloset. I am your AI Stylist, powered by Gemini. How can I help you find or care for the perfect heritage outfit today?',
  timestamp: 'Just now',
};

export default function AIStylistDrawer() {
  const isOpen = useUIStore((s) => s.aiStylistOpen);
  const setIsOpen = useUIStore((s) => s.setAIStylistOpen);

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_BOT_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto Scroll to Bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Read chat history from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('kloset_ai_messages');
        if (stored) {
          try {
            setMessages(JSON.parse(stored));
          } catch {}
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const saveMessages = (msgs: ChatMessage[]) => {
    setMessages(msgs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kloset_ai_messages', JSON.stringify(msgs));
    }
  };

  const handleClear = () => {
    saveMessages([INITIAL_BOT_MESSAGE]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading) return;

    const timestamp = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = { sender: 'user', text, timestamp };
    const updatedMessages = [...messages, userMsg];
    saveMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare chat history formatted for Gemini
      const history = updatedMessages.slice(0, -1).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await client.post('/ai/chat', {
        message: text,
        history,
      });

      const reply = res.data?.data?.reply || "I'm sorry, I couldn't process that. Would you like to raise a support ticket?";
      const botMsg: ChatMessage = { sender: 'bot', text: reply, timestamp };
      saveMessages([...updatedMessages, botMsg]);
    } catch (err) {
      console.warn("AI Chat API failed, using fallback rules", err);
      
      // Traditional offline fallback policy triggers
      let replyText = "I'm sorry, I couldn't connect to the AI service right now. Would you like to raise a support ticket?";
      const lower = text.toLowerCase();

      if (lower.includes('cancel') || lower.includes('cancellation')) {
        replyText = '🌸 **Cancellation Policy**: You can cancel free of charge up to 7 days before your rental pick-up date! Within 7 days, a 50% cancellation fee is charged.';
      } else if (lower.includes('return') || lower.includes('policy') || lower.includes('pick')) {
        replyText = '📦 **Returns & Shipping**: We handle all return pickups! Please repack the outfit in the original Kloset zippered cover.';
      } else if (lower.includes('refund') || lower.includes('deposit') || lower.includes('money')) {
        replyText = '💰 **Refund Timeline**: Security deposits are released within 72 hours of quality review. Standard transfers credit in 2-5 business days.';
      } else if (lower.includes('damage') || lower.includes('stain') || lower.includes('tear')) {
        replyText = '🛡️ **Damage Cover**: Normal wear and minor stains are covered! For significant damage, part of the security deposit may be withheld.';
      } else if (lower.includes('size') || lower.includes('fit') || lower.includes('tight')) {
        replyText = '👗 **Fittings & Exchange**: If the outfit does not fit, contact us immediately. We can dispatch a replacement or issue a 100% rental credit.';
      }

      const botMsg: ChatMessage = { sender: 'bot', text: replyText, timestamp };
      saveMessages([...updatedMessages, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="AI Stylist Consultation"
      zIndex={Z_INDEX.DRAWER}
      maxWidth="480px"
    >
      <div className="flex flex-col h-[calc(100vh-160px)] font-sans select-none text-charcoal">
        
        {/* Messages Frame */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto space-y-4 pr-1 scroll-rail"
        >
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div 
                key={idx}
                className={`flex gap-3 text-left ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 ${
                  isUser ? 'bg-charcoal text-white border-charcoal' : 'bg-champagne/10 text-champagne border-champagne/30'
                }`}>
                  {isUser ? <User size={13} /> : <Bot size={13} />}
                </div>

                {/* Bubble */}
                <div className={`p-3.5 rounded-lg text-xs leading-relaxed max-w-[75%] border ${
                  isUser 
                    ? 'bg-white border-border text-charcoal rounded-tr-none' 
                    : 'bg-warm-white border-border text-charcoal-mid rounded-tl-none font-light'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span className="text-[8px] font-mono text-charcoal-light/60 block mt-1.5 text-right">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-champagne/10 text-champagne border border-champagne/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={13} />
              </div>
              <div className="p-3.5 rounded-lg bg-warm-white border border-border text-charcoal-mid rounded-tl-none font-light flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="border-t border-border pt-4 bg-white flex-shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask about cancellation, deposits, or dry cleaning..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 h-[52px] px-4 border border-border rounded text-xs focus:outline-none focus:border-champagne"
            />
            <button
              type="submit"
              className="w-12 h-[52px] bg-champagne text-white rounded flex items-center justify-center hover:bg-gold transition-colors cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="flex justify-between items-center mt-3 text-[10px] font-mono uppercase text-charcoal-light">
            <span>Powered by Gemini AI Engine</span>
            <button 
              onClick={handleClear}
              className="flex items-center gap-1 hover:text-charcoal cursor-pointer font-bold"
            >
              <RotateCcw size={10} /> Clear Chat
            </button>
          </div>
        </div>

      </div>
    </Drawer>
  );
}
