import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { firestore } from '../firebase';
import { useGlobalState } from '../GlobalStateContext.js';

const ProgressBoardPage = () => {
  const { username } = useGlobalState();
  const [progressUpdates, setProgressUpdates] = useState([]);

  useEffect(() => {
    const fetchProgressUpdates = async () => {
      try {
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const following = userData.following || [];

          if (following.length > 0) {
            const updatesQuery = query(
              collection(firestore, "progressUpdates"),
              orderBy("timestamp", "desc")
            );
            const updatesSnapshot = await getDocs(updatesQuery);
            const updatesData = updatesSnapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id
            }));
            const filterFollowing = updatesData.filter(doc => following.includes(doc.username));
            setProgressUpdates(filterFollowing);
          }
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching progress updates:", error);
      }
    };

    fetchProgressUpdates();
  }, [username]);

  return (
    <div>
      <h2> Progress Board</h2>
      <ul>
        {progressUpdates.map((update, index) => (
          <li key={index}>
            {update.progress === "created" ? (
              <p>{update.username} has created a new goal "{update.goalTitle}"</p>
            ) : (
              <p>{update.username} has reached {update.progress}% of their goal "{update.goalTitle}"</p>
            )}
            <p>{new Date(update.timestamp.seconds * 1000).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProgressBoardPage;
