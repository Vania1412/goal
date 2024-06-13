import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from '../firebase';
import { useGlobalState } from '../GlobalStateContext.js';

const LogInPage = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { username, setUsername } = useGlobalState();

  const handleLogIn = async () => {
    try {
      
      const usernameQuery = query(collection(firestore, "users"), where("Username", "==", username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (usernameSnapshot.empty) { 
        setError("Username does not exist");
        return;
      }
 
  //    await auth.createUserWithEmailAndPassword(email, password);
       
  
      navigate('/home');
    } catch (error) {
      console.error("Error logging in: ", error);
      setError("Error logging in. Please try again.");
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleLogIn}>
        
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <br />
        
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default LogInPage;
