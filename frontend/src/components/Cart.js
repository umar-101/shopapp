// src/components/Cart.js

import React, { useContext ,useState} from 'react';
import axios from 'axios';
import { CartContext } from '../context/cartContext';



const getCSRFToken = () => {
  const match = document.cookie.match(/csrftoken=([\w-]+)/);
  return match ? match[1] : '';
};

const Cart = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [checkoutErrors, setCheckoutErrors] = useState([]);

  
  const handleDelete = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:8000/shop/cart/remove/${cartItemId}/`, { withCredentials: true });
      
      setCartItems(cartItems.filter(item => item.cart_item_id !== cartItemId));
    } catch (error) {
      console.error('Failed to delete cart item:', error);
      alert('Failed to delete item from cart.');
    }
  };

const handleCheckout = async () => {
  setCheckoutLoading(true);
  setCheckoutMessage('');
  setCheckoutErrors([]);

  try {
    const response = await axios.post(
      'http://localhost:8000/shop/pay/',
      {},
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
      }
    );

    if (response.data.message) {
      setCheckoutMessage(response.data.message);
      setCartItems([]); // clear local cart
    }
  } catch (error) {
    console.error('Checkout failed:', error);
    if (error.response && error.response.data && error.response.data.errors) {
      setCheckoutErrors(error.response.data.errors);
    } else {
      setCheckoutMessage('Something went wrong during checkout.');
    }
  } finally {
    setCheckoutLoading(false);
  }
};
  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map(item => (
          <div key={item.cart_item_id} className="cart-item">
            <p className="title">{item.title}</p>
            <p className="price">${Number(item.price).toFixed(2)}</p>
            <button
              className="delete-btn"
              onClick={() => handleDelete(item.cart_item_id)}
              aria-label={`Delete ${item.title}`}
            >
              Delete
            </button>
          </div>
        ))
      )}
            {checkoutLoading && <p>Processing payment...</p>}
      {checkoutMessage && <p className="success-message">{checkoutMessage}</p>}
      {checkoutErrors.length > 0 && (
        <div className="error-messages">
          {checkoutErrors.map((err, idx) => (
            <p key={idx} className="error-message">{err}</p>
          ))}
        </div>
      )}
      <button className="checkout-btn" onClick={handleCheckout} disabled={checkoutLoading}>
        {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
      </button>

      <style jsx>{`
        .cart {
          max-width: 600px;
          margin: 30px auto;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }
        .cart-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 15px 20px;
          margin-bottom: 15px;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .title {
          flex: 1;
          font-weight: 600;
          font-size: 18px;
          color: #222;
        }
        .price {
          width: 80px;
          font-weight: 700;
          color: #4caf50;
          text-align: right;
        }
        .delete-btn {
          background: #e53935;
          border: none;
          color: white;
          padding: 8px 14px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          margin-left: 15px;
          transition: background-color 0.3s ease;
        }
        .delete-btn:hover {
          background: #b71c1c;
        }
        .checkout-btn {
          width: 100%;
          padding: 14px 0;
          background: #1976d2;
          color: white;
          font-size: 18px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          transition: background-color 0.3s ease;
        }
        .checkout-btn:hover {
          background: #0d47a1;
        }
      `}</style>
    </div>
  );
};

export default Cart;
