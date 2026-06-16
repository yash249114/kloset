'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ChevronRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { WishlistSkeleton } from '@/components/ui/Skeleton';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { wishlist, fetchWishlist, removeFromWishlist, isLoading } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to access your wishlist.');
      router.push('/auth/login?redirect=/wishlist');
      return;
    }

    if (isAuthenticated) {
      const init = async () => { await fetchWishlist(); };
      init();
    }
  }, [isAuthenticated, authLoading]);

  const handleRemove = async (id: string, name: string) => {
    try {
      await removeFromWishlist(id);
      toast.success(`Removed from wishlist: ${name}`);
    } catch {
      toast.error('Failed to update wishlist registry.');
    }
  };

  const handleAddToCart = (outfit: { id: string; title: string; price_3day?: number | null; security_deposit?: number | null; sizes?: string[]; images?: Array<{ url: string }>; seller_id: string; seller?: { name: string } }) => {
    const mainImg = outfit.images?.[0]?.url || '';
    addItem({
      id: outfit.id,
      title: outfit.title,
      price: outfit.price_3day || 1500, // Fallback rate
      deposit: outfit.security_deposit || 2000,
      size: outfit.sizes?.[0] || 'M',
      startDate: new Date().toISOString().substring(0, 10), // Today
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // +3 days
      image: mainImg,
      sellerId: outfit.seller_id,
      sellerName: outfit.seller?.name || 'Partner Host',
    });
    toast.success('Added to Cart Drawer');
  };

  if (authLoading || isLoading) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none text-left">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-charcoal-light mb-6">
          <Link href="/profile" className="hover:text-charcoal transition-colors">Account Studio</Link>
          <ChevronRight size={10} />
          <span className="text-champagne">Wishlist Registry</span>
        </div>

        {/* Title */}
        <div className="mb-10 text-left">
          <span className="text-xs font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
            Personal Curated Collection
          </span>
          <h1 className="text-3xl font-display font-medium text-charcoal">
            My Couture Wishlist
          </h1>
          <p className="text-xs text-charcoal-light font-mono mt-1">
            Save designs, monitor approvals, and rent immediately when available.
          </p>
        </div>

        {/* Wishlist Grid */}
        {wishlist.length === 0 ? (
          <Card hoverEffect={false} padding="lg" className="bg-white border-border text-center py-16">
            <Heart size={32} className="mx-auto text-champagne mb-4 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal">Wishlist is Empty</h3>
            <p className="text-[10px] font-mono text-charcoal-light/70 mt-1 max-w-sm mx-auto font-light">
              Tap the heart icon on any outfit catalog to save it to your personal workspace.
            </p>
            <Link href="/discover" className="btn btn-primary h-[52px] px-8 text-xs font-mono uppercase tracking-widest inline-flex items-center justify-center mt-6">
              Browse Collections
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlist.map((outfit) => {
                const primaryImage = outfit.images?.[0]?.url || '';
                return (
                  <motion.div
                    key={outfit.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <Card hoverEffect className="bg-white border-border h-full flex flex-col justify-between overflow-hidden relative group">
                      
                      {/* Image container */}
                      <div className="aspect-[3/4] relative w-full overflow-hidden bg-ivory-dark border-b border-border">
                        {primaryImage ? (
                          <motion.img 
                            src={primaryImage} 
                            alt={outfit.title} 
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-charcoal-light/40">No Image</div>
                        )}

                        <div className="absolute top-3 left-3">
                          <Badge variant="gold" className="capitalize">
                            {outfit.category}
                          </Badge>
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                            <Link 
                              href={`/outfit/${outfit.id}`}
                              className="p-3 bg-white text-charcoal hover:bg-champagne hover:text-white rounded-full transition-colors flex items-center justify-center"
                              title="View Garment Detail"
                            >
                              <Eye size={16} />
                            </Link>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                            <button
                              onClick={() => handleRemove(outfit.id, outfit.title)}
                              className="p-3 bg-white text-error hover:bg-error hover:text-white rounded-full transition-colors cursor-pointer flex items-center justify-center"
                              title="Remove from wishlist"
                            >
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-mono text-charcoal-light truncate block mb-1">
                            {outfit.seller?.name || 'Partner Host'}
                          </h4>
                          <h3 className="text-sm font-semibold text-charcoal tracking-wide line-clamp-1">
                            {outfit.title}
                          </h3>
                        </div>

                        <div>
                          <div className="flex items-center justify-between border-t border-border/60 pt-3">
                            <div>
                              <span className="text-[8px] font-mono text-charcoal-light/70 uppercase block">3-day rental</span>
                              <span className="text-xs font-mono font-bold text-charcoal">
                                ₹{(outfit.price_3day || 0).toLocaleString()}
                              </span>
                            </div>
                            
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleAddToCart(outfit)}
                              className="h-[38px] px-3 text-[10px] uppercase font-mono font-bold border-border/80 hover:border-champagne cursor-pointer"
                            >
                              <ShoppingCart size={11} className="mr-1" /> Rent
                            </Button>
                          </div>
                        </div>
                      </div>

                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
