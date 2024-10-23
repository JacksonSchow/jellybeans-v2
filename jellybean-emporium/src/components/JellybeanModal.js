import React, { useState, useEffect } from 'react';

// Modal to handle adding (creating) a jellybean flavor record and editing a flavor's record
const JellybeanModal = ({ isOpen, onClose, onSave, flavorData, onDelete }) => {
  const [flavor, setFlavor] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (flavorData) {
      setFlavor(flavorData.flavor);
      setImageFile(null);
    } else {
      setFlavor('');
      setImageFile(null);
    }
  }, [flavorData]);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSave = () => {
    const newFlavor = {
      flavor,
      imageFile,
    };
    onSave(newFlavor);
    setFlavor('');
    setImageFile(null);
    onClose();
  };

  const handleDelete = () => {
    if (flavorData && onDelete) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (flavorData && onDelete) {
      onDelete(flavorData.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>{flavorData ? `Edit Flavor` : 'Add New Flavor'}</h2>
        <label style={styles.labelName}>Flavor Name:</label>
        <input
          type="text"
          value={flavor}
          onChange={(e) => setFlavor(e.target.value)}
          placeholder="Enter jellybean flavor"
          style={styles.inputBox}
        />
        <label style={styles.labelName}>Upload Image (optional):</label>
        <input
            type="file"
            id="file-upload"
            style={styles.hiddenInput}
            onChange={handleImageChange}
        />
        
        <button
            type="button"
            onClick={() => document.getElementById('file-upload').click()}
            style={styles.uploadButton}
        >
            {imageFile ? imageFile.name : 'Choose Image'}
        </button>

        <div style={styles.buttonGroup}>
            <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
            <div style={styles.actionButtonsGroup}>
                {flavorData && (
                  <button onClick={handleDelete} style={styles.deleteButton}>
                    Delete Flavor
                  </button>
                )}
                <button onClick={handleSave} style={styles.saveButton}>{flavorData ? 'Update' : 'Save'}</button>
            </div>
        </div>

        {showDeleteConfirm && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmBox}>
              <p>Are you sure you want to delete this flavor?</p>
              <button onClick={confirmDelete} style={styles.confirmButton}>Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
    actionButtonsGroup: {
        display: 'flex',
        alignItems: 'center',
    },
    buttonGroup: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
    },
    cancelButton: {
        backgroundColor: '#EAEAEC',
        color: 'black',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        height: '3vw',
        width: '6vw',
        fontSize: '1.15vw',
    },
    confirmOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmBox: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
    },
    confirmButton: {
        backgroundColor: '#EF3925',
        color: 'white',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        height: '3vw',
        width: '10vw',
        fontSize: '1.15vw',
        marginRight: '1vw',
    },
    deleteButton: {
        backgroundColor: '#EF3925',
        color: 'white',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        height: '3vw',
        width: '10vw',
        fontSize: '1.15vw',
    },
    hiddenInput: {
          display: 'none',
    },
    inputBox: {
          height: '2.5vw',
          fontSize: '1.15vw'
    },
    labelName: {
          fontSize: '1.2vw',
          position: 'relative',
          marginBottom: '-.75vw'
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: '2vw',
        borderRadius: '8px',
        width: '30vw',
        display: 'flex',
        flexDirection: 'column',
        height: '22vw',
        justifyContent: 'space-between',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        marginLeft: '1vw',
        height: '3vw',
        width: '7vw',
        fontSize: '1.15vw',
        backgroundColor: '#295D82',
        color: '#FFFFFF',
        borderRadius: '8px',
    },
  uploadButton: {
        backgroundColor: '#EB878C',
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1.15vw',
        transition: 'background-color 0.3s ease',
        height: '3vw',
        marginTop: '0vw'
  },
};

export default JellybeanModal;
