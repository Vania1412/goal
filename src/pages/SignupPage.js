import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, setDoc } from "firebase/firestore";

function SignupPage() {
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore(); 

  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);  // Sign up successful, now automatically log in the user.
      await signInWithEmailAndPassword(auth, email, password);  // Navigate to home page.
      await setDoc(doc(db, 'users', userCredential.user.uid), { // After successful signup and login, store the username and email in Firestore.
        username: username,
        email: email,
      });
      navigate("/home");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error: ${errorCode} ${errorMessage}`);
      setErrorMessage(errorMessage);
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />  {/* Add this field */}
        </label>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Sign Up</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
    </div>
  );
}

export default SignupPage;
