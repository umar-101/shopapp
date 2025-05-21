import React, { useState, useEffect,useContext  } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CartContext } from '../context/cartContext';
import {
  faShoppingCart, faSearch, faDollarSign, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const LandingPage = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [carouselIndex, setCarouselIndex] = useState({});

  // Debounce the search input to avoid too many requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Search API USE
  useEffect(() => {
    const url = `http://localhost:8000/shop/?search=${encodeURIComponent(debouncedSearch)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const formattedItems = data.items.map(item => ({
          ...item,
          images: ['/static/default1.jpg', '/static/default2.jpg', '/static/default3.jpg'] // Placeholder images
        }));
        setItems(formattedItems);
      })
      .catch(err => console.error('Failed to load items:', err));
  }, [debouncedSearch]);

  // Carousel auto-advance every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => {
        const updated = {};
        items.forEach(item => {
          updated[item.id] = (prev[item.id] || 0) + 1;
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [items]);

  const handleCarousel = (id, direction) => {
    setCarouselIndex(prev => {
      const item = items.find(i => i.id === id);
      const maxIndex = item?.images.length || 1;
      return {
        ...prev,
        [id]: direction === 'next'
          ? (prev[id] + 1) % maxIndex
          : (prev[id] - 1 + maxIndex) % maxIndex
      };
    });
  };

const handleAddToCart = async (itemId) => {
  if (!isLoggedIn) {
    alert('You must be logged in to add items to the cart.');
    navigate('/login');
    return;
  }

   try {
      const message = await addToCart(itemId);
      alert(message);
    } catch (error) {
      alert('Error adding item to cart: ' + error.message);
    }
};


  return (
    <div className="landing-page">
      <section className="hero-section">
        <h1>Welcome to the WebShop!</h1>
        <p>Browse and shop for your favorite items.</p>
      </section>

      <div className="search-bar-container">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card-container">
        {items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          items.map(item => {
            const index = carouselIndex[item.id] || 0;
            return (
              <div className="card" key={item.id}>
                <div className="card-carousel">
                  <button className="carousel-btn left" onClick={() => handleCarousel(item.id, 'prev')}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <img src={item.images[index]} alt={item.title} className="carousel-image" />
                  <button className="carousel-btn right" onClick={() => handleCarousel(item.id, 'next')}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
                <div className="card-content">
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <div className="price">
                    <FontAwesomeIcon icon={faDollarSign} /> {item.price}
                  </div>
                  <div className="meta">Added by {item.seller__username}</div>
                  <div className="meta">
                    Date added: {new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(item.id)}>
                    <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LandingPage;
