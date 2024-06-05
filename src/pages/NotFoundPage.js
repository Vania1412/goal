import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
    link: {
      display: 'block',
      padding: '10px',
      textDecoration: 'none',
    },
  };
  

const NotFoundPage = () => {
    
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/home" style={styles.link}> Back To Home Page </Link>
    </div>
  );
};

export default NotFoundPage;