import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState('admin@admin.com'); // Default email.
  const [password, setPassword] = useState('password'); // Default password.
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password); // Signed in.
      navigate("/home"); // Navigate to home page.
    } catch (error) { // Errors are handled here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(`Error: ${errorCode} ${errorMessage}`);
      setErrorMessage('Invalid email or password. Please try again.');
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleLogin}>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Log In</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
