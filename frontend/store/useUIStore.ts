import { create } from 'zustand';

interface UIState {
  cartOpen: boolean;
  aiStylistOpen: boolean;
  activeModal: string | null;
  overlayCount: number;

  // Actions
  setCartOpen: (open: boolean) => void;
  setAIStylistOpen: (open: boolean) => void;
  setActiveModal: (modalId: string | null) => void;
  closeAll: () => void;
  registerOverlay: () => void;
  unregisterOverlay: () => void;
}

function updateBodyScroll(count: number) {
  if (typeof window === 'undefined') return;
  if (count > 0) {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  cartOpen: false,
  aiStylistOpen: false,
  activeModal: null,
  overlayCount: 0,

  // Drawer component handles overlay registration
  setCartOpen: (open) => set({ cartOpen: open }),
  setAIStylistOpen: (open) => set({ aiStylistOpen: open }),
  setActiveModal: (modalId) => {
    const { registerOverlay, unregisterOverlay, activeModal } = get();
    if (modalId && !activeModal) registerOverlay();
    else if (!modalId && activeModal) unregisterOverlay();
    set({ activeModal: modalId });
  },
  closeAll: () => {
    const { overlayCount } = get();
    if (overlayCount > 0) {
      set({ overlayCount: 0, cartOpen: false, aiStylistOpen: false, activeModal: null });
      updateBodyScroll(0);
    } else {
      set({ cartOpen: false, aiStylistOpen: false, activeModal: null });
    }
  },
  registerOverlay: () => {
    const newCount = get().overlayCount + 1;
    set({ overlayCount: newCount });
    updateBodyScroll(newCount);
  },
  unregisterOverlay: () => {
    const newCount = Math.max(0, get().overlayCount - 1);
    set({ overlayCount: newCount });
    updateBodyScroll(newCount);
  },
}));
