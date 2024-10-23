import './App.css';
import React, { useEffect, useState } from 'react';
import JellybeanCard from './components/JellybeanCard';
import JellybeanModal from './components/JellybeanModal';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const [jellybeans, setJellybeans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [isGridView, setIsGridView] = useState(true);

  // Fetch all jellybean records from backend
  useEffect(() => {
    fetch(process.env.REACT_APP_API)
      .then((response) => response.json())
      .then((data) => setJellybeans(data))
      .catch((error) => console.error('Error fetching jellybeans:', error));
  }, []);

  const openAddModal = () => {
    setEditingFlavor(null);
    setIsModalOpen(true);
  };

  const openEditModal = (flavor) => {
    setEditingFlavor(flavor);
    setIsModalOpen(true);
  };

  const handleSaveFlavor = async (newFlavor) => {
    const formData = new FormData();
    formData.append('flavor', newFlavor.flavor);

    if (newFlavor.imageFile) {
      formData.append('imageFile', newFlavor.imageFile);
    }

    const method = editingFlavor ? 'PUT' : 'POST';
    const url = editingFlavor 
      ? `${process.env.REACT_APP_PUT_POST_DELETE}${editingFlavor.id}`
      : process.env.REACT_APP_PUT_POST_DELETE;

    const response = await fetch(url, {
      method: method,
      body: formData,
    });

    const savedFlavor = await response.json();

    if (editingFlavor) {
      setJellybeans(jellybeans.map((jellybean) => (jellybean.id === editingFlavor.id ? savedFlavor.updatedFlavor : jellybean)));
    } else {
      setJellybeans([...jellybeans, savedFlavor.newFlavor]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteFlavor = async (id) => {
    const response = await fetch(`${process.env.REACT_APP_PUT_POST_DELETE}${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setJellybeans(jellybeans.filter((jellybean) => jellybean.id !== id));
    } else {
      console.error('Failed to delete flavor');
    }
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const toggleView = () => {
    setIsGridView(!isGridView); // Toggle between grid and table view
  };

  const sortedJellybeans = [...jellybeans].sort((a, b) => {
    switch (sortOrder) {
      case 'name-asc':
        return a.flavor.localeCompare(b.flavor);
      case 'name-desc':
        return b.flavor.localeCompare(a.flavor);
      case 'date-newest':
        return new Date(b.date_added) - new Date(a.date_added);
      case 'date-oldest':
        return new Date(a.date_added) - new Date(b.date_added);
      default:
        return 0;
    }
  });

  return (
    <div>
      {/* Header image and text */}
      <header>
        <img src="/header-transparent.png" alt="Jellybean Emporium" className="header-image" />
        <p className="header-text">A site by Jackson Schow</p>
      </header>
      {/* View toggle, button for adding a jellybean flavor, sort options for viewing */}
      <div className="controls">
      <div className={`toggle-view ${isGridView ? 'grid' : 'table'}`} onClick={toggleView}>
        <div className="toggle-option">
        <i class="fa-solid fa-table-cells"></i> <span className="toggle-text">Grid</span>
        </div>
        <div className="toggle-option">
          <span className="toggle-text">Table</span> <i className="fas fa-table"></i>
        </div>
      </div>

        <button onClick={openAddModal} className="add-flavor-button">+ Add Flavor</button>
        <select onChange={handleSortChange} value={sortOrder} className="sort-dropdown">
          <option value="name-asc">Sort by Name (A-Z)</option>
          <option value="name-desc">Sort by Name (Z-A)</option>
          <option value="date-newest">Sort by Date (Newest First)</option>
          <option value="date-oldest">Sort by Date (Oldest First)</option>
        </select>
      </div>

      {/* Body that displays JellybeanCards in a grid */}
      <div className="body-container">
        {isGridView ? (
          <div className="card-container">
            {sortedJellybeans.map((jellybean) => (
              <JellybeanCard
                key={jellybean.id}
                flavor={jellybean.flavor}
                imageName={jellybean.s3_image}
                onClick={() => openEditModal(jellybean)}
              />
            ))}
          </div>
        ) : (
          <table className="jellybean-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Flavor</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {sortedJellybeans.map((jellybean) => (
                <tr key={jellybean.id} onClick={() => openEditModal(jellybean)}>
                  <td>
                    <img
                      src={`${process.env.REACT_APP_S3_BUCKET}${jellybean.s3_image}`}
                      alt={jellybean.flavor}
                      style={{ width: '50px', height: '50px' }}
                    />
                  </td>
                  <td>{jellybean.flavor}</td>
                  <td>{new Date(jellybean.date_added).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for adding/editing jellybean flavors */}
      <JellybeanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDeleteFlavor}
        onSave={handleSaveFlavor}
        flavorData={editingFlavor}
      />
    </div>
  );
}

export default App;
