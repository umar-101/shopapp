// src/components/ItemCard.js

import React from 'react';

const ItemCard = ({ item }) => {
  return (
    <div className="item-card">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <p>Price: ${item.price}</p>
      <p>Date Added: {new Date(item.date_added).toLocaleDateString()}</p>
      <button>Add to Cart</button>
    </div>
  );
};

export default ItemCard;
