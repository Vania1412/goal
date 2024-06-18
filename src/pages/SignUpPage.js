import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { firestore } from '../firebase';
import { useGlobalState } from '../GlobalStateContext.js';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import logo from '../assets/saversquad logo.png';
import './SignUpPage.css'

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [espm, setEspm] = useState('');
  const { username, setUsername } = useGlobalState();
  const auth = getAuth();

  const handleSignUp = async () => {
    try {
      
      const usernameQuery = query(collection(firestore, "users"), where("Username", "==", username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) { 
        setError("Username is already taken");
        return;
      }

      await createUserWithEmailAndPassword(auth, email, password);
       
      const userData = { 
        email: email, 
        Username: username, 
        espm: parseInt(espm), 
        'total saving': 0
      };
      await addDoc(collection(firestore, 'users'), userData);
 
      navigate('/home');
    } catch (error) {
      console.error("Error signing up: ", error);
      setError("Error signing up. Please try again.");
    }
  };

  return (
      <div className="container">
      <div className="header-container">
      <h1 className="header-text">Welcome to SAVERSQUAD</h1>
      <img src={logo} alt="Logo" className="header-logo" />
    </div>
    <h2>Sign Up</h2>
      {error && <p className="signup-error">{error}</p>}
      <form className="signup-form" onSubmit={handleSignUp}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Expected Saving per Month:
          <input
            type="text"
            value={espm}
            onChange={(e) => setEspm(e.target.value)}
            required
          />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpPage;