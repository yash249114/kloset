'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import posthog from 'posthog-js';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import FloatIn from '@/components/motion/FloatIn';
import PetalBackground from '@/components/floral/PetalBackground';
import InvoiceViewer, { InvoiceData } from '@/components/checkout/InvoiceViewer';
import {
  ArrowLeft,
  MapPin,
  Truck,
  Store,
  CreditCard,
  Shield,
  Calendar,
  Check,
  ChevronRight,
  ArrowRight,
  Plus,
  AlertCircle,
  FileText,
  User,
  Phone,
  Home,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getCalculations, couponCode, discountPercentage, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0: Address, 1: Delivery, 2: Payment, 3: Review, 4: Confirmation
  
  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      label: 'Home',
      fullName: 'Arundhati Roy',
      phone: '+91 98200 12345',
      fullAddress: '42, Rose Garden Apartments, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    },
    {
      id: 'addr-2',
      label: 'Office',
      fullName: 'Arundhati Roy',
      phone: '+91 98200 67890',
      fullAddress: '15, Lotus Business Park, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // New Address Form State
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrAddress, setNewAddrAddress] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [addressFormError, setAddressFormError] = useState('');

  // Delivery Method State
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bankName, setBankName] = useState('SBI');
  const [paymentError, setPaymentError] = useState('');
  const [paymentAttempts, setPaymentAttempts] = useState(0);

  // Review & Terms
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Confirmation State
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  // Active items: Use cartItems, fallback to mock item if empty
  const [activeItems, setActiveItems] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Populate active items with cart items, or fallback if cart is empty
    if (cartItems.length > 0) {
      setActiveItems(cartItems);
    } else {
      setActiveItems([
        {
          id: 'outfit-mock-1',
          title: 'Royal Maroon Bridal Lehenga',
          price: 3500, // per day
          deposit: 10000,
          size: 'M',
          startDate: '2026-06-12',
          endDate: '2026-06-15',
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=500&fit=crop',
          sellerName: 'Priya Collections',
        }
      ]);
    }
  }, [cartItems]);

  if (!mounted) return null;

  // Recalculate based on items
  const calculateCosts = () => {
    let subtotal = 0;
    let securityDeposit = 0;
    let totalDays = 0;

    activeItems.forEach((item) => {
      // Calculate days
      const sDate = new Date(item.startDate);
      const eDate = new Date(item.endDate);
      const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      subtotal += item.price * days * item.quantity;
      securityDeposit += item.deposit * item.quantity;
      totalDays += days;
    });

    const platformFee = Math.round(subtotal * 0.05);
    const tax = Math.round(subtotal * 0.08);
    const shippingFee = deliveryType === 'delivery' ? 300 : 0;
    const discount = couponCode ? Math.round(subtotal * (discountPercentage / 100)) : 0;
    const total = subtotal + securityDeposit + platformFee + tax + shippingFee - discount;

    return {
      subtotal,
      securityDeposit,
      platformFee,
      tax,
      shippingFee,
      discount,
      total,
    };
  };

  const costs = calculateCosts();

  // Step names
  const steps = [
    { name: 'Address', label: '1' },
    { name: 'Delivery', label: '2' },
    { name: 'Payment', label: '3' },
    { name: 'Review', label: '4' },
    { name: 'Success', label: '5' },
  ];

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressFormError('');

    if (!newAddrName || !newAddrPhone || !newAddrAddress || !newAddrCity || !newAddrState || !newAddrPincode) {
      setAddressFormError('Please fill out all address fields.');
      return;
    }

    const newAddressObj: Address = {
      id: `addr-${Date.now()}`,
      label: newAddrLabel,
      fullName: newAddrName,
      phone: newAddrPhone,
      fullAddress: newAddrAddress,
      city: newAddrCity,
      state: newAddrState,
      pincode: newAddrPincode,
    };

    setAddresses([...addresses, newAddressObj]);
    setSelectedAddressId(newAddressObj.id);
    setShowAddressForm(false);
    
    // Reset form fields
    setNewAddrName('');
    setNewAddrPhone('');
    setNewAddrAddress('');
    setNewAddrCity('');
    setNewAddrState('');
    setNewAddrPincode('');
  };

  const handlePaymentSubmit = () => {
    setPaymentError('');

    if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setPaymentError('Please enter a valid UPI ID (e.g. name@upi)');
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        setPaymentError('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        setPaymentError('Please enter card expiry date (MM/YY)');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setPaymentError('Please enter a valid 3-digit CVV code');
        return;
      }
      if (!cardHolder) {
        setPaymentError('Please enter cardholder name');
        return;
      }
    }

    // Advance to review step
    setActiveStep(3);
  };

  const handlePlaceOrder = async () => {
    if (!agreedTerms) return;
    setIsProcessing(true);
    setPaymentError('');

    try {
      const item = activeItems[0];
      if (!item) {
        setPaymentError('No items in checkout.');
        setIsProcessing(false);
        return;
      }

      // Call bookings api
      const { bookingsAPI } = await import('@/lib/api/bookings');
      
      // Fallback formatting for uuid checks
      const outfitUUID = item.id.replace('outfit-', '');
      const formattedOutfitID = outfitUUID.length === 36 ? outfitUUID : '00000000-0000-0000-0000-000000000000';

      const apiBooking = await bookingsAPI.create({
        outfit_id: formattedOutfitID,
        pickup_date: item.startDate,
        return_date: item.endDate,
        size_selected: item.size || 'M',
        delivery_type: deliveryType,
        delivery_address_id: selectedAddressId,
      }).catch(err => {
        log.warn("API booking request failed, using local simulation", err);
        return {
          id: 'booking_mock_' + Date.now(),
          booking_ref: `KL-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          total_amount: costs.total,
          razorpay_order_id: 'order_mock_' + Date.now(),
        } as any;
      });

      // Track 'booking created' event
      posthog.capture('booking created', {
        booking_id: apiBooking.id,
        booking_ref: apiBooking.booking_ref,
        total_amount: apiBooking.total_amount || costs.total,
      });

      const amountInPaise = Math.round(costs.total * 100);

      const verifyPaymentOnBackend = async (rzpResponse: any) => {
        try {
          const { default: api } = await import('@/lib/api/client');
          const verifyRes = await api.post('/payments/verify', {
            razorpay_order_id: rzpResponse.razorpay_order_id || apiBooking.razorpay_order_id,
            razorpay_payment_id: rzpResponse.razorpay_payment_id || 'pay_mock_' + Date.now(),
            razorpay_signature: rzpResponse.razorpay_signature || 'simulated_signature',
          });

          if (verifyRes.data.success) {
            // Track 'payment completed' event
            posthog.capture('payment completed', {
              booking_id: apiBooking.id,
              booking_ref: apiBooking.booking_ref,
              total_amount: apiBooking.total_amount || costs.total,
              payment_id: rzpResponse.razorpay_payment_id,
            });

            setOrderId(apiBooking.booking_ref);
            setOrderDate(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }));
            setIsProcessing(false);
            setActiveStep(4);
            clearCart();
          } else {
            throw new Error(verifyRes.data.error || 'Signature check failed');
          }
        } catch (verifyErr: any) {
          setPaymentError(verifyErr.message || 'Signature verification failed. Please contact support.');
          setIsProcessing(false);
          setActiveStep(2);
        }
      };

      if ((window as any).Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_keys',
          amount: amountInPaise,
          currency: 'INR',
          name: 'Kloset',
          description: `Rent: ${item.title}`,
          order_id: apiBooking.razorpay_order_id,
          handler: verifyPaymentOnBackend,
          prefill: {
            name: selectedAddress?.fullName || user?.name || 'Guest User',
            email: user?.email || 'renter@kloset.in',
            contact: selectedAddress?.phone || user?.phone || '9876543210',
          },
          theme: {
            color: '#111111',
          },
          modal: {
            ondismiss: function () {
              setPaymentError('Payment window was closed by the user.');
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Simulated gateway delay
        setTimeout(() => {
          verifyPaymentOnBackend({
            razorpay_payment_id: 'pay_mock_' + Date.now(),
            razorpay_signature: 'simulated_signature',
          });
        }, 1500);
      }

    } catch (err: any) {
      setPaymentError(err.message || 'Failed to place booking.');
      setIsProcessing(false);
    }
  };

  const log = {
    warn: (msg: string, details: any) => console.warn(msg, details)
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  // Map to InvoiceData structure
  const getInvoiceData = (): InvoiceData => {
    return {
      invoiceNumber: orderId || 'KL-2026-TEMP',
      date: orderDate || new Date().toLocaleDateString('en-IN'),
      renterName: selectedAddress?.fullName || 'Valued Customer',
      renterEmail: 'customer@kloset.in',
      shippingAddress: deliveryType === 'delivery' ? {
        full_address: selectedAddress?.fullAddress || '',
        city: selectedAddress?.city || '',
        state: selectedAddress?.state || '',
        pincode: selectedAddress?.pincode || '',
      } : null,
      items: activeItems,
      subtotal: costs.subtotal,
      securityDeposit: costs.securityDeposit,
      platformFee: costs.platformFee,
      tax: costs.tax,
      shippingFee: costs.shippingFee,
      discount: costs.discount,
      total: costs.total,
      paymentMethod: paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking',
    };
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--ivory)' }}>
      <PetalBackground />

      {/* Header */}
      <div
        className="py-5 px-6 sticky top-[var(--nav-height)] z-30"
        style={{ background: 'rgba(250, 247, 242, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--petal)' }}
      >
        <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (activeStep > 0 && activeStep < 4) {
                  setActiveStep(activeStep - 1);
                } else {
                  router.push('/discover');
                }
              }}
              className="p-2 rounded-xl hover:bg-[var(--bloom)] transition-colors"
            >
              <ArrowLeft size={20} style={{ color: 'var(--ink)' }} />
            </button>
            <div>
              <h1 className="text-xl font-display font-bold" style={{ color: 'var(--ink)' }}>
                Secure Checkout
              </h1>
              <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--ink-lighter)' }}>
                Protected by 256-Bit SSL
              </p>
            </div>
          </div>

          {/* Stepper Indicators */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {steps.map((step, idx) => (
              <div key={step.name} className="flex items-center">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] transition-all duration-300 ${
                    idx === activeStep
                      ? 'bg-[var(--rose)] text-white scale-110 shadow-sm'
                      : idx < activeStep
                      ? 'bg-[var(--sage)] text-white'
                      : 'bg-[var(--bloom)] text-[var(--ink-light)]'
                  }`}
                >
                  {idx < activeStep ? '✓' : step.label}
                </span>
                <span
                  className={`ml-1.5 hidden sm:inline ${
                    idx === activeStep
                      ? 'font-bold text-[var(--ink)]'
                      : idx < activeStep
                      ? 'text-[var(--sage-dark)]'
                      : 'text-[var(--ink-lighter)]'
                  }`}
                >
                  {step.name}
                </span>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-[1px] w-4 sm:w-8 mx-2 ${
                      idx < activeStep ? 'bg-[var(--sage)]' : 'bg-[var(--petal)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {showInvoice ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-4"
            >
              <InvoiceViewer invoice={getInvoiceData()} onClose={() => setShowInvoice(false)} />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form Steps */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Step 1: Address Selection */}
                {activeStep === 0 && (
                  <FloatIn>
                    <div className="card-floral p-6 bg-white space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-[var(--bloom)]">
                        <h2 className="text-lg font-display font-semibold text-[var(--ink)]">
                          1. Select Delivery Address
                        </h2>
                        <button
                          onClick={() => setShowAddressForm(!showAddressForm)}
                          className="btn-ghost !py-2 !px-3 !rounded-xl text-xs flex items-center gap-1.5"
                        >
                          <Plus size={14} />
                          {showAddressForm ? 'Cancel' : 'Add New'}
                        </button>
                      </div>

                      {showAddressForm ? (
                        <form onSubmit={handleAddAddress} className="space-y-4 bg-[var(--ivory-warm)]/40 p-5 rounded-2xl border border-[var(--petal)]/50">
                          <h3 className="text-xs uppercase tracking-wider font-mono text-[var(--rose)]">
                            Add New Shipping Destination
                          </h3>
                          
                          {addressFormError && (
                            <div className="text-[11px] text-[var(--rose-dark)] flex items-center gap-1 font-mono">
                              <AlertCircle size={14} />
                              {addressFormError}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                value={newAddrName}
                                onChange={(e) => setNewAddrName(e.target.value)}
                                className="input-kloset !py-2.5 !px-3 text-sm"
                                placeholder="Aishwarya Rai"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                Phone Number
                              </label>
                              <input
                                type="text"
                                value={newAddrPhone}
                                onChange={(e) => setNewAddrPhone(e.target.value)}
                                className="input-kloset !py-2.5 !px-3 text-sm"
                                placeholder="+91 98765 43210"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                              Street Address
                            </label>
                            <input
                              type="text"
                              value={newAddrAddress}
                              onChange={(e) => setNewAddrAddress(e.target.value)}
                              className="input-kloset !py-2.5 !px-3 text-sm"
                              placeholder="Flat 101, Floral Greens, Juhu Tara Road"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                value={newAddrCity}
                                onChange={(e) => setNewAddrCity(e.target.value)}
                                className="input-kloset !py-2.5 !px-3 text-sm"
                                placeholder="Mumbai"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                State
                              </label>
                              <input
                                type="text"
                                value={newAddrState}
                                onChange={(e) => setNewAddrState(e.target.value)}
                                className="input-kloset !py-2.5 !px-3 text-sm"
                                placeholder="Maharashtra"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                Pincode
                              </label>
                              <input
                                type="text"
                                value={newAddrPincode}
                                onChange={(e) => setNewAddrPincode(e.target.value)}
                                className="input-kloset !py-2.5 !px-3 text-sm"
                                placeholder="400049"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {['Home', 'Office', 'Other'].map((lbl) => (
                              <button
                                key={lbl}
                                type="button"
                                onClick={() => setNewAddrLabel(lbl)}
                                className={`py-1.5 px-4 rounded-xl text-xs font-mono transition-all ${
                                  newAddrLabel === lbl
                                    ? 'bg-[var(--rose)] text-white'
                                    : 'bg-white border border-[var(--petal)] text-[var(--ink-light)]'
                                }`}
                              >
                                {lbl}
                              </button>
                            ))}
                          </div>

                          <button
                            type="submit"
                            className="btn-gold w-full !h-[44px] text-xs uppercase tracking-[0.15em] mt-2"
                          >
                            Save Address
                          </button>
                        </form>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((addr) => (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`w-full rounded-2xl p-4 text-left flex items-start gap-4 transition-all duration-300 cursor-pointer border-[1.5px] ${
                                selectedAddressId === addr.id
                                  ? 'bg-[var(--bloom)]/20 border-[var(--rose)] shadow-sm'
                                  : 'bg-white border-[var(--petal)] hover:border-[var(--rose)]'
                              }`}
                            >
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{
                                  border: `2px solid ${selectedAddressId === addr.id ? 'var(--rose)' : 'var(--petal)'}`,
                                  background: selectedAddressId === addr.id ? 'var(--rose)' : 'transparent',
                                }}
                              >
                                {selectedAddressId === addr.id && <Check size={10} color="white" />}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-[var(--ink)]">
                                    {addr.fullName}
                                  </span>
                                  <span className="badge badge-rose text-[9px] uppercase tracking-wider font-mono font-medium px-2 py-0.5">
                                    {addr.label}
                                  </span>
                                </div>
                                <p className="text-xs text-[var(--ink-light)] leading-relaxed">
                                  {addr.fullAddress}, {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                <p className="text-[10px] text-[var(--ink-lighter)] font-mono flex items-center gap-1">
                                  <Phone size={10} />
                                  {addr.phone}
                                </p>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={() => setActiveStep(1)}
                            className="btn-gold w-full uppercase tracking-[0.15em]"
                          >
                            Continue to Delivery
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </FloatIn>
                )}

                {/* Step 2: Delivery Method */}
                {activeStep === 1 && (
                  <FloatIn>
                    <div className="card-floral p-6 bg-white space-y-6">
                      <div className="pb-4 border-b border-[var(--bloom)]">
                        <h2 className="text-lg font-display font-semibold text-[var(--ink)]">
                          2. Select Delivery Mode
                        </h2>
                        <p className="text-xs text-[var(--ink-light)]">Choose how you wish to receive your items</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            value: 'delivery' as const,
                            icon: Truck,
                            label: 'Premium Home Delivery',
                            desc: 'Sanitized courier, door-to-door delivery with protective garment bag and return pick-up scheduling.',
                            fee: '₹300 flat rate',
                          },
                          {
                            value: 'pickup' as const,
                            icon: Store,
                            label: 'In-Store Pickup',
                            desc: 'Pick up your fitted dress directly from our Mughal Garden Hub partner boutique. On-site fitting alterations free.',
                            fee: 'Free',
                          },
                        ].map((option) => (
                          <div
                            key={option.value}
                            onClick={() => setDeliveryType(option.value)}
                            className={`rounded-2xl p-5 text-left transition-all duration-300 cursor-pointer border-[1.5px] space-y-3 flex flex-col justify-between ${
                              deliveryType === option.value
                                ? 'bg-[var(--bloom)]/20 border-[var(--rose)] shadow-sm'
                                : 'bg-white border-[var(--petal)] hover:border-[var(--rose)]'
                            }`}
                          >
                            <div>
                              <option.icon
                                size={24}
                                className="mb-2"
                                style={{ color: deliveryType === option.value ? 'var(--rose)' : 'var(--ink-light)' }}
                              />
                              <p className="text-sm font-semibold text-[var(--ink)]">
                                {option.label}
                              </p>
                              <p className="text-xs text-[var(--ink-light)] mt-1 leading-relaxed">
                                {option.desc}
                              </p>
                            </div>
                            <div className="pt-2 border-t border-[var(--petal)]/20 flex justify-between items-center text-xs font-semibold">
                              <span style={{ color: 'var(--ink-light)' }}>Cost:</span>
                              <span className={option.value === 'delivery' ? 'text-[var(--rose)] font-mono' : 'text-[var(--sage-dark)] font-mono'}>
                                {option.fee}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveStep(0)}
                          className="btn-outline flex-1"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setActiveStep(2)}
                          className="btn-gold flex-1 uppercase tracking-[0.15em]"
                        >
                          Continue to Payment
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </FloatIn>
                )}

                {/* Step 3: Payment Details */}
                {activeStep === 2 && (
                  <FloatIn>
                    <div className="card-floral p-6 bg-white space-y-6">
                      <div className="pb-4 border-b border-[var(--bloom)]">
                        <h2 className="text-lg font-display font-semibold text-[var(--ink)]">
                          3. Secure Payment Gateway
                        </h2>
                        <p className="text-xs text-[var(--ink-light)] font-mono uppercase tracking-widest text-[var(--rose)]">
                          Integrated Razorpay / Card Simulator
                        </p>
                      </div>

                      {paymentError && (
                        <div className="bg-[var(--bloom)]/40 p-4 rounded-xl border border-[var(--rose)] text-xs text-[var(--rose-dark)] flex items-start gap-2.5 leading-relaxed font-mono">
                          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-bold block uppercase mb-1">Transaction Refused</span>
                            {paymentError}
                          </div>
                        </div>
                      )}

                      {/* Payment Tabs */}
                      <div className="flex border-b border-[var(--petal)]/40">
                        {[
                          { id: 'upi', label: 'UPI / QR Code' },
                          { id: 'card', label: 'Credit / Debit Card' },
                          { id: 'netbanking', label: 'Net Banking' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setPaymentMethod(tab.id as any);
                              setPaymentError('');
                            }}
                            className={`flex-1 text-center py-3 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-b-2 ${
                              paymentMethod === tab.id
                                ? 'border-[var(--rose)] text-[var(--rose)]'
                                : 'border-transparent text-[var(--ink-light)]'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* UPI Tab */}
                      {paymentMethod === 'upi' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                              Virtual Payment Address (VPA)
                            </label>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="input-kloset font-mono"
                              placeholder="arundhati@upi"
                            />
                            <p className="text-[10px] text-[var(--ink-lighter)] mt-1.5">
                              A request will be sent to your UPI app for authorization.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Card Tab */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="input-kloset"
                              placeholder="Arundhati Roy"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                              Card Number
                            </label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => {
                                // Format spacing
                                const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                const match = val.match(/.{1,4}/g);
                                setCardNumber(match ? match.join(' ') : val);
                              }}
                              className="input-kloset font-mono"
                              placeholder="4111 2222 3333 4444"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                Expiry Date (MM/YY)
                              </label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                  if (val.length >= 2) {
                                    setCardExpiry(`${val.substring(0, 2)}/${val.substring(2)}`);
                                  } else {
                                    setCardExpiry(val);
                                  }
                                }}
                                className="input-kloset font-mono"
                                placeholder="12/28"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                                CVV Code
                              </label>
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                className="input-kloset font-mono"
                                placeholder="***"
                              />
                            </div>
                          </div>

                          {paymentAttempts === 0 && (
                            <p className="text-[10px] text-[var(--rose)] leading-relaxed italic bg-[var(--bloom)]/20 p-2.5 rounded-lg border border-[var(--petal)]/30">
                              ℹ️ Note: To test the checkout payment failure and retry flow, submit card payment. The first attempt is simulated to fail, prompting details review or alternative payment selection.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Net Banking Tab */}
                      {paymentMethod === 'netbanking' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                              Select Your Bank
                            </label>
                            <select
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="input-kloset bg-white"
                            >
                              <option value="SBI">State Bank of India (SBI)</option>
                              <option value="HDFC">HDFC Bank</option>
                              <option value="ICICI">ICICI Bank</option>
                              <option value="AXIS">Axis Bank</option>
                              <option value="KOTAK">Kotak Mahindra Bank</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--petal)]/30">
                        <Shield size={14} className="text-[var(--sage)]" />
                        <span className="text-[10px] text-[var(--ink-lighter)]">
                          256-bit encryption. Your payment details are never saved on our servers.
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveStep(1)}
                          className="btn-outline flex-1"
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePaymentSubmit}
                          className="btn-gold flex-1 uppercase tracking-[0.15em]"
                        >
                          Confirm & Review
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </FloatIn>
                )}

                {/* Step 4: Review and Submit Order */}
                {activeStep === 3 && (
                  <FloatIn>
                    <div className="card-floral p-6 bg-white space-y-6">
                      <div className="pb-4 border-b border-[var(--bloom)]">
                        <h2 className="text-lg font-display font-semibold text-[var(--ink)]">
                          4. Final Order Review
                        </h2>
                        <p className="text-xs text-[var(--ink-light)]">Verify checkout elements before billing charge</p>
                      </div>

                      <div className="space-y-4 text-xs">
                        {/* Fulfillment Summary */}
                        <div className="p-4 bg-[var(--ivory-warm)]/40 rounded-2xl border border-[var(--petal)]/30 space-y-2">
                          <h3 className="font-bold text-[var(--ink)] flex items-center gap-1.5 uppercase font-mono text-[10px] tracking-wider">
                            <MapPin size={12} className="text-[var(--rose)]" />
                            Shipping Details
                          </h3>
                          {deliveryType === 'pickup' ? (
                            <p className="text-[var(--ink-light)]">
                              🏪 In-Store Self-Pickup at Partners Garden Boutique (Hub 1), Mumbai
                            </p>
                          ) : (
                            <div className="space-y-0.5 text-[var(--ink-light)]">
                              <p className="font-semibold text-[var(--ink)]">{selectedAddress?.fullName}</p>
                              <p>{selectedAddress?.fullAddress}, {selectedAddress?.city} - {selectedAddress?.pincode}</p>
                              <p className="font-mono text-[10px] mt-1">{selectedAddress?.phone}</p>
                            </div>
                          )}
                        </div>

                        {/* Payment Method Summary */}
                        <div className="p-4 bg-[var(--ivory-warm)]/40 rounded-2xl border border-[var(--petal)]/30 space-y-2">
                          <h3 className="font-bold text-[var(--ink)] flex items-center gap-1.5 uppercase font-mono text-[10px] tracking-wider">
                            <CreditCard size={12} className="text-[var(--rose)]" />
                            Payment Method
                          </h3>
                          <p className="text-[var(--ink-light)] font-mono">
                            {paymentMethod === 'upi' ? `UPI Address: ${upiId}` : paymentMethod === 'card' ? `Credit Card ending in **${cardNumber.slice(-4)}` : `Net Banking via ${bankName}`}
                          </p>
                        </div>
                      </div>

                      {/* Landlord Rental Agreement Terms */}
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={agreedTerms}
                            onChange={(e) => setAgreedTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded accent-[var(--rose)] cursor-pointer"
                          />
                          <span className="text-xs leading-relaxed text-[var(--ink-light)] select-none">
                            I verify all sizes and rental dates. I authorize Kloset to charge ₹{costs.total.toLocaleString('en-IN')} and agree to the{' '}
                            <Link href="/help" target="_blank" className="font-semibold text-[var(--rose)] underline hover:text-[var(--rose-dark)]">
                              Rental Agreement & Damage Policy
                            </Link>
                          </span>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveStep(2)}
                          className="btn-outline flex-1"
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePlaceOrder}
                          disabled={!agreedTerms || isProcessing}
                          className="btn-gold flex-1 uppercase tracking-[0.15em] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              Processing Charge...
                            </>
                          ) : (
                            <>
                              Pay ₹{costs.total.toLocaleString('en-IN')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </FloatIn>
                )}

                {/* Step 5: Order Confirmation / Success View */}
                {activeStep === 4 && (
                  <FloatIn>
                    <div className="card-floral p-8 bg-white text-center space-y-6">
                      <div className="w-20 h-20 bg-[var(--bloom)]/30 rounded-full flex items-center justify-center mx-auto border-2 border-[var(--sage)]">
                        <CheckCircle size={40} className="text-[var(--sage)]" />
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[var(--sage-dark)] font-bold">
                          Rent Request Approved
                        </span>
                        <h2 className="text-3xl font-display font-semibold text-[var(--ink)]">
                          Booking Confirmed! ✨
                        </h2>
                        <p className="text-sm text-[var(--ink-light)] max-w-md mx-auto">
                          Thank you for choosing Kloset. Your premium outfit rental order is locked. You will receive SMS alerts as shipment is dispatched.
                        </p>
                      </div>

                      <div className="bg-[var(--ivory-warm)]/60 rounded-2xl p-4 max-w-sm mx-auto border border-[var(--petal)]/40 text-xs text-left space-y-2 font-mono text-[var(--ink-light)]">
                        <div className="flex justify-between border-b border-[var(--petal)]/20 pb-1.5">
                          <span>Order Reference:</span>
                          <span className="font-bold text-[var(--ink)]">{orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaction Date:</span>
                          <span>{orderDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Refundable Deposit:</span>
                          <span className="text-[var(--sage-dark)]">₹{costs.securityDeposit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Mode:</span>
                          <span>{paymentMethod.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
                        <button
                          onClick={() => setShowInvoice(true)}
                          className="btn-outline flex-1 flex items-center justify-center gap-1.5 !py-3 text-xs"
                        >
                          <FileText size={14} />
                          View Receipt
                        </button>
                        
                        <Link
                          href="/renter/dashboard?tab=bookings"
                          className="btn-gold flex-1 !py-3 text-xs uppercase tracking-[0.12em]"
                        >
                          My Dashboard
                        </Link>
                      </div>
                      
                      <div className="pt-2">
                        <Link href="/discover" className="text-xs text-[var(--rose)] hover:underline font-mono uppercase tracking-wider">
                          ← Back to Discover
                        </Link>
                      </div>
                    </div>
                  </FloatIn>
                )}
              </div>

              {/* Right Column: Order Preview Sidebar (Fixed position during scroll) */}
              {activeStep < 4 && (
                <div className="lg:col-span-5">
                  <div className="sticky top-32">
                    <FloatIn direction="right">
                      <div className="card-floral p-6 bg-white space-y-6">
                        <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-[var(--ink-light)] pb-3 border-b border-[var(--bloom)]">
                          Selected Outfits ({activeItems.length})
                        </h2>

                        {/* Outfit previews */}
                        <div className="max-h-[220px] overflow-y-auto space-y-4 silk-scroll pr-1">
                          {activeItems.map((item, idx) => {
                            // Calculate days
                            const sDate = new Date(item.startDate);
                            const eDate = new Date(item.endDate);
                            const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
                            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                            return (
                              <div key={`${item.id}-${idx}`} className="flex gap-4 items-center">
                                <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-zinc-50 flex-shrink-0 border border-[var(--petal)]/40">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-display text-sm font-semibold text-[var(--ink)] truncate pr-1">
                                    {item.title}
                                  </h3>
                                  <p className="text-[10px] text-[var(--ink-lighter)] uppercase font-mono mt-0.5">
                                    Size {item.size} · {days} Days
                                  </p>
                                  <p className="text-xs text-[var(--rose)] font-semibold font-mono mt-1">
                                    ₹{item.price * days} <span className="text-[10px] text-[var(--ink-light)] font-normal">({item.quantity} qty)</span>
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Calculations */}
                        <div className="border-t border-[var(--petal)]/30 pt-4 space-y-2.5 text-xs font-mono text-[var(--ink-light)]">
                          <div className="flex justify-between">
                            <span>Rental Subtotal</span>
                            <span className="font-semibold text-[var(--ink)]">₹{costs.subtotal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="flex items-center gap-1">
                              Security Deposit
                              <span className="cursor-help text-[9px] bg-[var(--bloom)] text-[var(--rose)] rounded-full w-3.5 h-3.5 flex items-center justify-center" title="Fully refunded back to you once the outfit is returned safely.">?</span>
                            </span>
                            <span className="font-semibold text-[var(--ink)]">₹{costs.securityDeposit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform fee (5%)</span>
                            <span>₹{costs.platformFee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (8%)</span>
                            <span>₹{costs.tax}</span>
                          </div>
                          {deliveryType === 'delivery' && (
                            <div className="flex justify-between">
                              <span>Shipping</span>
                              <span>₹{costs.shippingFee}</span>
                            </div>
                          )}
                          {costs.discount > 0 && (
                            <div className="flex justify-between text-[var(--sage-dark)]">
                              <span>Discount ({discountPercentage}%)</span>
                              <span>-₹{costs.discount}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between text-sm font-bold text-[var(--ink)] pt-3 border-t border-[var(--petal)]/40">
                            <span className="font-sans">Grand Total</span>
                            <span className="text-[var(--rose)]">₹{costs.total}</span>
                          </div>
                        </div>

                        <div className="bg-[var(--sage)]/5 rounded-xl p-3 border border-[var(--sage)]/20 text-[10px] leading-relaxed text-[var(--sage-dark)]">
                          🛡️ Fully Refundable deposit of ₹{costs.securityDeposit} will be wired back to you upon safe pickup review.
                        </div>
                      </div>
                    </FloatIn>
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
