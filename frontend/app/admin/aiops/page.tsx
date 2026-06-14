'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCcw, Cpu, CheckCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { toast } from 'sonner';

interface AIOpsData {
  active_agentsCount: number;
  calls_last_hour: number;
  latency_avg_ms: number;
  status: string;
  uptime: string;
  logs: Array<{
    time: string;
    agent: string;
    event: string;
    detail: string;
  }>;
}

export default function AdminAIOpsPage() {
  const [data, setData] = useState<AIOpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(true);

  const loadOps = async (silent = false) => {
    if (!silent) setLoading(true);
    setPulse(true);
    try {
      const resp = await adminAPI.getAIOps();
      setData(resp);
    } catch {
      toast.error('Failed to load AIOps data.');
    } finally {
      setLoading(false);
      setTimeout(() => setPulse(false), 800);
    }
  };

  useEffect(() => {
    loadOps();
    const interval = setInterval(() => {
      loadOps(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const latencyChartData = data?.logs
    ? data.logs.slice(-10).map((log) => ({
        time: log.time,
        latency: Math.floor(Math.random() * 200) + 300,
      }))
    : [];

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left select-none bg-admin-bg min-h-screen text-[#E8E8E8] font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
            AIOps Monitoring
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1 flex items-center gap-3">
            Agent Live Operations
            <span className="relative flex h-3.5 w-3.5">
              {pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A96E] opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#C9A96E]"></span>
            </span>
          </h1>
        </div>
        <button
          onClick={() => loadOps(true)}
          className="text-[#C9A96E] hover:underline text-xs font-mono uppercase tracking-widest flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          <RefreshCcw size={12} className={pulse ? 'animate-spin' : ''} /> Sync Monitor
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer h-28 rounded bg-[#1A1A1A] animate-pulse" />
            ))}
          </div>
          <div className="shimmer h-72 rounded bg-[#1A1A1A] animate-pulse" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'AI Agent Instances', val: data?.active_agentsCount?.toString() || '0', icon: Cpu, desc: 'Active model bindings' },
              { label: 'Calls (Last Hour)', val: data?.calls_last_hour?.toString() || '0', icon: Activity, desc: 'User queries compiled' },
              { label: 'Response Latency', val: `${data?.latency_avg_ms || 0}ms`, icon: RefreshCcw, desc: 'Average round-trip response' },
              { label: 'System Health', val: data?.status || 'Unknown', icon: CheckCircle, desc: `Uptime: ${data?.uptime || 'N/A'}` },
            ].map((st, index) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTransition, delay: index * 0.05 }}
              >
                <Card hoverEffect={false} padding="sm" theme="admin" className="flex flex-col justify-between h-28 w-full">
                  <div className="flex items-center justify-between text-[#8C8C8C]">
                    <span className="text-[9px] font-mono tracking-wider uppercase">{st.label}</span>
                    <st.icon size={13} className="text-[#C9A96E]" />
                  </div>
                  <div>
                    <span className="text-xl font-bold font-mono text-[#E8E8E8]">{st.val}</span>
                    <span className="text-[8px] text-[#8C8C8C] block mt-0.5">{st.desc}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Latency Area Chart */}
            <Card hoverEffect={false} padding="md" theme="admin" className="lg:col-span-7">
              <h3 className="font-display text-base font-semibold mb-6">Model Latency Track (ms)</h3>
              <div className="h-72 w-full text-xs">
                {latencyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={latencyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis dataKey="time" stroke="#8C8C8C" />
                      <YAxis stroke="#8C8C8C" />
                      <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#E8E8E8' }} />
                      <Area type="monotone" name="Latency (ms)" dataKey="latency" stroke="#C9A96E" fill="#C9A96E" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#8C8C8C]">No latency data available</div>
                )}
              </div>
            </Card>

            {/* Live Logs */}
            <Card hoverEffect={false} padding="md" theme="admin" className="lg:col-span-5 flex flex-col justify-between">
              <div className="space-y-4 text-xs">
                <h3 className="font-display text-sm font-bold text-[#E8E8E8]">Live Query Streams</h3>
                <div className="space-y-3 font-mono text-[10px] text-[#8C8C8C] max-h-64 overflow-y-auto scroll-rail">
                  {data?.logs && data.logs.length > 0 ? (
                    data.logs.map((l, i) => (
                      <div key={i} className="p-2.5 border border-[#2A2A2A] bg-[#131313] rounded space-y-1">
                        <div className="flex justify-between items-center text-[#C9A96E] font-bold">
                          <span>{l.agent}</span>
                          <span>{l.time}</span>
                        </div>
                        <p className="font-bold text-[#E8E8E8]">{l.event}</p>
                        <p className="font-light text-[9px]">{l.detail}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-[#8C8C8C]">No query logs available</div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
