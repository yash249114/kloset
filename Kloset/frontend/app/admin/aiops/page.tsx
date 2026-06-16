'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCcw, Cpu, CheckCircle, AlertTriangle, Zap, Clock, BarChart3, AlertOctagon, ShieldAlert, Server } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
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

const mockAlerts = [
  { id: 'a1', level: 'critical', agent: 'KYC-Agent', message: 'Seller verification queue overflow — 12 pending > SLA', time: '8m ago', metric: 'Queue: 12' },
  { id: 'a2', level: 'warning', agent: 'Search-Engine', message: 'P99 latency > 600ms for past 5 min window', time: '22m ago', metric: '619ms p99' },
  { id: 'a3', level: 'warning', agent: 'Escrow-Svc', message: 'Dispute resolution > 48h pending: 3 open cases', time: '35m ago', metric: '3 cases' },
  { id: 'a4', level: 'info', agent: 'Stylist-AI', message: 'New trend vector detected: pastels +20% queries', time: '1h ago', metric: '+20%' },
  { id: 'a5', level: 'critical', agent: 'Booking-Worker', message: 'Pickup overdue flag on 5 bookings', time: '1h ago', metric: '5 overdue' },
];

const mockIncidents = [
  { id: 'i1', status: 'resolved', agent: 'Stylist-AI', event: 'Latency spike 1200ms', time: '10m ago', duration: '4m 12s', resolution: 'Auto-scaled 2 replicas' },
  { id: 'i2', status: 'investigating', agent: 'Recommend-1', event: 'Recommendation timeout > 3%', time: '42m ago', duration: 'ongoing', resolution: 'Root cause analysis' },
  { id: 'i3', status: 'monitoring', agent: 'Search-2', event: 'Cache miss ratio > 5%', time: '2h ago', duration: '12m', resolution: 'Warming cache' },
  { id: 'i4', status: 'resolved', agent: 'Payment-GW', event: 'Webhook delivery failure', time: '3h ago', duration: '2m 48s', resolution: 'Retry mechanism fixed' },
  { id: 'i5', status: 'monitoring', agent: 'Auth-Svc', event: 'Elevated 401 rate (>2%)', time: '4h ago', duration: '—', resolution: 'Monitoring token refresh' },
];

