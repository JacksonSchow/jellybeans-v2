import React, { useState } from 'react';

// Card for displaying jellybean images and flavor names
const JellybeanCard = ({ flavor, imageName, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const imgUrl = `${process.env.REACT_APP_S3_BUCKET}${imageName}`;

  return (
    <div
      style={{
        ...styles.card,
        boxShadow: isHovered
          ? '0 -4px 8px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)' // Top and bottom shadow on hover
          : 'none', // No shadow by default
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <img src={imgUrl} alt={flavor} style={styles.image} />
      <h2 style={styles.flavor}>{flavor}</h2>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'box-shadow 0.3s ease-in-out',
    borderRadius: '16px',
  },
  flavor: {
    position: 'relative',
    marginTop: '-4vw',
    fontSize: '1.6vw',
    fontWeight: '500',
    paddingBottom: '2vw',
  },
  image: {
    width: '100%',
    maxWidth: '26vw',
    borderRadius: '16px',
  },
};

export default JellybeanCard;
