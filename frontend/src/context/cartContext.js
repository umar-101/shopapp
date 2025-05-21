// src/context/CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items on mount
    useEffect(() => {
    axios.get('http://localhost:8000/shop/cart/', { withCredentials: true })
        .then(res => setCartItems(res.data.cart_items)) // <-- same fix here
        .catch(err => console.error('Error fetching cart:', err));
    }, []);

  // Add item to cart (update state after successful API call)
    const addToCart = async (itemId) => {
    try {
        await axios.post(
        `http://localhost:8000/shop/item/${itemId}/add_to_cart/`,
        { item_id: itemId },
        { withCredentials: true }
        );
        // Refetch cart after adding
        const cartResponse = await axios.get('http://localhost:8000/shop/cart/', { withCredentials: true });
        setCartItems(cartResponse.data.cart_items);  // updated to .cart_items
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to add to cart');
    }
    };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
