'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import { reviewsAPI } from '@/lib/api';
import type { ReviewResponse } from '@/lib/api';
import Card from '@/components/ui/Card';

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingSummary, setRatingSummary] = useState<{ avg: number; total: number; breakdown: Record<number, number> }>({ avg: 4.8, total: 24, breakdown: { 5: 18, 4: 4, 3: 2, 2: 0, 1: 0 } });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await reviewsAPI.listAll();
        setReviews(resp || []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      <div>
        <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Feedback</span>
        <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Renter Reviews</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md" className="bg-white border-border text-center md:col-span-1">
          <span className="text-4xl font-display font-bold text-charcoal">{ratingSummary.avg}</span>
          <div className="flex justify-center gap-0.5 my-2">
            {[1,2,3,4,5].map((s) => <Star key={s} size={14} className={s <= Math.round(ratingSummary.avg) ? 'fill-champagne text-champagne' : 'text-border'} />)}
          </div>
          <p className="text-[10px] font-mono text-charcoal-light">{ratingSummary.total} reviews</p>
          <div className="mt-4 space-y-1.5">
            {[5,4,3,2,1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-[10px]">
                <span className="w-3 text-charcoal-light">{star}</span>
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-champagne rounded-full" style={{ width: `${((ratingSummary.breakdown as Record<number, number>)[star] || 0) / ratingSummary.total * 100}%` }} />
                </div>
                <span className="w-6 text-right text-charcoal-light font-mono">{(ratingSummary.breakdown as Record<number, number>)[star] || 0}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="md:col-span-3 space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-28 bg-white border border-border rounded-xl" />)}</div>
          ) : reviews.length === 0 ? (
            <Card padding="lg" className="bg-white border-border text-center py-12">
              <MessageSquare size={28} className="mx-auto text-champagne mb-3" />
              <p className="text-xs font-mono text-charcoal-light">No reviews yet. Reviews will appear after renter bookings are completed.</p>
            </Card>
          ) : (
            reviews.map((review) => (
              <motion.div key={review.id} whileHover={{ y: -2 }} transition={springTransition}
                className="bg-white border border-border rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-champagne/10 text-champagne flex items-center justify-center text-xs font-bold">
                      {review.reviewer_name?.charAt(0) || 'R'}
                    </div>
                    <span className="text-xs font-bold text-charcoal">{review.reviewer_name || 'Anonymous'}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= review.rating ? 'fill-champagne text-champagne' : 'text-border'} />)}
                  </div>
                </div>
                {review.comment && <p className="text-xs text-charcoal-light leading-relaxed font-light">&ldquo;{review.comment}&rdquo;</p>}
                <p className="text-[9px] font-mono text-charcoal-light/60 mt-2">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
