import React, { useContext } from 'react';
import { CartContext } from '../context/cartContext';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignInAlt, faUserPlus, faShoppingCart, faUserCircle, faSignOutAlt, faBoxOpen
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = cartItems.length;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">WebShop</Link>
      <div className="navbar-links">
        {isLoggedIn ? (
          <>
            <Link to="/cart" className="cart-link">
              <FontAwesomeIcon icon={faShoppingCart} /> Cart
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
            <span className="navbar-user">
              <FontAwesomeIcon icon={faUserCircle} /> Logged in
            </span>
            <Link to="/profile">
              <FontAwesomeIcon icon={faUserCircle} /> Profile
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <FontAwesomeIcon icon={faSignInAlt} /> Login
            </Link>
            <Link to="/signup">
              <FontAwesomeIcon icon={faUserPlus} /> Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
