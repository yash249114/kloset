import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number; // Daily rental rate
  deposit: number;
  size: string;
  startDate: string;
  endDate: string;
  quantity: number;
  image: string;
  sellerId?: string;
  sellerName?: string;
}

interface CartStore {
  cartItems: CartItem[];
  couponCode: string;
  discountPercentage: number;
  isOpen: boolean;
  
  // Actions
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, size: string) => void;
  updateItemDates: (id: string, size: string, startDate: string, endDate: string) => void;
  updateItemSize: (id: string, oldSize: string, newSize: string) => void;
  updateItemQuantity: (id: string, size: string, quantity: number) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => void;
  
  // Selectors
  getCalculations: () => {
    subtotal: number;
    securityDeposit: number;
    platformFee: number;
    shippingFee: number;
    tax: number;
    discount: number;
    total: number;
    totalDays: number;
  };
}

// Helper to calculate days between two dates inclusive
export const calculateRentalDays = (start: string, end: string): number => {
  if (!start || !end) return 1;
  const sDate = new Date(start);
  const eDate = new Date(end);
  const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start/end
  return isNaN(diffDays) ? 1 : diffDays;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      couponCode: '',
      discountPercentage: 0,
      isOpen: false,

      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.cartItems.findIndex(
            (item) => item.id === newItem.id && item.size === newItem.size
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.cartItems];
            updatedItems[existingIndex].quantity += 1;
            return { cartItems: updatedItems, isOpen: true };
          }

          return {
            cartItems: [...state.cartItems, { ...newItem, quantity: 1 }],
            isOpen: true,
          };
        });
      },

      removeItem: (id, size) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => !(item.id === id && item.size === size)
          ),
        }));
      },

      updateItemDates: (id, size, startDate, endDate) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id && item.size === size
              ? { ...item, startDate, endDate }
              : item
          ),
        }));
      },

      updateItemSize: (id, oldSize, newSize) => {
        set((state) => {
          const newSizeIndex = state.cartItems.findIndex(
            (item) => item.id === id && item.size === newSize
          );
          const oldSizeIndex = state.cartItems.findIndex(
            (item) => item.id === id && item.size === oldSize
          );

          if (oldSizeIndex === -1) return {};

          const updatedItems = [...state.cartItems];
          const oldItem = updatedItems[oldSizeIndex];

          if (newSizeIndex > -1 && oldSize !== newSize) {
            updatedItems[newSizeIndex].quantity += oldItem.quantity;
            updatedItems.splice(oldSizeIndex, 1);
          } else {
            updatedItems[oldSizeIndex].size = newSize;
          }

          return { cartItems: updatedItems };
        });
      },

      updateItemQuantity: (id, size, quantity) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id && item.size === size
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        }));
      },

      applyCoupon: (code) => {
        const cleanedCode = code.toUpperCase().trim();
        if (cleanedCode === 'KLOSETGOLD' || cleanedCode === 'FIRSTRENT') {
          set({
            couponCode: cleanedCode,
            discountPercentage: cleanedCode === 'KLOSETGOLD' ? 15 : 10,
          });
          return true;
        }
        return false;
      },

      removeCoupon: () => {
        set({ couponCode: '', discountPercentage: 0 });
      },

      clearCart: () => {
        set({ cartItems: [], couponCode: '', discountPercentage: 0 });
      },

      getCalculations: () => {
        const { cartItems, discountPercentage } = get();
        
        let subtotal = 0;
        let securityDeposit = 0;
        let totalDays = 0;

        cartItems.forEach((item) => {
          const days = calculateRentalDays(item.startDate, item.endDate);
          subtotal += item.price * days * item.quantity;
          securityDeposit += item.deposit * item.quantity;
          totalDays += days;
        });

        const platformFee = Math.round(subtotal * 0.05); // 5% platform fee
        const tax = Math.round(subtotal * 0.08); // 8% platform tax
        const shippingFee = cartItems.length > 0 ? 25 : 0; // Flat ₹25 shipping rate
        const discount = Math.round(subtotal * (discountPercentage / 100));
        
        const total = subtotal + securityDeposit + platformFee + shippingFee + tax - discount;

        return {
          subtotal,
          securityDeposit,
          platformFee,
          shippingFee,
          tax,
          discount,
          total,
          totalDays,
        };
      },
    }),
    {
      name: 'kloset-cart-storage',
      onRehydrateStorage: () => (state) => {
        if (state) state.isOpen = false;
      },
    }
  )
);
