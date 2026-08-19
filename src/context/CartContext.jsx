import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('parthvi_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('parthvi_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [couponCode, setCouponCode] = useState(() => localStorage.getItem('parthvi_coupon') || '');
  const [couponError, setCouponError] = useState(null);
  const [cartSummary, setCartSummary] = useState({
    items: [],
    subtotal: 0,
    tax_amount: 0,
    shipping_fee: 0,
    discount_amount: 0,
    total_amount: 0,
    applied_coupon: null,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Check if user is logged in
  const isLoggedIn = () => !!localStorage.getItem('parthvi_token');

  // Sync cart with backend server for pricing and inventory calculations
  useEffect(() => {
    localStorage.setItem('parthvi_cart', JSON.stringify(cartItems));
    if (cartItems.length > 0) {
      api.syncCart(cartItems, couponCode).then(data => {
        if (data.success) {
          setCartSummary(data);
          setCouponError(data.coupon_error || null);
        }
      });
    } else {
      setCartSummary({
        items: [],
        subtotal: 0,
        tax_amount: 0,
        shipping_fee: 0,
        discount_amount: 0,
        total_amount: 0,
        applied_coupon: null,
      });
      setCouponError(null);
    }
  }, [cartItems, couponCode]);

  // Sync wishlist with backend when user is logged in
  useEffect(() => {
    if (isLoggedIn()) {
      api.getWishlistIds().then(data => {
        if (data.success) {
          setWishlist(data.product_ids);
          localStorage.setItem('parthvi_wishlist', JSON.stringify(data.product_ids));
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('parthvi_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (variantId, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.variant_id === variantId);
      if (existing) {
        return prev.map(item =>
          item.variant_id === variantId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { variant_id: variantId, quantity }];
    });
    setIsCartOpen(true);
    api.trackEvent('ADD_TO_CART', window.location.pathname, { variant_id: variantId, quantity });
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCartItems(prev => prev.map(item => (item.variant_id === variantId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (variantId) => {
    setCartItems(prev => prev.filter(item => item.variant_id !== variantId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setCouponError(null);
    localStorage.removeItem('parthvi_coupon');
  };

  const applyCoupon = (code) => {
    setCouponCode(code);
    localStorage.setItem('parthvi_coupon', code);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponError(null);
    localStorage.removeItem('parthvi_coupon');
  };

  const toggleWishlist = async (productId) => {
    if (isLoggedIn()) {
      // Sync with backend
      const res = await api.toggleWishlistItem(productId);
      if (res.success) {
        setWishlist(prev => {
          if (res.action === 'removed') {
            return prev.filter(id => id !== productId);
          }
          return [...prev, productId];
        });
      }
    } else {
      // Guest: localStorage only
      setWishlist(prev => {
        if (prev.includes(productId)) {
          return prev.filter(id => id !== productId);
        }
        return [...prev, productId];
      });
    }
    api.trackEvent('WISHLIST_TOGGLE', window.location.pathname, { product_id: productId });
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartSummary,
        couponCode,
        couponError,
        isCartOpen,
        setIsCartOpen,
        totalCartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
