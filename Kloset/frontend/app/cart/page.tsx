'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, calculateRentalDays } from '@/store/useCartStore';
import Button from '@/components/ui/Button';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function CartPage() {
  const { cartItems, removeItem, getCalculations } = useCartStore();
  const calculations = getCalculations();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <ShoppingBag size={48} className="mx-auto text-charcoal-light" />
          <h1 className="text-2xl font-display font-medium text-charcoal">Your cart is empty</h1>
          <p className="text-sm text-charcoal-light">Browse our collection to find your perfect outfit</p>
          <Link href="/discover">
            <Button variant="primary" className="mt-4">
              Discover Outfits <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="space-y-8"
      >
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">
            Shopping Bag
          </span>
          <h1 className="text-3xl font-display font-medium text-charcoal mt-1">
            Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="space-y-4">
          {cartItems.map((item) => {
            const days = calculateRentalDays(item.startDate, item.endDate);
            return (
              <motion.div
                key={`${item.id}-${item.size}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4 p-4 bg-white border border-border rounded-xl"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-charcoal truncate">{item.title}</h3>
                  <p className="text-xs text-charcoal-light mt-1">Size: {item.size}</p>
                  <p className="text-xs text-charcoal-light">
                    {item.startDate} to {item.endDate} ({days} {days === 1 ? 'day' : 'days'})
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono font-bold text-charcoal">
                      ₹{(item.price * days * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-charcoal">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal-light">Subtotal</span>
              <span className="font-mono">₹{calculations.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-light">Security Deposit</span>
              <span className="font-mono">₹{calculations.securityDeposit.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-light">Platform Fee</span>
              <span className="font-mono">₹{calculations.platformFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-light">Tax</span>
              <span className="font-mono">₹{calculations.tax.toLocaleString('en-IN')}</span>
            </div>
            {calculations.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-mono">-₹{calculations.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between font-bold text-charcoal">
                <span>Total</span>
                <span className="font-mono">₹{calculations.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          <Link href="/booking/checkout">
            <Button variant="primary" className="w-full mt-4">
              Proceed to Checkout <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
