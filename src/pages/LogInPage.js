import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from '../firebase';
import { useGlobalState } from '../GlobalStateContext.js';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const LogInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const auth = getAuth();

  const handleLogIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      console.error("Error logging in: ", error);
      setError("Error logging in. Please try again.");
    }
  };

  return (
    <div>
      <h2>Log In</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleLogIn}>
        
        
        <label>
          Email:
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
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
        
        <button type="submit">Log In</button>
      </form>
      <Link to = "/sign-up">Have not created an account yet</Link>

    </div>
  );
};

export default LogInPage;