function PriorityBadge({ level }: { level: string }) {
  const variants: Record<string, string> = {
    critical: 'bg-error/20 text-error border-error/50',
    warning: 'bg-champagne/15 text-champagne border-champagne/40',
    info: 'bg-[#C9A96E]/5 text-[#8C8C8C] border-[#2A2A2A]',
  };
  return (
    <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border font-bold ${variants[level] || variants.info}`}>
      {level}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    resolved: 'bg-success',
    investigating: 'bg-champagne',
    monitoring: 'bg-[#8C8C8C]',
  };
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || 'bg-[#8C8C8C]'}`} />;
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
    const interval = setInterval(() => loadOps(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const latencyChartData = data?.logs
    ? data.logs.slice(-10).map((log) => ({
        time: log.time,
        latency: data.latency_avg_ms || 0,
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
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
            AIOps Monitoring
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1 flex items-center gap-3">
            Agent Live Operations
            <span className="relative flex h-3.5 w-3.5">
              {pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A96E] opacity-75" />}
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#C9A96E]" />
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'AI Agent Instances', val: data?.active_agentsCount?.toString() || '0', icon: Cpu, desc: 'Active model bindings', sub: '4 clusters' },
              { label: 'Calls (Last Hour)', val: data?.calls_last_hour?.toString() || '0', icon: Activity, desc: 'User queries compiled', sub: '2.1k avg/min' },
              { label: 'Response Latency', val: `${data?.latency_avg_ms || 0}ms`, icon: Zap, desc: 'Average round-trip response', sub: data?.latency_avg_ms && data.latency_avg_ms > 400 ? '⚠ Elevated' : '✓ Normal' },
              { label: 'System Health', val: data?.status || 'Unknown', icon: Server, desc: `Uptime: ${data?.uptime || 'N/A'}`, sub: data?.status === 'healthy' ? 'All systems go' : 'Attention needed' },
            ].map((st, index) => (
              <motion.div key={st.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: index * 0.05 }}>
                <Card hoverEffect={true} padding="sm" theme="admin" className="flex flex-col justify-between h-28 w-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 rounded-full bg-[#C9A96E]/[0.03]" />
                  <div className="flex items-center justify-between text-[#8C8C8C] relative">
                    <span className="text-[9px] font-mono tracking-wider uppercase">{st.label}</span>
                    <st.icon size={13} className="text-[#C9A96E]" />
                  </div>
                  <div className="relative">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono text-[#E8E8E8]">{st.val}</span>
                      <span className="text-[8px] font-mono text-[#8C8C8C]">{st.sub}</span>
                    </div>
                    <span className="text-[8px] text-[#8C8C8C] block mt-0.5">{st.desc}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card hoverEffect={false} padding="md" theme="admin" className="lg:col-span-7">
              <h3 className="font-display text-sm font-bold mb-6 flex items-center gap-2">
                <BarChart3 size={14} className="text-[#C9A96E]" /> Model Latency Track (ms)
              </h3>
              <div className="h-72 w-full text-xs">
                {latencyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={latencyChartData}>
                      <defs>
                        <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis dataKey="time" stroke="#8C8C8C" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#8C8C8C" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#E8E8E8', borderRadius: '8px', fontSize: '12px' }} />
                      <Area type="monotone" name="Latency (ms)" dataKey="latency" stroke="#C9A96E" fill="url(#latencyGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#8C8C8C]">No latency data available</div>
                )}
              </div>
            </Card>

            <div className="lg:col-span-5 space-y-6">
              <Card hoverEffect={false} padding="md" theme="admin">
                <h3 className="font-display text-sm font-bold mb-4 flex items-center gap-2">
                  <AlertOctagon size={14} className="text-champagne" /> Active Alerts by Priority
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto scroll-rail">
                  {mockAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-[#2A2A2A] bg-[#131313] hover:bg-[#1A1A1A] transition-colors">
                      <PriorityBadge level={alert.level} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#E8E8E8]">{alert.agent}</span>
                          <span className="text-[8px] font-mono text-[#8C8C8C]">{alert.time}</span>
                        </div>
                        <p className="text-[10px] text-[#C9C9C9] leading-relaxed">{alert.message}</p>
                        <span className="text-[8px] font-mono text-champagne">{alert.metric}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card hoverEffect={false} padding="md" theme="admin">
                <h3 className="font-display text-sm font-bold mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-champagne" /> Incident Feed
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto scroll-rail">
                  {mockIncidents.map((inc) => (
                    <div key={inc.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-[#2A2A2A] bg-[#131313] hover:bg-[#1A1A1A] transition-colors">
                      <StatusDot status={inc.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-[#E8E8E8]">{inc.agent}</span>
                          <Badge variant={inc.status === 'resolved' ? 'sage' : inc.status === 'investigating' ? 'gold' : 'outline'} className="!text-[7px] !px-1 !py-0 !font-mono">
                            {inc.status}
                          </Badge>
                          <span className="text-[8px] font-mono text-[#8C8C8C] ml-auto">{inc.time}</span>
                        </div>
                        <p className="text-[10px] text-[#C9C9C9] leading-relaxed">{inc.event}</p>
                        <div className="flex gap-3 text-[8px] font-mono text-[#8C8C8C] mt-1">
                          <span>Duration: {inc.duration}</span>
                          <span>{inc.resolution}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <Card hoverEffect={false} padding="md" theme="admin">
            <h3 className="font-display text-sm font-bold mb-4 flex items-center gap-2">
              <Server size={14} className="text-[#C9A96E]" /> Live Query Streams
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10px]">
              {data?.logs && data.logs.length > 0 ? (
                data.logs.map((l, i) => (
                  <div key={i} className="p-3 border border-[#2A2A2A] bg-[#131313] rounded space-y-1">
                    <div className="flex justify-between items-center text-[#C9A96E] font-bold">
                      <span>{l.agent}</span>
                      <span className="text-[8px]">{l.time}</span>
                    </div>
                    <p className="font-bold text-[#E8E8E8]">{l.event}</p>
                    <p className="font-light text-[9px] text-[#8C8C8C]">{l.detail}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-[#8C8C8C]">No query logs available</div>
              )}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
}
