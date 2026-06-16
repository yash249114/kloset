'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, Calendar, Tag, Percent, ArrowRight } from 'lucide-react';
import { useCartStore, calculateRentalDays } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import { Z_INDEX } from '@/lib/constants';

export default function CartDrawer() {
  const {
    cartItems,
    couponCode,
    discountPercentage,
    removeItem,
    updateItemDates,
    updateItemSize,
    updateItemQuantity,
    applyCoupon,
    removeCoupon,
    getCalculations,
  } = useCartStore();

  const cartOpen = useUIStore((s) => s.cartOpen);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (couponCode) {
        setCouponInput(couponCode);
        setCouponSuccess(true);
      } else {
        setCouponInput('');
        setCouponSuccess(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [couponCode]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const success = applyCoupon(couponInput);
    if (success) {
      setCouponSuccess(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon. Try KLOSETGOLD or FIRSTRENT');
      setCouponSuccess(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponSuccess(false);
    setCouponError('');
  };

  const calculations = getCalculations();
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <Drawer
      isOpen={cartOpen}
      onClose={() => setCartOpen(false)}
      title="Shopping Cart"
      zIndex={Z_INDEX.DRAWER}
      maxWidth="480px"
    >
      <div className="flex flex-col h-full font-sans select-none text-charcoal">
        
        {/* Items lists */}
        <div className="flex-1 space-y-6 pb-6 scroll-rail">
          {cartItems.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-ivory-dark flex items-center justify-center text-champagne mb-2 border border-border">
                <ShoppingBag size={22} />
              </div>
              <h3 className="font-display text-lg font-bold">Your cart is empty</h3>
              <p className="text-xs text-charcoal-light max-w-xs leading-relaxed font-light">
                Explore our couture catalog to rent your perfect designer look.
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="btn btn-gold !h-[52px] px-6 text-[10px] font-mono tracking-widest uppercase mt-2 cursor-pointer"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const rentalDays = calculateRentalDays(item.startDate, item.endDate);

              return (
                <div
                  key={`${item.id}-${item.size}`}
                  className="bg-white border border-border p-4 rounded-lg flex gap-4 relative hover:shadow-sm transition-all text-left"
                >
                  {/* Media */}
                  <div className="w-16 h-20 relative rounded overflow-hidden bg-ivory-dark flex-shrink-0 border border-border">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Details content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-display text-xs font-bold truncate max-w-[180px] text-charcoal">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="text-charcoal-light hover:text-error transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {item.sellerName && (
                        <span className="text-[8px] font-mono text-champagne uppercase font-bold tracking-widest block mt-0.5">
                          Host: {item.sellerName}
                        </span>
                      )}

                      {/* Dropdown controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-charcoal-light font-mono">Size:</span>
                          <select
                            value={item.size}
                            onChange={(e) => updateItemSize(item.id, item.size, e.target.value)}
                            className="bg-ivory border border-border text-[9px] rounded px-1 py-0.5 font-mono text-charcoal font-bold focus:outline-none"
                          >
                            {sizes.map((sz) => (
                              <option key={sz} value={sz}>
                                {sz}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Count */}
                        <div className="flex items-center gap-1.5 border border-border rounded px-1.5 py-0.5 bg-ivory">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.size, item.quantity - 1)}
                            className="text-charcoal-light hover:text-champagne font-bold text-[9px] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-[9px] font-mono font-bold text-charcoal w-3 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.size, item.quantity + 1)}
                            className="text-charcoal-light hover:text-champagne font-bold text-[9px] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Date select picker */}
                    <div className="mt-3 bg-ivory/50 p-2 rounded border border-border/40 space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] text-charcoal-light font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} className="text-champagne" />
                          Rental Days:
                        </span>
                        <span className="font-bold text-champagne">
                          {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[7px] text-charcoal-light uppercase font-mono tracking-wider block mb-0.5">Start</span>
                          <input
                            type="date"
                            value={item.startDate}
                            onChange={(e) => updateItemDates(item.id, item.size, e.target.value, item.endDate)}
                            className="bg-white border border-border text-[9px] rounded px-1 py-0.5 font-mono text-charcoal w-full focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[7px] text-charcoal-light uppercase font-mono tracking-wider block mb-0.5">End</span>
                          <input
                            type="date"
                            value={item.endDate}
                            onChange={(e) => updateItemDates(item.id, item.size, item.startDate, e.target.value)}
                            className="bg-white border border-border text-[9px] rounded px-1 py-0.5 font-mono text-charcoal w-full focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cost summary line */}
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] font-mono text-charcoal-light">
                      <span>₹{item.price}/day × {item.quantity} qty</span>
                      <strong className="text-champagne text-xs font-bold">
                        ₹{(item.price * rentalDays * item.quantity).toLocaleString('en-IN')}
                      </strong>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer computations panel */}
        {cartItems.length > 0 && (
          <div className="border-t border-border pt-4 bg-white space-y-4">
            
            {/* Coupon Application Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-light" size={12} />
                <input
                  type="text"
                  placeholder="Coupon: KLOSETGOLD"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  disabled={couponSuccess}
                  className="w-full h-[52px] border border-border rounded pl-9 pr-3 text-xs focus:outline-none focus:border-champagne uppercase font-mono tracking-wider"
                />
              </div>
              {couponSuccess ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveCoupon}
                  className="!h-[52px] !px-4 text-xs font-mono tracking-widest uppercase cursor-pointer"
                >
                  Remove
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="gold"
                  className="!h-[52px] !px-4 text-xs font-mono tracking-widest uppercase cursor-pointer"
                >
                  Apply
                </Button>
              )}
            </form>
            
            {couponError && (
              <span className="text-[9px] font-mono text-error uppercase tracking-wider block text-left">
                {couponError}
              </span>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-charcoal-light border-b border-border/50 pb-4">
              <div className="flex justify-between">
                <span>Rental Subtotal</span>
                <span className="font-mono">₹{calculations.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-success">
                  <span className="flex items-center gap-1">
                    <Percent size={12} /> Discount Applied ({discountPercentage}%)
                  </span>
                  <span className="font-mono">-₹{calculations.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Escrow Security Deposit</span>
                <span className="font-mono">₹{calculations.securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Commission Rate (5%)</span>
                <span className="font-mono">₹{calculations.platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Tax Rate (8%)</span>
                <span className="font-mono">₹{calculations.tax}</span>
              </div>
              <div className="flex justify-between">
                <span>Flat Shipping Logistics</span>
                <span className="font-mono">₹{calculations.shippingFee}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-sm font-display font-semibold">Total Payout</span>
              <span className="text-xl font-display font-bold text-champagne">
                ₹{calculations.total.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/booking/checkout"
              onClick={() => setCartOpen(false)}
              className="btn btn-gold w-full text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-2 mt-4"
            >
              Checkout Session <ArrowRight size={14} />
            </Link>

          </div>
        )}

      </div>
    </Drawer>
  );
}
