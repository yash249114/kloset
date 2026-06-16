'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI, AdminKYCUser } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AdminKYCPage() {
  const [users, setUsers] = useState<AdminKYCUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadKYC = async () => {
    setLoading(true);
    try {
      const queue = await adminAPI.getKYCQueue();
      setUsers(queue);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      await loadKYC();
    }
    init();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await adminAPI.approveKYC(userId);
      toast.success('Seller credentials verified. KYC approved successfully.');
      loadKYC();
    } catch {
      toast.error('Failed to approve KYC.');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await adminAPI.rejectKYC(userId, 'Document checks failed.');
      toast.success('KYC submission rejected.');
      loadKYC();
    } catch {
      toast.error('Failed to reject KYC.');
    }
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left select-none bg-admin-bg min-h-screen text-[#E8E8E8] font-sans"
    >
      
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
          Operational Hub
        </span>
        <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">
          KYC Verify Queue
        </h1>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="shimmer h-40 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl" />
      ) : users.length === 0 ? (
        <p className="text-xs text-charcoal-light py-6 text-center font-light">Verification queue is empty.</p>
      ) : (
        <Card hoverEffect={false} padding="md" theme="admin">
          <h3 className="font-display text-base font-semibold mb-6">Pending KYC Submissions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2A2A2A] text-[9px] font-mono uppercase text-[#8C8C8C] tracking-wider">
                  <th className="pb-3 font-semibold">User details</th>
                  <th className="pb-3 font-semibold">Contact phone</th>
                  <th className="pb-3 font-semibold">Submitted timeline</th>
                  <th className="pb-3 font-semibold">Doc Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1C1C1C] transition-colors">
                    <td className="py-4">
                      <div>
                        <p className="font-bold text-[#E8E8E8]">{u.name}</p>
                        <span className="text-[#8C8C8C] text-[10px]">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 text-[#8C8C8C] font-mono">{u.phone}</td>
                    <td className="py-4 text-[#8C8C8C]">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-4">
                      <Badge variant="gold">{u.kyc_status}</Badge>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <Button
                        variant="gold"
                        onClick={() => handleApprove(u.id)}
                        className="!h-[52px] !px-4 text-[10px] font-mono tracking-wider uppercase cursor-pointer"
                      >
                        Approve
                      </Button>
                      <button
                        onClick={() => handleReject(u.id)}
                        className="h-[52px] px-4 border border-[#2A2A2A] hover:bg-error/10 hover:border-error/30 text-error rounded text-[10px] font-mono uppercase tracking-wider font-semibold cursor-pointer transition-colors"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </motion.div>
  );
}
