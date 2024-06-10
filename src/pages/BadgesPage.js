import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import Menu from '../components/Menu.js'; 
import { useGlobalState } from '../GlobalStateContext.js';


const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const { username } = useGlobalState();


  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const userQuery = query(collection(firestore, 'users'), where("Username", "==", username));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const badgesQuery = query(collection(firestore, `users/${userId}/badges`));
          const badgesSnapshot = await getDocs(badgesQuery);
          const badgesData = badgesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBadges(badgesData);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
      }
    };
    fetchBadges();
  }, [username]);

  return (
    <div className="container">
      <Menu /> 
      <h1>Badges</h1>
      {badges.length === 0 ? <p> Save and Share more actively to earn badges! </p> : <></>}
      {badges.map(item => (
        <div key={item.id} className="badgesItem">
          <p className="badgesItem">{item.title} lvl: {item.level}</p>
          
        </div>
      ))}
    
    </div>
  );
};

export default BadgesPage;
