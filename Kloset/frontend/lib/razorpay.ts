export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, unknown>;
  };
}

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions & {
        handler?: (response: RazorpayPaymentResponse) => void;
        modal?: {
          ondismiss?: () => void;
          escape?: boolean;
          backdropclose?: boolean;
        };
      }): {
        open: () => void;
        on: (event: 'payment.failed', handler: (response: RazorpayFailedResponse) => void) => void;
      };
      isLoaded?: boolean;
    };
  }
}

/**
 * Loads the Razorpay SDK script dynamically in the document.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay checkout modal using the correct resolved promise hooks.
 */
export function openRazorpay(options: RazorpayOptions): Promise<{ status: 'success' | 'failed' | 'dismissed'; response?: RazorpayPaymentResponse | RazorpayFailedResponse }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ status: 'failed' });
      return;
    }

    if (!window.Razorpay) {
      resolve({ status: 'failed' });
      return;
    }

    const checkoutOptions = {
      ...options,
      handler: (response: RazorpayPaymentResponse) => {
        resolve({ status: 'success', response });
      },
      modal: {
        ondismiss: () => resolve({ status: 'dismissed' }),
        escape: false,
        backdropclose: false,
      },
    };

    const rzp = new window.Razorpay(checkoutOptions);
    
    rzp.on('payment.failed', (response: RazorpayFailedResponse) => {
      resolve({ status: 'failed', response });
    });

    rzp.open();
  });
}
