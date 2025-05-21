import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ItemDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const item = location.state?.item;

  // Fallback if item data is missing
  if (!item) {
    return (
      <div className="item-details">
        <h2>Item not found</h2>
        <button onClick={() => navigate('/')}>Go back to Home</button>
      </div>
    );
  }

  return (
    <div className="item-details">
      <h1>{item.title}</h1>
      <img src={item.images[0]} alt={item.title} className="main-image" />
      <p><strong>Description:</strong> {item.description}</p>
      <p><strong>Price:</strong> {item.price}</p>
      <p><strong>Seller:</strong> {item.seller}</p>
      <p><strong>Date Added:</strong> {item.date}</p>
      <button className="add-to-cart-btn">Add to Cart</button>
    </div>
  );
};

export default ItemDetails;
