import React, { useState } from 'react';

const Menu = () => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const navigateTo = (screen) => {
    window.location.href = screen;
    // Logic to navigate to the specified screen
    // For web, you can use methods provided by React Router or other routing libraries
    // Example:
    // history.push(screen);
    setShowMenu(false); // Close the menu after navigation
  };

  return (
    <div className="menuContainer" style={styles.menuContainer}>
      <button className="menuButton" style={styles.menuButton} onClick={toggleMenu}>
        ☰
      </button>
      {showMenu && (
        <div className="menuOptions" style={styles.menuOptions}>
          <button className="menuItem" onClick={() => navigateTo('/')}>
            Home
          </button>
          <button className="menuItem" onClick={() => navigateTo('/achieved')}>
            Achieved Goals
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  menuButton: {
    backgroundColor: '#ccc',
    padding: '8px 45px',
    borderRadius: '4px',
    fontSize: '20px',
  },
  menuOptions: {
    position: 'absolute',
    top: '32px',
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px',
  },
  menuItem: {
    display: 'block',
    padding: '8px',
    cursor: 'pointer',
  },
};

export default Menu;
