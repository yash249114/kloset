'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Send, Activity, AlertTriangle,
  CheckCircle, Info, Cpu, Maximize2, Minimize2, RefreshCcw
} from 'lucide-react';
import { adminAPI, type AdminStats } from '@/lib/api';

interface Alert {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  message: string;
  timestamp: Date;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

type PanelMode = 'compact' | 'expanded';

const SYS_MSG = '█ Initializing Jarvis AIOps framework...';

export default function AIOpsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PanelMode>('compact');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [briefing, setBriefing] = useState('');
  const [displayedBriefing, setDisplayedBriefing] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Jarvis online. How can I assist with platform operations today?', id: 'init' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState<'online' | 'degraded'>('online');
  const [activePolls, setActivePolls] = useState<string[]>([]);
  const [logLines, setLogLines] = useState<string[]>([SYS_MSG]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogLines(prev => [...prev.slice(-50), msg]);
  }, []);

  const addAlert = useCallback((type: Alert['type'], message: string) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setAlerts(prev => [{
      id, type, message, timestamp: new Date()
    }, ...prev.slice(49)]);
    addLog(`${type.toUpperCase()}: ${message}`);
  }, [addLog]);

  const typewriteText = useCallback((text: string) => {
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    setDisplayedBriefing('');
    setIsTyping(true);

    let idx = 0;
    typewriterRef.current = setInterval(() => {
      if (idx < text.length) {
        setDisplayedBriefing(text.slice(0, idx + 1));
        idx++;
      } else {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        setIsTyping(false);
      }
    }, 15);
  }, []);

  // ─── Polling Engine ────────────────────────────────
  const runDiagnostics = useCallback(async () => {
    const polls: string[] = [];
    addLog('→ Running platform diagnostics...');

    // 1. Health check
    try {
      const resp = await adminAPI.getStats();
      setStats(resp);
      polls.push('health');

      if (resp.open_disputes > 5) {
        addAlert('warning', `${resp.open_disputes} open disputes require attention`);
      }
      if (resp.kyc_queue_count > 3) {
        addAlert('info', `${resp.kyc_queue_count} KYC submissions pending review`);
      }
    } catch {
      setSystemStatus('degraded');
      addAlert('error', 'Health check failed — API unreachable');
    }

    // 2. Pending listings
    try {
      const listings = await adminAPI.getPendingOutfits();
      setPendingCount(listings.length);
      polls.push('listings');

      if (listings.length > 0) {
        addAlert('warning', `⚠️ ${listings.length} listing${listings.length > 1 ? 's' : ''} pending review`);
      } else {
        addAlert('success', '✅ No listings pending review');
      }
    } catch {
      addAlert('error', 'Failed to fetch pending listings');
    }

    // 3. Overdue returns check (via bookings)
    try {
      const resp = await adminAPI.getBookings(1, 100);
      const overdue = resp.bookings.filter(b =>
        (b.status === 'in_use' || b.status === 'picked_up') &&
        new Date(b.return_date) < new Date()
      );
      polls.push('returns');

      if (overdue.length > 0) {
        addAlert('warning', `⏰ ${overdue.length} overdue return${overdue.length > 1 ? 's' : ''}`);
      } else {
        addAlert('success', '✅ All returns on schedule');
      }
    } catch {
      addAlert('error', 'Failed to check return status');
    }

    // 4. Escrow anomalies
    try {
      const txResp = await adminAPI.getTransactions();
      const failedTx = txResp.filter(t => t.status === 'failed');
      polls.push('escrow');

      if (failedTx.length > 0) {
        addAlert('warning', `🔒 ${failedTx.length} failed escrow transaction${failedTx.length > 1 ? 's' : ''}`);
      } else {
        addAlert('success', '✅ All payments cleared');
      }
    } catch {
      addAlert('error', 'Failed to verify escrow status');
    }

    setActivePolls(prev => [...new Set([...prev, ...polls])]);
    addLog('→ Diagnostics complete.');
  }, [addAlert, addLog]);

  // ─── Auto-pilot on mount ────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const init = async () => {
      await runDiagnostics();
    };
    init();

    const pollInterval = setInterval(() => { void runDiagnostics(); }, 30000);
    return () => clearInterval(pollInterval);
  }, [isOpen, runDiagnostics]);

  // ─── Generate Gemini Briefing ───────────────────────
  useEffect(() => {
    if (!isOpen || !stats) return;
    const generateBriefing = async () => {
      addLog('→ Jarvis: Generating status briefing...');
      try {
        const resp = await fetch('/api/aiops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'briefing',
            metrics: {
              total_users: stats.total_users,
              total_outfits: stats.total_outfits,
              total_bookings: stats.total_bookings,
              active_bookings: stats.active_bookings,
              total_revenue: stats.total_revenue,
              open_disputes: stats.open_disputes,
              pending_approvals: stats.pending_approval_count,
              kyc_queue: stats.kyc_queue_count,
              pending_listings: pendingCount,
            }
          }),
        });
        const data = await resp.json();
        setBriefing(data.content);
        typewriteText(data.content);
        addLog('✓ Briefing received from Gemini.');
      } catch {
        const fallback = 'Diagnostics complete. All systems nominal. Platform operating within normal parameters.';
        setBriefing(fallback);
        typewriteText(fallback);
        addLog('⚠ Briefing generated locally (Gemini unavailable).');
      }
    };
    generateBriefing();
  }, [isOpen, stats, pendingCount, typewriteText, addLog]);

  // ─── Auto-scroll chat ──────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── Send Chat Message ──────────────────────────────
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      id: `user-${Date.now()}`,
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    addLog(`→ Admin query: "${userMsg.content}"`);

    try {
      const resp = await fetch('/api/aiops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'query',
          question: userMsg.content,
          metrics: stats ? {
            total_users: stats.total_users,
            total_bookings: stats.total_bookings,
            total_revenue: stats.total_revenue,
            active_bookings: stats.active_bookings,
            open_disputes: stats.open_disputes,
          } : {}
        }),
      });
      const data = await resp.json();
      const botMsg: ChatMessage = {
        role: 'assistant',
        content: data.content,
        id: `bot-${Date.now()}`,
      };
      setChatMessages(prev => [...prev, botMsg]);
      addLog('✓ Jarvis response received.');
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I am unable to connect to my knowledge base at this time. Please try again.',
        id: `bot-err-${Date.now()}`,
      }]);
      addLog('✗ Gemini API error during chat.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const alertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={12} className="text-yellow-400 shrink-0" />;
      case 'success': return <CheckCircle size={12} className="text-emerald-400 shrink-0" />;
      case 'info': return <Info size={12} className="text-blue-400 shrink-0" />;
      case 'error': return <AlertTriangle size={12} className="text-red-400 shrink-0" />;
    }
  };

  const toggleMode = () => setMode(prev => prev === 'compact' ? 'expanded' : 'compact');

  return (
    <>
      {/* ─── Floating Toggle Button ──────────────── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[1200] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer border border-[#C9A96E]/40"
        style={{
          background: 'linear-gradient(135deg, rgba(201, 169, 110, 0.15), rgba(15, 15, 15, 0.95))',
          backdropFilter: 'blur(16px)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X size={20} className="text-[#C9A96E]" />
        ) : (
          <div className="relative">
            <Cpu size={20} className="text-[#C9A96E]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </motion.button>

      {/* ─── AIOps Panel ──────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-[1200] w-[400px] max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-[#C9A96E]/20 flex flex-col"
            style={{
              background: 'linear-gradient(160deg, rgba(20, 20, 20, 0.92), rgba(10, 10, 10, 0.96))',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="shrink-0 px-5 py-4 border-b border-[#C9A96E]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C9A96E]/10 border border-[#C9A96E]/30">
                  <Cpu size={16} className="text-[#C9A96E]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#E8E8E8] font-mono tracking-wider">JARVIS</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${systemStatus === 'online' ? 'bg-emerald-400' : 'bg-yellow-400'} animate-pulse`} />
                    <span className="text-[9px] font-mono text-[#8C8C8C] uppercase tracking-wider">
                      {systemStatus === 'online' ? 'All Systems Nominal' : 'Degraded'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMode}
                  className="p-2 rounded-lg hover:bg-white/5 text-[#8C8C8C] hover:text-[#C9A96E] transition-colors cursor-pointer"
                  title={mode === 'compact' ? 'Expand' : 'Compact'}
                >
                  {mode === 'compact' ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-[#8C8C8C] hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto scroll-rail space-y-4 p-5 text-xs font-mono" style={{ maxHeight: '55vh' }}>
              {/* System Log */}
              <div className="space-y-1">
                <span className="text-[9px] text-[#8C8C8C] uppercase tracking-widest font-bold">System Log</span>
                <div className="bg-black/40 rounded-lg p-3 space-y-1 max-h-24 overflow-y-auto border border-white/5">
                  {logLines.slice(-5).map((line, i) => (
                    <p key={i} className="text-[10px] text-[#8C8C8C] leading-relaxed font-mono">
                      <span className="text-[#C9A96E]/60">[{new Date().toLocaleTimeString()}]</span> {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Status Briefing */}
              {(briefing || isTyping) && (
                <div className="bg-[#C9A96E]/5 border border-[#C9A96E]/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-[#C9A96E]" />
                    <span className="text-[9px] text-[#C9A96E] uppercase tracking-widest font-bold">Status Briefing</span>
                    {isTyping && (
                      <span className="flex gap-0.5 ml-1">
                        <span className="w-1 h-1 rounded-full bg-[#C9A96E] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 rounded-full bg-[#C9A96E] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 rounded-full bg-[#C9A96E] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#E8E8E8] leading-relaxed font-mono">
                    {displayedBriefing}
                    {isTyping && <span className="animate-pulse text-[#C9A96E]">▌</span>}
                  </p>
                </div>
              )}

              {/* KPI Mini-grid */}
              {stats && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Users', val: stats.total_users.toLocaleString() },
                    { label: 'Active', val: stats.active_bookings.toString() },
                    { label: 'Revenue', val: `₹${(stats.total_revenue / 1000).toFixed(1)}k` },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-black/30 rounded-lg p-2.5 text-center border border-white/5">
                      <span className="text-[8px] text-[#8C8C8C] uppercase tracking-wider block">{kpi.label}</span>
                      <span className="text-sm font-bold text-[#E8E8E8] font-mono">{kpi.val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Alert Feed */}
              {alerts.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] text-[#8C8C8C] uppercase tracking-widest font-bold">
                    Alert Feed ({alerts.length})
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    <AnimatePresence>
                      {alerts.slice(0, 15).map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-start gap-2 p-2 rounded bg-black/30 border border-white/5"
                        >
                          {alertIcon(alert.type)}
                          <span className="text-[10px] text-[#E8E8E8] leading-relaxed">{alert.message}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Chat Messages (visible in expanded mode) */}
              {mode === 'expanded' && (
                <div className="space-y-1">
                  <span className="text-[9px] text-[#8C8C8C] uppercase tracking-widest font-bold">Conversation</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-[11px] leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-[#C9A96E]/15 text-[#E8E8E8] border border-[#C9A96E]/20'
                              : 'bg-black/40 text-[#D0D0D0] border border-white/5'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex gap-2">
                        <div className="bg-black/40 rounded-lg px-3 py-2 border border-white/5">
                          <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>
              )}

              {/* Polling Status */}
              {activePolls.length > 0 && (
                <div className="flex items-center gap-2 text-[9px] text-[#8C8C8C]">
                  <Activity size={10} className="text-emerald-400" />
                  <span className="font-mono">
                    Monitors: {activePolls.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' · ')}
                  </span>
                  <span className="ml-auto text-[#C9A96E]/60">30s cycle</span>
                </div>
              )}
            </div>

            {/* ─── Ask AIOps Input ──────────────────── */}
            <div className="shrink-0 px-5 py-3 border-t border-[#C9A96E]/20">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AIOps..."
                    disabled={isChatLoading}
                    className="w-full h-10 pl-4 pr-10 text-xs font-mono bg-black/40 border border-[#C9A96E]/20 rounded-lg outline-none focus:border-[#C9A96E]/50 text-[#E8E8E8] placeholder-[#8C8C8C] transition-colors disabled:opacity-50"
                  />
                  {isChatLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <RefreshCcw size={14} className="text-[#C9A96E] animate-spin" />
                    </div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 w-10 rounded-lg flex items-center justify-center bg-[#C9A96E]/20 border border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Send size={14} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
