import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, updateDoc, increment } from 'firebase/firestore';
import { firestore } from '../firebase';
import profilePic from '../assets/icon.png';
import Menu from '../components/Menu.js'; 


const DetailsGoalPage = () => {
  const { goalTitle } = useParams(); // Get the goalTitle from the URL params
  const [goalData, setGoalData] = useState(null);
  const [isGoalSet, setIsGoalSet] = useState(true); // Start as true
  const [averageCosts, setAverageCosts] = useState(0);
  const navigate = useNavigate();

  const username = "Wendy237"; // Replace with the actual username

  function formatGoalTitle(goalTitle) {
    const words = goalTitle.split('-');
    const formattedTitle = words.join(' ');
    return formattedTitle;
  }


  useEffect(() => {
    const fetchGoalData = async () => {
      try {
        const formattedTitle = formatGoalTitle(goalTitle);
        const q = query(collection(firestore, 'goals'), where('titlelc', '==', formattedTitle));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setGoalData(data);
          setAverageCosts(data['average costs']);

          // Check if the goal is already set for the user
          const userQuery = query(collection(firestore, 'users'), where('Username', '==', username));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userId = userSnapshot.docs[0].id;
            const userGoalsQuery = query(collection(firestore, `users/${userId}/current_goals`), where('title', '==', data.title));
            const userGoalsSnapshot = await getDocs(userGoalsQuery);

            if (userGoalsSnapshot.empty) {
              setIsGoalSet(false); // Set to false if the goal is not found in the user's collection
            }
          }
        } else {
          console.log('Goal not found');
        }
      } catch (error) {
        console.error('Error fetching goal data:', error);
      }
    };

    fetchGoalData();
  }, [goalTitle]);

  const handleSetGoal = async () => {
    if (goalData) {
      try {
        const goalQuery = query(collection(firestore, "goals"), where("titlelc", "==", formatGoalTitle(goalTitle)));
        const goalSnapshot = await getDocs(goalQuery);

        if (!goalSnapshot.empty) {
          const goalDocRef = goalSnapshot.docs[0].ref;

          await updateDoc(goalDocRef, {
            savers: increment(1),
     
          });
        } 
        const userQuery = query(collection(firestore, 'users'), where('Username', '==', username));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsCollectionRef = collection(firestore, `users/${userId}/current_goals`);
          const newGoalData = {
            title: goalData.title,
            progress: 0,
            costs: averageCosts,
            category: goalData.category[0]
          };
          await addDoc(goalsCollectionRef, newGoalData);
          setIsGoalSet(true);  
          navigate('/home');
        } else {
          console.log('User not found');
        }
      } catch (error) {
        console.error('Error setting goal: ', error);
      }
    }
  };

  if (!goalData) {
    return <div>Loading...</div>;
  }

  const textStyle = {
    fontSize: '16px',
    margin: '5px 0',
  };

  const profileContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '10px 0',
  };

  const profileStyle = {
    alignItems: 'center',
    margin: '0 10px',
  };

  const profileNameStyle = {
    fontSize: '16px',
    marginBottom: '5px',
  };

  const profilePicStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
  };

  const { title, savers, achievers } = goalData;

  return (
    <div>
      <Menu />
      <h1>{title}</h1>
      <p>The average costs is £{averageCosts}</p>
      <p>{savers} users saving for this goal</p>
      <p>{achievers} users achieved this goal</p>
      {!isGoalSet && <button onClick={handleSetGoal}>Set Goal</button>}
      <p style={textStyle}>Users expected to achieve within a similar timeframe as you:</p>
      <div style={profileContainerStyle}>
        <div style={profileStyle}>
          <p style={profileNameStyle}>George</p>
          <img src={profilePic} alt="Profile" style={profilePicStyle} />
          <button className="followButton">Follow</button>
        </div>
      </div>

      {/* Render featured stories and tips */}
      <h2>Featured Stories & Tips</h2>
      {/* {featuredStories.map((story, index) => (
        <div key={index}>
          <p>{story.author}</p>
          <p>{story.tip}</p>
        </div>
      ))} */}

      {/* Render memory collection */}
      <h2>Memory Collection</h2>
    </div>
  );
};

export default DetailsGoalPage;
