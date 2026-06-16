'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Package, RefreshCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { inventoryAPI, outfitsAPI } from '@/lib/api';
import type { InventoryItem, Outfit } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  available: { color: 'text-success', bg: 'bg-success/10', label: 'Available' },
  reserved: { color: 'text-champagne', bg: 'bg-champagne/10', label: 'Reserved' },
  rented: { color: 'text-rose-gold', bg: 'bg-rose-gold/10', label: 'Rented' },
  maintenance: { color: 'text-charcoal-light', bg: 'bg-charcoal/5', label: 'Maintenance' },
};

export default function SellerInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [invResp, outfitsResp] = await Promise.all([
        inventoryAPI.list(),
        outfitsAPI.getSellerOutfits(1),
      ]);
      setInventory(invResp);
      setOutfits(outfitsResp.outfits || []);
    } catch {
      toast.error('Failed to load inventory data.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => { await loadData(); };
    init();
  }, []);

  const handleUpdateQuantity = async (outfitId: string) => {
    if (editQuantity < 0) { toast.error('Quantity cannot be negative.'); return; }
    setSaving(true);
    try {
      await inventoryAPI.update(outfitId, { total_quantity: editQuantity });
      toast.success('Inventory updated successfully.');
      setEditingId(null);
      loadData(true);
    } catch { toast.error('Failed to update inventory.'); }
    finally { setSaving(false); }
  };

  const getOutfitTitle = (outfitId: string) => {
    return outfits.find((o) => o.id === outfitId)?.title || 'Unknown Design';
  };

  const getOutfitImage = (outfitId: string) => {
    const outfit = outfits.find((o) => o.id === outfitId);
    return outfit?.images?.[0]?.url || '/placeholder-outfit.jpg';
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse select-none text-left">
        <div className="h-10 bg-ivory-dark w-1/4 rounded mb-8" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white border border-border rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Wardrobe Management</span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Inventory</h1>
        </div>
        <button onClick={() => loadData(true)}
          className="text-xs font-mono uppercase tracking-wider text-champagne hover:text-charcoal transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0">
          <RefreshCcw size={12} /> Sync
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available', val: inventory.filter((i) => i.status === 'available').reduce((s, i) => s + i.quantity_available, 0), icon: CheckCircle, color: 'text-success' },
          { label: 'Reserved', val: inventory.filter((i) => i.status === 'reserved').reduce((s, i) => s + i.quantity_reserved, 0), icon: Package, color: 'text-champagne' },
          { label: 'Rented', val: inventory.filter((i) => i.status === 'rented').reduce((s, i) => s + i.quantity_rented, 0), icon: Package, color: 'text-rose-gold' },
          { label: 'Maintenance', val: inventory.filter((i) => i.status === 'maintenance').reduce((s, i) => s + i.quantity_maintenance, 0), icon: AlertTriangle, color: 'text-charcoal-light' },
        ].map((st, index) => (
          <motion.div key={st.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: index * 0.05 }}>
            <Card hoverEffect={true} padding="sm" className="bg-white border-border flex flex-col justify-between h-24 w-full">
              <div className="flex items-center justify-between text-charcoal-light">
                <span className="text-[10px] font-mono tracking-wider uppercase">{st.label}</span>
                <st.icon size={14} className={st.color} />
              </div>
              <span className="text-2xl font-bold text-charcoal">{st.val}</span>
            </Card>
          </motion.div>
        ))}
      </div>

      {inventory.length === 0 ? (
        <Card hoverEffect={false} padding="lg" className="bg-white border-border text-center space-y-4">
          <Package size={36} className="text-champagne mx-auto animate-pulse" />
          <h3 className="font-display text-lg font-bold">No inventory tracked</h3>
          <p className="text-xs text-charcoal-light leading-relaxed max-w-sm mx-auto font-light">
            Inventory tracking helps you manage stock levels across available, rented, and maintenance states.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {inventory.map((item, index) => {
            const statusKey = item.status || 'available';
            const st = STATUS_CONFIG[statusKey] || STATUS_CONFIG.available;
            const isEditing = editingId === item.outfit_id;

            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: index * 0.03 }}>
                <Card hoverEffect={false} padding="md" className="bg-white border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-16 rounded overflow-hidden bg-ivory-dark border border-border flex-shrink-0">
                      <Image src={getOutfitImage(item.outfit_id)} alt={getOutfitTitle(item.outfit_id)} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-display text-sm font-semibold text-charcoal truncate">{getOutfitTitle(item.outfit_id)}</h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[9px] font-mono text-charcoal-light">Total: {item.total_quantity}</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Input type="number" min={0} value={editQuantity}
                        onChange={(e) => setEditQuantity(Number(e.target.value))}
                        className="!w-24 !h-[44px]" />
                      <Button variant="primary" isLoading={saving} onClick={() => handleUpdateQuantity(item.outfit_id)}
                        className="!h-[44px] text-[10px] px-4 cursor-pointer">Save</Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)}
                        className="!h-[44px] text-[10px] px-3 cursor-pointer">Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex gap-4 items-center w-full sm:w-auto">
                      <div className="grid grid-cols-3 gap-3 text-center text-[10px] font-mono">
                        <div><span className="block text-success font-bold">{item.quantity_available}</span><span className="text-charcoal-light">Avail</span></div>
                        <div><span className="block text-champagne font-bold">{item.quantity_reserved}</span><span className="text-charcoal-light">Resv</span></div>
                        <div><span className="block text-rose-gold font-bold">{item.quantity_rented}</span><span className="text-charcoal-light">Rented</span></div>
                      </div>
                      <Button variant="outline" onClick={() => { setEditingId(item.outfit_id); setEditQuantity(item.total_quantity); }}
                        className="!h-[44px] text-[10px] px-4 cursor-pointer">Edit</Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
