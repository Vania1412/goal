import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from '../firebase';
import { useGlobalState } from '../GlobalStateContext.js';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import logo from '../assets/saversquad logo.png';
import './LoginPage.css'

const LogInPage = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { username, setUsername } = useGlobalState();
  const auth = getAuth();

  const handleLogIn = async (e) => {
    e.preventDefault();
    try {
      // Look up the username in Firestore to get the corresponding email.
      const usernameQuery = query(collection(firestore, "users"), where("Username", "==", username));
      const usernameSnapshot = await getDocs(usernameQuery);

      if (usernameSnapshot.empty) {
        setError("Username does not exist");
        return;
      }

      const email = usernameSnapshot.docs[0].data().email;

      const pwd = usernameSnapshot.docs[0].data().pwd;

      await signInWithEmailAndPassword(auth, email, pwd);
      navigate('/home');
    } catch (error) {
      console.error("Error logging in: ", error);
      setError("Error logging in. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="header-container">
      <h1 className="header-text">SAVERSQUAD</h1>
      <img src={logo} alt="Logo" className="header-logo" />
    </div>
      
    <h2>Log In</h2>
      {error && <p className="login-error">{error}</p>}
      <form className="login-form" onSubmit={handleLogIn}>
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
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Log In</button>
      </form>
      <Link className="login-link" to="/sign-up">Have not created an account yet</Link>
    </div>
  );
};

export default LogInPage;