import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faBoxOpen, faPlusCircle, faKey, faChevronLeft, faChevronRight, faDollarSign, faEdit
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// mockItems not of use
const mockItems = [
  {
    id: 1,
    title: 'Sample Item',
    description: 'Great item',
    price: 99.99,
    images: ['/sample1.jpg', '/sample2.jpg'],
    seller__username: 'john_doe'
  },

];

const handleAddItem = async (e, newItem, setNewItem, setSuccess, setError) => {
  e.preventDefault();
  setSuccess('');
  setError('');

  const formData = new FormData();
  formData.append('title', newItem.title);
  formData.append('description', newItem.description);
  formData.append('price', newItem.price);

  //add item API integration
  try {
    const response = await fetch('http://localhost:8000/shop/add_item/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCSRFToken(),
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message || 'Item added successfully!');
      setNewItem({ title: '', description: '', price: '', images: [] });
    } else {
      setError(data.error || 'Failed to add item.');
    }
  } catch (err) {
    setError('Server error. Please try again later.');
  }
};


const getCSRFToken = () => {
  const match = document.cookie.match(/csrftoken=([\w-]+)/);
  return match ? match[1] : '';
};

// passowrd change functionality
const handlePasswordChange = async (
  e,
  oldPassword,
  newPassword,
  confirmPassword,
  setOldPassword,
  setNewPassword,
  setConfirmPassword,
  setError,
  setSuccess
) => {
  e.preventDefault();
  setError(null);
  setSuccess('');

  const formData = new FormData();
  formData.append('old_password', oldPassword);
  formData.append('new_password1', newPassword);
  formData.append('new_password2', confirmPassword);
//passowrd chagne API
  try {
    const response = await fetch('http://localhost:8000/shop/account/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCSRFToken(),
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(data.errors || { error: 'Something went wrong.' });
    }
  } catch (err) {
    setError({ error: 'Server error. Please try again later.' });
  }
};

const Profile = () => {
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);
    const [userItems, setUserItems] = useState({
    on_sale: [],
    sold: [],
    purchased: []
    });
  
 

  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('info');
  const [carouselIndex, setCarouselIndex] = useState({});
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    images: []
  });
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const [editingItemId, setEditingItemId] = React.useState(null);
  const [newPrice, setNewPrice] = React.useState('');
  const [editError, setEditError] = React.useState('');

  
