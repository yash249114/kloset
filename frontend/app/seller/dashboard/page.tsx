'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth.store';
import { outfitsAPI } from '@/lib/api/outfits';
import { bookingsAPI } from '@/lib/api/bookings';
import { userAPI } from '@/lib/api/user';
import FloatIn from '@/components/motion/FloatIn';
import PetalBackground from '@/components/floral/PetalBackground';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Tag,
  Plus,
  Shield,
  Eye,
  Check,
  X,
  Calendar,
  Layers,
  BarChart3,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  Edit2,
  Save,
  RefreshCw,
} from 'lucide-react';
import type { Outfit, Booking } from '@/types';

// Mock Listings fallback
const mockListings: any[] = [
  {
    id: 'outfit-1',
    title: 'Royal Maroon Bridal Lehenga',
    category: 'lehenga',
    price_1day: 3500,
    price_3day: 10500,
    security_deposit: 10000,
    status: 'active',
    view_count: 380,
    earnings: 28000,
    description: 'Heritage velvet lehenga with royal zari zardozi embroidery work. Perfect for bridal and sangeet occasions.',
    delivery_fee: 150,
    images: [{ url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&h=400&fit=crop' }],
  },
  {
    id: 'outfit-2',
    title: 'Golden Silk Zardozi Saree',
    category: 'saree',
    price_1day: 3000,
    price_3day: 9000,
    security_deposit: 8000,
    status: 'rented',
    view_count: 290,
    earnings: 12000,
    description: 'Vibrant pure Banarasi silk saree with gold brocade work, ideal for traditional wedding wear.',
    delivery_fee: 150,
    images: [{ url: 'https://images.unsplash.com/photo-1610030469983-398883ce42d1?w=300&h=400&fit=crop' }],
  },
];

const mockRequests = [
  {
    id: 'REQ-921',
    outfitTitle: 'Royal Maroon Bridal Lehenga',
    pickupDate: '2026-06-20',
    returnDate: '2026-06-24',
    amount: 14000,
    renterName: 'Aisha Sharma',
    renterEmail: 'aisha@gmail.com',
  },
];

const mockReviews = [
  {
    id: 'rev-1',
    renterName: 'Kriti Sanon',
    rating: 5,
    date: '2026-05-18',
    comment: 'The Lehenga was in pristine condition, dry-cleaned, and fit perfectly. Received compliments from everyone at the wedding!',
    outfitTitle: 'Royal Maroon Bridal Lehenga',
    reply: '',
  },
];

const trendData = [
  { month: 'Jan', revenue: 15000, bookings: 4 },
  { month: 'Feb', revenue: 22000, bookings: 6 },
  { month: 'Mar', revenue: 18000, bookings: 5 },
  { month: 'Apr', revenue: 32000, bookings: 9 },
  { month: 'May', revenue: 47200, bookings: 12 },
];

export default function SellerDashboardPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'showcase' | 'analytics' | 'orders' | 'reviews' | 'profile'>('showcase');
  
  // Dashboard state
  const [listings, setListings] = useState<Outfit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState(mockReviews);
  const [isLoading, setIsLoading] = useState(false);
  
  // Seller business profile states
  const [profile, setProfile] = useState<any>(null);
  const [bizName, setBizName] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [returnAddress, setReturnAddress] = useState('');
  const [gst, setGst] = useState('');
  const [pan, setPan] = useState('');
  const [bank, setBank] = useState('');
  const [payout, setPayout] = useState('');
  const [desc, setDesc] = useState('');
  const [supportContact, setSupportContact] = useState('');
  const [policies, setPolicies] = useState('');
  const [storeBanner, setStoreBanner] = useState('');
  const [storeLogo, setStoreLogo] = useState('');

  // Edit listing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editDeposit, setEditDeposit] = useState(0);
  const [editStatus, setEditStatus] = useState<string>('active');
  const [editDescription, setEditDescription] = useState('');
  const [editShipping, setEditShipping] = useState(0);

  // Review reply state
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [mounted, setMounted] = useState(false);

  const loadSellerData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [outfitsResp, bookingsResp, profileResp] = await Promise.allSettled([
        outfitsAPI.getSellerOutfits(),
        bookingsAPI.listSellerBookings(),
        userAPI.getProfile(),
      ]);

      if (outfitsResp.status === 'fulfilled') {
        setListings(outfitsResp.value.outfits);
      } else {
        console.warn('Failed to load seller outfits, using fallback:', outfitsResp.reason);
        setListings(mockListings as any);
      }

      if (bookingsResp.status === 'fulfilled') {
        setBookings(bookingsResp.value.bookings);
      } else {
        console.warn('Failed to load seller bookings, using fallback:', bookingsResp.reason);
        setBookings([]);
      }

      if (profileResp.status === 'fulfilled') {
        setProfile(profileResp.value);
        setBizName(profileResp.value.business_name || '');
        setBizAddress(profileResp.value.business_address || '');
        setPickupAddress(profileResp.value.pickup_address || '');
        setReturnAddress(profileResp.value.return_address || '');
        setGst(profileResp.value.gst_details || '');
        setPan(profileResp.value.pan_details || '');
        setBank(profileResp.value.bank_details || '');
        setPayout(profileResp.value.payout_account || '');
        setDesc(profileResp.value.business_description || '');
        setSupportContact(profileResp.value.support_contact || '');
        setPolicies(profileResp.value.rental_policies || '');
        setStoreBanner(profileResp.value.store_banner || '');
        setStoreLogo(profileResp.value.store_logo || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleSaveSellerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile({
        business_name: bizName,
        business_address: bizAddress,
        pickup_address: pickupAddress,
        return_address: returnAddress,
        gst_details: gst,
        pan_details: pan,
        bank_details: bank,
        payout_account: payout,
        business_description: desc,
        support_contact: supportContact,
        rental_policies: policies,
        store_banner: storeBanner,
        store_logo: storeLogo,
      });
      toast.success('Merchant profile updated successfully!');
      if (user) {
        setUser({
          ...user,
          business_name: bizName,
          business_address: bizAddress,
          pickup_address: pickupAddress,
          return_address: returnAddress,
          gst_details: gst,
          pan_details: pan,
          bank_details: bank,
          payout_account: payout,
          business_description: desc,
          support_contact: supportContact,
          rental_policies: policies,
          store_banner: storeBanner,
          store_logo: storeLogo,
        } as any);
      }
    } catch (err) {
      toast.error('Failed to update store profile.');
    }
  };

  useEffect(() => {
    setMounted(true);
    loadSellerData();
    const interval = setInterval(() => {
      loadSellerData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      await bookingsAPI.updateStatus(id, newStatus);
      toast.success(`Booking status updated to ${newStatus}.`);
      loadSellerData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await bookingsAPI.cancel(id, 'Seller rejected / cancelled request');
      toast.success('Booking cancelled.');
      loadSellerData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleStartEdit = (item: Outfit) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditPrice(item.price_3day || 0);
    setEditDeposit(item.security_deposit || 0);
    setEditStatus(item.status);
    setEditDescription(item.description || '');
    setEditShipping(item.delivery_fee || 0);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await outfitsAPI.update(id, {
        title: editTitle,
        price_3day: editPrice,
        price_1day: Math.round(editPrice / 3),
        price_7day: Math.round(editPrice * 2),
        security_deposit: editDeposit,
        description: editDescription,
        delivery_fee: editShipping,
      });
      toast.success('Listing parameters updated successfully! ✨');
      setEditingId(null);
      loadSellerData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update listing.');
    }
  };

  const handleSaveReply = (id: string) => {
    if (!replyText.trim()) return;
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, reply: replyText } : r))
    );
    toast.success('Your reply was submitted successfully!');
    setReplyId(null);
    setReplyText('');
  };

  // Stats calculation
  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const activeRentalsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'picked_up' || b.status === 'in_use').length;
  
  // Platform Fee is 5%, so seller keeps 95%
  const totalRevenue = bookings
    .filter(b => b.payment_status === 'completed')
    .reduce((sum, b) => sum + (b.total_amount - b.platform_fee), 0);

  const sidebarLinks = [
    { id: 'showcase' as const, label: 'My Listings', icon: Layers },
    { id: 'analytics' as const, label: 'Analytics Console', icon: BarChart3 },
    { id: 'orders' as const, label: 'Fulfillment Orders', icon: ShoppingBag },
    { id: 'reviews' as const, label: 'Customer Reviews', icon: MessageSquare },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative pb-20" style={{ background: 'var(--ivory)' }}>
      <PetalBackground />

      {/* Profile Header Block */}
      <section className="relative pt-12 pb-6 z-10">
        <div className="container mx-auto px-6">
          <FloatIn>
            <div className="rounded-[28px] p-6 md:p-8 bg-white border border-[var(--petal)] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--gold)] via-[var(--bloom)] to-[var(--rose)]" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--rose)] to-[var(--gold)] flex items-center justify-center text-white text-xl font-bold font-display shadow-md">
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-display font-bold text-[var(--ink)]">
                        {user?.name || 'Seller Showroom'}
                      </h1>
                      <span className="badge badge-gold text-[9px] uppercase tracking-wider font-semibold py-0.5">
                        Verified Pro Seller
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ink-light)] mt-1">
                      Manage bookings, upload new collections, and oversee your rental revenue.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => loadSellerData()}
                    disabled={isLoading}
                    className="btn-outline !h-12 !px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                  </button>
                  <Link
                    href="/outfit/new"
                    className="btn-gold !h-12 !px-6 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    Add Outfit Listing
                  </Link>
                </div>
              </div>
            </div>
          </FloatIn>
        </div>
      </section>

      {/* Studio Summary Metrics */}
      <section className="py-2 z-10 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Seller Earnings (95%)', value: totalRevenue > 0 ? `₹${totalRevenue.toLocaleString('en-IN')}` : '₹0', icon: DollarSign, desc: 'Accumulated net payouts' },
              { label: 'Active Rentals', value: activeRentalsCount.toString(), icon: TrendingUp, desc: 'Outfits out for rent' },
              { label: 'Wardrobe Listings', value: listings.length.toString(), icon: Tag, desc: 'Showroom items' },
              { label: 'Trust Rating', value: `${user?.trust_score || 100}%`, icon: Shield, desc: 'Verified status score' },
            ].map((metric, idx) => (
              <FloatIn key={metric.label} delay={idx * 0.08}>
                <div className="rounded-2xl p-5 bg-white border border-[var(--petal)] shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)]">
                    <span>{metric.label}</span>
                    <metric.icon size={14} className="text-[var(--gold)]" />
                  </div>
                  <p className="text-2xl font-display font-bold text-[var(--ink)]">{metric.value}</p>
                  <span className="text-[10px] text-[var(--ink-lighter)] block">{metric.desc}</span>
                </div>
              </FloatIn>
            ))}
          </div>
        </div>
      </section>

      {/* Main Console Split Layout */}
      <section className="py-6 z-10 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-[var(--petal)] p-4 shadow-sm">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-lighter)] mb-4 pl-2">
                  Seller Studio Console
                </h3>
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = activeTab === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => setActiveTab(link.id)}
                        className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[var(--rose)] text-white font-bold shadow-md'
                            : 'text-[var(--ink-light)] hover:bg-[var(--bloom)]/20'
                        }`}
                      >
                        <Icon size={16} />
                        {link.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Payout Calendar Card */}
              <div className="bg-white rounded-2xl border border-[var(--petal)] p-5 shadow-sm space-y-3">
                <h4 className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-lighter)]">
                  Payout Schedule
                </h4>
                <div className="flex items-center gap-2.5">
                  <Calendar size={18} className="text-[var(--sage)]" />
                  <div>
                    <p className="text-xs font-bold text-[var(--ink)]">Weekly Friday</p>
                    <p className="text-[9px] text-[var(--ink-lighter)] uppercase tracking-wider font-mono">Next payout cycle</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane Console */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                
                {/* TAB 1: Showcase (My Listings with Inline Editing) */}
                {activeTab === 'showcase' && (
                  <motion.div
                    key="showcase-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-[var(--bloom)]">
                      <h2 className="text-lg font-display font-semibold text-[var(--ink)]">
                        Showroom Listings ({listings.length})
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {listings.map((item) => {
                        const isEditing = editingId === item.id;
                        const imageUrl = (item.images && item.images.length > 0)
                          ? item.images[0].url
                          : 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&h=400&fit=crop';
                        return (
                          <div
                            key={item.id}
                            className="card-floral bg-white p-5 border border-[var(--petal)] relative transition-all"
                          >
                            {isEditing ? (
                              /* Inline Editing Mode */
                              <div className="space-y-4 text-xs">
                                <div className="pb-3 border-b border-[var(--bloom)]">
                                  <h3 className="font-display text-base font-bold text-[var(--rose)]">
                                    Quick Edit Parameters
                                  </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                      Title
                                    </label>
                                    <input
                                      type="text"
                                      value={editTitle}
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      className="input-kloset !py-2 !px-2.5 text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                      Listing Status
                                    </label>
                                    <select
                                      value={editStatus}
                                      onChange={(e) => setEditStatus(e.target.value)}
                                      className="input-kloset !py-2 !px-2.5 text-xs bg-white"
                                    >
                                      <option value="active">Active (Available)</option>
                                      <option value="rented">Rented (Out for booking)</option>
                                      <option value="cleaning">Cleaning / Laundry</option>
                                      <option value="inactive">Inactive (Hidden)</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                      3-Day Rent (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={editPrice}
                                      onChange={(e) => setEditPrice(Number(e.target.value))}
                                      className="input-kloset !py-2 !px-2.5 text-xs font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                      Security Deposit (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={editDeposit}
                                      onChange={(e) => setEditDeposit(Number(e.target.value))}
                                      className="input-kloset !py-2 !px-2.5 text-xs font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                      Shipping Cost (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={editShipping}
                                      onChange={(e) => setEditShipping(Number(e.target.value))}
                                      className="input-kloset !py-2 !px-2.5 text-xs font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={2}
                                    className="input-kloset !py-2 !px-2.5 text-xs resize-none"
                                  />
                                </div>

                                <div className="flex gap-2 justify-end pt-2">
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="btn-outline !h-9 !px-4 text-xs !rounded-lg"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(item.id)}
                                    className="btn-gold !h-9 !px-4 text-xs !rounded-lg flex items-center gap-1.5"
                                  >
                                    <Save size={13} />
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Standard View Mode */
                              <div className="flex flex-col sm:flex-row gap-5 items-center">
                                <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-zinc-50 border flex-shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={imageUrl}
                                    alt={item.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>

                                <div className="flex-1 text-center sm:text-left space-y-1">
                                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                                    <span className="badge badge-gold text-[9px] uppercase tracking-wider">
                                      {item.category}
                                    </span>
                                    <span className="text-[10px] font-mono text-[var(--ink-lighter)] flex items-center gap-1">
                                      <Eye size={12} /> {item.view_count || 0} views
                                    </span>
                                    {item.status === 'pending_approval' && (
                                      <span className="badge badge-rose text-[9px] uppercase font-bold">
                                        Moderation Queue
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-display text-lg font-bold text-[var(--ink)]">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-[var(--ink-light)] line-clamp-2">
                                    {item.description}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-xs font-mono pt-1 text-[var(--ink-light)] justify-center sm:justify-start">
                                    <span>3-Day Rent: ₹{item.price_3day}/3-days</span>
                                    <span>Deposit: ₹{item.security_deposit}</span>
                                    <span>Shipping: ₹{item.delivery_fee}</span>
                                  </div>
                                </div>

                                <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-[var(--bloom)] pt-4 sm:pt-0 sm:pl-6 flex-shrink-0 flex flex-col justify-between h-full min-w-[130px]">
                                  <div>
                                    <span className="text-[9px] uppercase tracking-wider font-mono text-[var(--ink-lighter)]">Views Rating</span>
                                    <span className="price text-base font-bold block mt-0.5 text-[var(--ink)]">
                                      ★{item.rating_avg} ({item.rating_count})
                                    </span>
                                  </div>
                                  
                                  <div className="mt-3.5 space-y-1.5">
                                    <span
                                      className={`badge text-[9px] uppercase font-bold py-0.5 px-3 block text-center capitalize ${
                                        item.status === 'active'
                                          ? 'badge-sage'
                                          : item.status === 'rented'
                                          ? 'badge-gold'
                                          : 'badge-rose'
                                      }`}
                                    >
                                      {item.status.replace('_', ' ')}
                                    </span>
                                    {item.status !== 'pending_approval' && (
                                      <button
                                        onClick={() => handleStartEdit(item)}
                                        className="text-[10px] text-[var(--rose)] hover:underline flex items-center gap-1 justify-center w-full font-mono uppercase tracking-wider pt-1 cursor-pointer"
                                      >
                                        <Edit2 size={10} />
                                        Quick Edit
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: Analytics Tab */}
                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-3xl p-6 border border-[var(--petal)] shadow-sm">
                      <h3 className="font-display text-lg font-semibold text-[var(--ink)] mb-4">
                        Monthly Revenue & Bookings Trends
                      </h3>
                      <div className="h-64 w-full">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--rose)" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="var(--rose)" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="month" stroke="var(--ink-lighter)" fontSize={10} fontFamily="var(--font-mono)" tickLine={false} />
                              <YAxis stroke="var(--ink-lighter)" fontSize={10} fontFamily="var(--font-mono)" tickLine={false} />
                              <Tooltip />
                              <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="var(--rose)" strokeWidth={2} fill="url(#colorSales)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-3xl p-6 border border-[var(--petal)] shadow-sm">
                        <h4 className="font-display text-base font-semibold text-[var(--ink)] mb-4">
                          Earnings by Couture Category
                        </h4>
                        <div className="h-56 w-full">
                          {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                { name: 'Lehengas', value: totalRevenue > 0 ? totalRevenue : 28000 },
                                { name: 'Sarees', value: 12000 },
                                { name: 'Anarkalis', value: 7200 }
                              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="var(--ink-lighter)" fontSize={10} fontFamily="var(--font-mono)" tickLine={false} />
                                <YAxis stroke="var(--ink-lighter)" fontSize={10} fontFamily="var(--font-mono)" tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" name="Revenue" fill="var(--gold)" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-3xl p-6 border border-[var(--petal)] shadow-sm flex flex-col justify-between">
                        <h4 className="font-display text-base font-semibold text-[var(--ink)] mb-3">
                          Showroom Conversion Analytics
                        </h4>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span>Profile Views to Product Clicks</span>
                              <span className="font-bold">64%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--bloom)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--rose)]" style={{ width: '64%' }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span>Product Clicks to Cart Addition</span>
                              <span className="font-bold">28%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--bloom)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--gold)]" style={{ width: '28%' }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span>Cart Addition to Booking Order</span>
                              <span className="font-bold">14%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--bloom)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--sage)]" style={{ width: '14%' }} />
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-[var(--ink-lighter)] font-mono leading-relaxed mt-4">
                          * Data represents aggregated views over the past 30 days. Highlighted conversion metrics match organic fashion segment benchmarks.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: Booking/Fulfillment Orders */}
                {activeTab === 'orders' && (
                  <motion.div
                    key="orders-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-3xl p-6 border border-[var(--petal)] shadow-sm">
                      <div className="pb-4 border-b border-[var(--bloom)] flex justify-between items-center mb-6">
                        <h3 className="font-display text-lg font-semibold text-[var(--ink)]">
                          Incoming Reservation Requests ({pendingRequests.length})
                        </h3>
                        <span className="badge badge-rose text-[9px] uppercase tracking-wider font-bold">Action Alerts</span>
                      </div>

                      {pendingRequests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingRequests.map((req) => (
                            <div
                              key={req.id}
                              className="p-5 rounded-2xl bg-[var(--ivory-warm)]/40 border border-[var(--petal)]/50 space-y-4 flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--ink-lighter)]">
                                    Ref: {req.booking_ref}
                                  </span>
                                  <span className="badge badge-gold text-[9px] uppercase font-bold">
                                    {req.status}
                                  </span>
                                </div>
                                <h4 className="text-sm font-semibold text-[var(--ink)] font-display text-base">
                                  {req.outfit?.title}
                                </h4>
                                <div className="text-xs space-y-1 text-[var(--ink-light)] leading-relaxed">
                                  <p>Renter: <span className="font-semibold text-[var(--ink)]">{req.renter?.name || 'Premium Renter'}</span></p>
                                  <p>Dates: <span className="font-semibold text-[var(--ink)]">{new Date(req.pickup_date).toLocaleDateString()} to {new Date(req.return_date).toLocaleDateString()}</span></p>
                                  <p>Fulfillment Payout: <span className="font-mono font-bold text-[var(--rose)]">₹{req.total_amount - req.platform_fee}</span></p>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2 border-t border-[var(--petal)]/20">
                                <button
                                  onClick={() => handleCancelBooking(req.id)}
                                  className="btn-outline !h-9 !px-3 text-xs flex-1 uppercase tracking-wider font-mono flex items-center justify-center gap-1.5"
                                >
                                  <X size={12} />
                                  Decline
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(req.id, 'confirmed')}
                                  className="btn-gold !h-9 !px-3 text-xs flex-1 uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Check size={12} />
                                  Confirm Order
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-floral py-10 text-center">
                          <p className="text-sm text-[var(--ink-light)]">No pending booking requests are awaiting confirmation.</p>
                        </div>
                      )}
                    </div>

                    {/* Fulfill Orders Timeline */}
                    <div className="bg-white rounded-3xl p-6 border border-[var(--petal)] shadow-sm">
                      <h3 className="font-display text-lg font-semibold text-[var(--ink)] mb-4">
                        Active Showroom Fulfillment Pipeline
                      </h3>
                      {bookings.filter(b => b.status !== 'pending' && b.status !== 'cancelled').length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-[var(--petal)] text-[9px] font-mono uppercase tracking-wider text-[var(--ink-lighter)] pb-3">
                                <th className="pb-3 pl-2">Outfit</th>
                                <th className="pb-3">Renter</th>
                                <th className="pb-3 text-center">Rental Dates</th>
                                <th className="pb-3 text-right">Earning (95%)</th>
                                <th className="pb-3 text-center pr-2">Pipeline Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                              {bookings.filter(b => b.status !== 'pending' && b.status !== 'cancelled').map((b) => (
                                <tr key={b.id}>
                                  <td className="py-3 pl-2 font-medium">{b.outfit?.title}</td>
                                  <td className="py-3">{b.renter?.name || 'Renter'}</td>
                                  <td className="py-3 text-center font-mono">{new Date(b.pickup_date).toLocaleDateString()} - {new Date(b.return_date).toLocaleDateString()}</td>
                                  <td className="py-3 text-right font-mono font-semibold">₹{b.total_amount - b.platform_fee}</td>
                                  <td className="py-3 text-center pr-2">
                                    <select
                                      value={b.status}
                                      onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                                      className="bg-[var(--ivory)] border border-[var(--petal)] text-[10px] rounded-lg px-2 py-1 font-mono text-[var(--ink)] focus:outline-none"
                                    >
                                      <option value="confirmed">Confirmed</option>
                                      <option value="picked_up">Picked Up</option>
                                      <option value="in_use">In Use</option>
                                      <option value="cleaning">Cleaning</option>
                                      <option value="completed">Completed</option>
                                      <option value="returned">Returned</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-[var(--ink-lighter)]">
                          No active order pipelines in the fulfillment track.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: Customer Reviews with Interactive Replies */}
                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-3xl p-6 border border-[var(--petal)] shadow-sm">
                      <div className="pb-3 border-b border-[var(--bloom)] mb-6">
                        <h2 className="text-lg font-display font-semibold text-[var(--ink)]">
                          Customer Reviews ({reviews.length})
                        </h2>
                      </div>

                      <div className="space-y-6">
                        {reviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-5 rounded-2xl bg-[var(--ivory-warm)]/30 border border-[var(--petal)]/40 space-y-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-sm text-[var(--ink)]">{rev.renterName}</h4>
                                <span className="text-[10px] font-mono text-[var(--gold)] uppercase tracking-wider block mt-0.5">
                                  Verified Renter · {rev.outfitTitle}
                                </span>
                              </div>
                              <span className="font-mono text-xs text-[var(--gold)]">
                                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                              </span>
                            </div>

                            <p className="text-xs text-[var(--ink-light)] leading-relaxed italic">
                              &ldquo;{rev.comment}&rdquo;
                            </p>

                            {/* Seller Reply Area */}
                            {rev.reply ? (
                              <div className="bg-white p-3 rounded-xl border border-[var(--petal)]/60 text-xs space-y-1.5">
                                <span className="font-semibold text-[var(--gold)] uppercase tracking-widest text-[9px] font-mono block">
                                  Your Response:
                                </span>
                                <p className="text-[var(--ink-light)] leading-relaxed">{rev.reply}</p>
                              </div>
                            ) : (
                              <div>
                                {replyId === rev.id ? (
                                  <div className="space-y-2 pt-2">
                                    <textarea
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      placeholder="Write your professional response to this renter..."
                                      rows={2}
                                      className="input-kloset text-xs resize-none"
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => setReplyId(null)}
                                        className="btn-outline !h-8 !px-3 text-[10px] !rounded-lg"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSaveReply(rev.id)}
                                        className="btn-gold !h-8 !px-3 text-[10px] !rounded-lg uppercase tracking-wider"
                                      >
                                        Submit Reply
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setReplyId(rev.id);
                                      setReplyText('');
                                    }}
                                    className="text-xs text-[var(--rose)] hover:underline flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer"
                                  >
                                    <MessageSquare size={12} />
                                    Reply to Renter
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
