import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from '../firebase.js';
import { useGlobalState } from '../GlobalStateContext.js';
import Menu from '../components/Menu.js';

const FollowersPage = () => {
  const { username } = useGlobalState();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setFollowers(userData.followers || []);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching followers list:", error);
      }
    };
    fetchFollowers();
  }, [username]);

  return (
    <div>
      <Menu />
      <h2>Your Followers</h2>
      <div>
        <h3>Followers</h3>
        <ul>
          {followers.map(followerUsername => (
            <li key={followerUsername}>{followerUsername}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FollowersPage;
