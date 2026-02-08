import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/types';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  customer_id: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customerId: string | null) => void;
  
  // Computed
  totalItems: () => number;
  subtotal: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer_id: null,
      
      addToCart: (product) => set((state) => {
        const existingItem = state.items.find((item) => item.id === product.id);
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          };
        }
        return { items: [...state.items, { ...product, quantity: 1 }] };
      }),

      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter((item) => item.id !== productId),
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ),
      })),

      clearCart: () => set({ items: [], customer_id: null }),
      
      setCustomer: (id) => set({ customer_id: id }),

      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      
      subtotal: () => get().items.reduce((acc, item) => acc + (item.base_price * item.quantity), 0),
      
      total: () => {
        const sub = get().subtotal();
        // Placeholder for tax logic
        return sub; 
      }
    }),
    {
      name: 'pos-cart-storage',
    }
  )
);
