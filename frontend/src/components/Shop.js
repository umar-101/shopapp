// src/components/Shop.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ItemCard from './ItemCard';

const Shop = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/items/')
      .then(response => setItems(response.data))
      .catch(error => console.error('Error fetching items:', error));
  }, []);

  return (
    <div className="shop">
      <h2>Items for Sale</h2>
      <div className="item-list">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Shop;
