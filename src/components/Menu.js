import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const styles = {
  menuContainer: {
    position: 'absolute',
    top: '0',
    right: '0',
    padding: '10px',
  },
  menuButton: {
    fontSize: '24px',
    padding: '10px',
    cursor: 'pointer',
  },
  menuOptions: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: '#fff',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  link: {
    display: 'block',
    padding: '10px',
    textDecoration: 'none',
  },
};

const Menu = () => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="menuContainer" style={styles.menuContainer}>
      <button className="menuButton" style={styles.menuButton} onClick={toggleMenu}>
        ☰
      </button>
      {showMenu && (
        <div className="menuOptions" style={styles.menuOptions}>
          <Link to="/home" style={styles.link}>Home</Link>
          <Link to="/goal-adding" style={styles.link}>Add New Goal</Link> 
          <Link to="/achieved" style={styles.link}>Achieved Goals</Link>
          <Link to="/suggestion" style={styles.link}>Suggested Goals</Link>
          <Link to="/interested" style={styles.link}>Interests</Link>
          <Link to="/following" style={styles.link}>Manage Following</Link> 
          <Link to="/followers" style={styles.link}>Your Followers</Link> 
          <Link to="/progress-board" style={styles.link}>Progress Board</Link> 
        </div>
      )}
    </div>
  );
};

export default Menu;
