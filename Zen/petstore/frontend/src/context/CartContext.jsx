import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) { setCartItems([]); return; }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCartItems(data.items);
      setCartTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (product_id, quantity = 1) => {
    if (!user) { toast.error('Please login first'); return false; }
    try {
      await api.post('/cart', { product_id, quantity });
      await fetchCart();
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
      return false;
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      await api.put(`/cart/${id}`, { quantity });
      await fetchCart();
    } catch {}
  };

  const removeFromCart = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      await fetchCart();
      toast.success('Removed from cart');
    } catch {}
  };

  const clearCart = async () => {
    try { await api.delete('/cart'); setCartItems([]); setCartTotal(0); } catch {}
  };

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart, cartCount: cartItems.reduce((s, i) => s + i.quantity, 0) }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
