import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { firestore } from '../firebase';
import { useGlobalState } from '../GlobalStateContext.js';

const FollowingPage = () => {
  const { username } = useGlobalState();
  const [following, setFollowing] = useState([]);
  const [newFollower, setNewFollower] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setFollowing(userData.following || []);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching following list:", error);
      }
    };
    fetchFollowing();
  }, [username]);

  const handleAddFollower = async () => {
    if (newFollower.trim()) {
      try {
        const followerQuery = query(collection(firestore, "users"), where("Username", "==", newFollower));
        const followerSnapshot = await getDocs(followerQuery);
        if (!followerSnapshot.empty) {
          const followerUsername = followerSnapshot.docs[0].data().Username;
          const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userDocRef = userSnapshot.docs[0].ref;
            await updateDoc(userDocRef, {
              following: arrayUnion(followerUsername)
            });
            const followerDocRef = followerSnapshot.docs[0].ref;
            await updateDoc(followerDocRef, {
              followers: arrayUnion(username)
            });
            setFollowing([...following, followerUsername]);
            setNewFollower('');
            setError('');
          }
        } else {
          setError("Username not found");
        }
      } catch (error) {
        console.error("Error adding follower:", error);
      }
    }
  };

  const handleRemoveFollower = async (followerUsername) => {
    try {
      const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userDocRef = userSnapshot.docs[0].ref;
        await updateDoc(userDocRef, {
          following: arrayRemove(followerUsername)
        });
        const followerQuery = query(collection(firestore, "users"), where("Username", "==", followerUsername));
        const followerSnapshot = await getDocs(followerQuery);
        if (!followerSnapshot.empty) {
          const followerDocRef = followerSnapshot.docs[0].ref;
          await updateDoc(followerDocRef, {
            followers: arrayRemove(username)
          });
          setFollowing(following.filter(user => user !== followerUsername));
        }
      }
    } catch (error) {
      console.error("Error removing follower:", error);
    }
  };

  return (
    <div>
      <h2>Manage Following</h2>
      <div>
        <input
          type="text"
          value={newFollower}
          onChange={(e) => setNewFollower(e.target.value)}
          placeholder="Add new follower"
        />
        <button onClick={handleAddFollower}>Add Follower</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h3>Following</h3>
        <ul>
          {following.map(followerUsername => (
            <li key={followerUsername}>
              {followerUsername}
              <button onClick={() => handleRemoveFollower(followerUsername)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FollowingPage;
