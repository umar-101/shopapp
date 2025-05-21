// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Use Routes instead of Switch
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
// import Shop from './components/Shop';
import Cart from './components/Cart';
//import UserItems from './components/UserItems';
//import AccountEdit from './components/AccountEdit';
import ItemDetails from './components/ItemDetails';
import './App.css'
import { CartProvider } from './context/cartContext';
import Profile from './components/profile';
//import Profile from './components/Profile/Profile';

function App() {
  return (
    <CartProvider>
      <Router>
      <Navbar />
      <div className="container">
        <Routes> {/* Use Routes instead of Switch */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/signup" element={<CreateAccount />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/account" element={<AccountEdit />} /> */}
        </Routes>
      </div>
    </Router>

    </CartProvider>
    
  );
}

export default App;
