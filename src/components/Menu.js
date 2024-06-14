import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  menuContainer: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '10px',
  },
  menuButton: {
    fontSize: '22px',
    padding: '6px',
    cursor: 'pointer',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  menuButtonHover: {
    backgroundColor: '#0056b3',
  },
  menuOptions: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: '#fff',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    zIndex: 1,
    transition: 'opacity 0.3s, transform 0.3s',
    transform: 'translateY(-10px)',
    opacity: 0,
    pointerEvents: 'none',
  },
  menuOptionsVisible: {
    opacity: 1,
    transform: 'translateY(0)',
    pointerEvents: 'auto',
  },
  link: {
    display: 'block',
    padding: '10px 20px',
    textDecoration: 'none',
    color: '#333',
    transition: 'background-color 0.3s',
  },
  linkHover: {
    backgroundColor: '#f0f0f0',
  },
  activeLink: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
};

const Menu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [hover, setHover] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="menuContainer" style={styles.menuContainer}>
      <button
        className="menuButton"
        style={{
          ...styles.menuButton,
          ...(hover ? styles.menuButtonHover : {}),
        }}
        onClick={toggleMenu}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-haspopup="true"
        aria-expanded={showMenu}
      >
        ☰ MENU
      </button>
      <div
        className="menuOptions"
        style={{
          ...styles.menuOptions,
          ...(showMenu ? styles.menuOptionsVisible : {}),
        }}
      >
        <Link to="/home" style={{ ...styles.link, ...(location.pathname === '/home' ? styles.activeLink : {}) }}>
          Home
        </Link>
        <Link to="/goal-adding" style={{ ...styles.link, ...(location.pathname === '/goal-adding' ? styles.activeLink : {}) }}>
          Add New Goal
        </Link>
        <Link to="/achieved" style={{ ...styles.link, ...(location.pathname === '/achieved' ? styles.activeLink : {}) }}>
          Achieved Goals
        </Link>
        <Link to="/suggestion" style={{ ...styles.link, ...(location.pathname === '/suggestion' ? styles.activeLink : {}) }}>
          Suggested Goals
        </Link>
        <Link to="/interested" style={{ ...styles.link, ...(location.pathname === '/interested' ? styles.activeLink : {}) }}>
          Interests
        </Link>
        <Link to="/following-followers" style={{ ...styles.link, ...(location.pathname === '/following' ? styles.activeLink : {}) }}>
          Following/Followers
        </Link>
      
        <Link to="/progress-board" style={{ ...styles.link, ...(location.pathname === '/progress-board' ? styles.activeLink : {}) }}>
          Progress Board
        </Link>
        <Link to="/challenge" style={{ ...styles.link, ...(location.pathname === '/challenge' ? styles.activeLink : {}) }}>
          Challenge
        </Link>
      </div>
    </div>
  );
};

export default Menu;
