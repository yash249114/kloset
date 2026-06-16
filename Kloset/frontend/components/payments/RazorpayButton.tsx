'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { loadRazorpayScript, openRazorpay } from '@/lib/razorpay';
import Button from '@/components/ui/Button';
import { CreditCard } from 'lucide-react';

export interface RazorpayButtonProps {
  amount: number; // in Rupees
  orderId: string; // Razorpay Order ID from backend
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: Record<string, unknown>) => void;
  onFailure?: (error: Record<string, unknown>) => void;
  onDismiss?: () => void;
}

export default function RazorpayButton({
  amount,
  orderId,
  description,
  prefill,
  onSuccess,
  onFailure,
  onDismiss,
}: RazorpayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load payment gateway. Please check your connection.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_keys',
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        name: 'Kloset Luxe',
        description: description,
        order_id: orderId,
        prefill: prefill || {
          name: 'Premium Renter',
          email: 'renter@kloset.in',
          contact: '9876543210',
        },
        theme: {
          color: '#2C2C2C', // charcoal
        },
      };

      const result = await openRazorpay(options);
      
      if (result.status === 'success') {
        toast.success('Payment authorized successfully!');
        onSuccess(result.response as unknown as Record<string, unknown>);
      } else if (result.status === 'failed') {
        toast.error('Payment failed. Please try again.');
        if (onFailure && result.response) onFailure(result.response as unknown as Record<string, unknown>);
      } else {
        toast('Payment cancelled by user.');
        if (onDismiss) onDismiss();
      }
    } catch (err) {
      toast.error('An error occurred during payment execution.');
      if (onFailure) onFailure(err as unknown as Record<string, unknown>);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant="gold"
      onClick={handlePayment}
      isLoading={isProcessing}
      className="w-full flex items-center justify-center gap-2 cursor-pointer"
    >
      <CreditCard size={16} /> Pay ₹{amount.toLocaleString('en-IN')} via Razorpay
    </Button>
  );
}