//fetch user personal items, sold, on sale and purchased
useEffect(() => {
  if (activeTab === 'items') {
    setLoadingItems(true);
    fetch('http://localhost:8000/shop/user_items/', {
      method: 'GET',
      credentials: 'include', 
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
      })
      .then(data => {
        setUserItems({
          on_sale: data.on_sale || [],
          sold: data.sold || [],
          purchased: data.purchased || []
        });
        setLoadingItems(false);
        setItemsError(null);
      })
      .catch(err => {
        setItemsError(err.message);
        setLoadingItems(false);
      });
  }
}, [activeTab]);


  const handleCarousel = (id, direction) => {
    setCarouselIndex(prev => {
      const current = prev[id] || 0;
      const item = mockItems.find(i => i.id === id);
      const length = item.images.length;
      const next = direction === 'next' ? (current + 1) % length : (current - 1 + length) % length;
      return { ...prev, [id]: next };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewItem(prev => ({ ...prev, images: imageUrls }));
  };

  //edit item saved in user profile
const handleSave = async (itemId) => {
  if (!newPrice || isNaN(newPrice) || Number(newPrice) < 0) {
    setEditError('Please enter a valid price.');
    return;
  }
  try {
    await axios.post(
      `http://localhost:8000/shop/item/${itemId}/edit/`,
      new URLSearchParams({ price: newPrice }),
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCSRFToken(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    setEditingItemId(null);
    setEditError('');

        setUserItems((prevItems) => ({
        ...prevItems,
        on_sale: prevItems.on_sale.map(item =>
            item.id === itemId ? { ...item, price: newPrice } : item
        ),
        }));
  } catch (error) {
    console.error('Failed to update item price', error);
    setEditError('Failed to update price. Please try again.');
  }
};


  return (
    <div className="profile-layout">
      <aside className="sidebar">
        <button onClick={() => setActiveTab('info')}><FontAwesomeIcon icon={faUser} /> Personal Info</button>
        <button onClick={() => setActiveTab('items')}><FontAwesomeIcon icon={faBoxOpen} /> My Items</button>
        <button onClick={() => setActiveTab('add')}><FontAwesomeIcon icon={faPlusCircle} /> Add Item</button>
        <button onClick={() => setActiveTab('password')}><FontAwesomeIcon icon={faKey} /> Change Password</button>
      </aside>

      <main className="profile-content">
        {activeTab === 'info' && (
          <section>
            <h2>Personal Information</h2>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </section>
        )}

        {activeTab === 'items' && (
  <section>
    <h2>My Items</h2>
    {loadingItems && <p>Loading items...</p>}
    {itemsError && <p className="error-message">{itemsError}</p>}
    {!loadingItems && !itemsError && (
      <>
        {['on_sale', 'sold', 'purchased'].map((category) => (
          <div key={category} className="item-category-section">
            <h3>
              {category === 'on_sale'
                ? 'On Sale'
                : category === 'sold'
                ? 'Sold Items'
                : 'Purchased Items'}
            </h3>
            <div className="card-grid">
              {userItems[category].length === 0 ? (
                <p>No items in this category.</p>
              ) : (
                userItems[category].map((item) => {
                  const index = carouselIndex[item.id] || 0;
                  return (
                    <div className="card" key={item.id}>
                      <div className="card-carousel">
                        <button
                          className="carousel-btn left"
                          onClick={() => handleCarousel(item.id, 'prev')}
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <img
                          src={item.images ? item.images[index] : '/default-image.jpg'}
                          alt={item.title}
                          className="carousel-image"
                        />
                        <button
                          className="carousel-btn right"
                          onClick={() => handleCarousel(item.id, 'next')}
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </div>
                      <div className="card-content">
                        <h2>{item.title}</h2>
                        <p>{item.description}</p>
                        <div className="price">
                          <FontAwesomeIcon icon={faDollarSign} />{' '}
                          {category === 'on_sale' && editingItemId === item.id ? (
                            <>
                              <input
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                min="0"
                              />
                              <button onClick={() => handleSave(item.id)}>Save</button>
                              <button onClick={() => setEditingItemId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              ${item.price}
                              {category === 'on_sale' && (
                                <button
                                  className="edit-btn"
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setNewPrice(item.price);
                                    setEditError('');
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEdit} /> Edit
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        {editError && editingItemId === item.id && (
                          <p className="error-message">{editError}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </>
    )}
  </section>
)}



        {activeTab === 'add' && (
          <section>
            <h2>Add New Item</h2>
            <form onSubmit={(e) => handleAddItem(e, newItem, setNewItem, setSuccess, setError)}>
              <input type="text" placeholder="Title" required onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
              <textarea placeholder="Description" required onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
              <input type="number" placeholder="Price" required onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })} />
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
              {newItem.images.length > 0 && (
                <div className="preview-images">
                  {newItem.images.map((img, i) => (
                    <img key={i} src={img} alt={`Preview ${i}`} />
                  ))}
                </div>
              )}
              <button type="submit" className="btn">Add Item</button>
              {success && <p className="success-message">{success}</p>}
              {error && <p className="error-message">{error}</p>}
            </form>
          </section>
        )}

        {activeTab === 'password' && (
          <section>
            <h2>Change Password</h2>
            <form onSubmit={(e) =>
              handlePasswordChange(
                e,
                oldPassword,
                newPassword,
                confirmPassword,
                setOldPassword,
                setNewPassword,
                setConfirmPassword,
                setError,
                setSuccess
              )
            }>
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn">Change Password</button>
            </form>

            {success && <p className="success-message">{success}</p>}
            {error && (
              <div className="error-message">
                {Object.entries(error).map(([field, messages]) => (
                  <p key={field}>
                    <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(' ') : messages}
                  </p>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Profile;