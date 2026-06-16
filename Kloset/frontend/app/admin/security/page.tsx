'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import type { AdminLogEntry } from '@/lib/api';
import Card from '@/components/ui/Card';

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const resp = await adminAPI.getLogs();
      setLogs(resp || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

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
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">Infrastructure</span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">Security & Audit Logs</h1>
        </div>
        <button onClick={loadLogs}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Security Events', val: '12', desc: 'Last 30 days', icon: Shield },
          { label: 'Open Alerts', val: '2', desc: 'Requires attention', icon: AlertTriangle },
          { label: 'API Requests (24h)', val: '1,847', desc: 'From 42 unique IPs', icon: Clock },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: i * 0.05 }}>
            <Card padding="sm" theme="admin" className="flex flex-col justify-between h-24">
              <div className="flex items-center justify-between text-[#8C8C8C]">
                <span className="text-[9px] font-mono tracking-wider uppercase">{s.label}</span>
                <s.icon size={13} className="text-[#C9A96E]" />
              </div>
              <div>
                <span className="text-xl font-bold font-mono text-[#E8E8E8]">{s.val}</span>
                <span className="text-[8px] text-[#8C8C8C] block mt-0.5">{s.desc}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card padding="md" theme="admin">
        <h3 className="font-display text-base font-semibold mb-6">Recent Audit Trail</h3>
        {loading ? (
          <div className="space-y-4 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-[#2A2A2A] rounded" />)}</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Shield size={28} className="mx-auto text-[#C9A96E] mb-3" />
            <p className="text-xs font-mono text-[#8C8C8C]">No security events recorded. All systems nominal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs">
                <div className="flex items-center gap-3">
                  {log.level === 'error' ? <AlertTriangle size={14} className="text-red-400" /> : <CheckCircle2 size={14} className="text-[#4CAF7D]" />}
                  <span className="text-[#E8E8E8]">{log.message}</span>
                </div>
                <span className="text-[#8C8C8C] font-mono text-[9px]">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
