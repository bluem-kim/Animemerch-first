import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);

const initialState = { items: [] }; // item: { product, name, price, photoUrl, quantity }

function cartReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload || initialState;
    case 'ADD': {
      const { product, name, price, photoUrl, quantity = 1 } = action.payload;
      const idx = state.items.findIndex(i => i.product === product);
      const items = [...state.items];
      if (idx >= 0) {
        items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
      } else {
        items.push({ product, name, price, photoUrl, quantity });
      }
      return { ...state, items };
    }
    case 'UPDATE_QTY': {
      const { product, quantity } = action.payload;
      const items = state.items.map(i => i.product === product ? { ...i, quantity } : i).filter(i => i.quantity > 0);
      return { ...state, items };
    }
    case 'REMOVE': {
      const { product } = action.payload;
      return { ...state, items: state.items.filter(i => i.product !== product) };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      if (raw) dispatch({ type: 'INIT', payload: JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(state)); } catch {}
  }, [state]);

  const value = useMemo(() => {
    const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = state.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    return {
      items: state.items,
      totalItems,
      subtotal,
      add: (item) => dispatch({ type: 'ADD', payload: item }),
      updateQty: (product, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { product, quantity } }),
      remove: (product) => dispatch({ type: 'REMOVE', payload: { product } }),
      clear: () => dispatch({ type: 'CLEAR' }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
