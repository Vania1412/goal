import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import profilePic from '../assets/icon.png';

const DetailsGoalPage = () => {
  const { goalTitle } = useParams(); // Get the goalTitle from the URL params
  const [goalData, setGoalData] = useState(null);

  function formatGoalTitle(goalTitle) {
    // Split the goal title into an array of words separated by hyphens
    const words = goalTitle.split('-');
  
    // Capitalize the first letter of each word and join them with spaces
    const formattedTitle = words.join(' ');
  
    return formattedTitle;
  }

  useEffect(() => {
    const fetchGoalData = async () => {
      try {
        // Query Firestore to get the goal data based on the goalTitle
        const formattedTitle = formatGoalTitle(goalTitle);
        const q = query(collection(firestore, 'goals'), where('titlelc', '==', formattedTitle));
        const querySnapshot = await getDocs(q);

        // Extract the goal data from the query snapshot
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setGoalData(data);
        } else {
          console.log('Goal not found');
        }
      } catch (error) {
        console.error('Error fetching goal data:', error);
      }
    };

    fetchGoalData();
  }, [goalTitle]); // Fetch data whenever goalTitle changes

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
 

  // Destructure goalData for easier access
  const { title, saver, achiever} = goalData;

  return (
    <div>
      <h1>{title}</h1>
      <p>{saver} users saving for this goal</p>
      <p>{achiever} users achieved this goal</p>
      <p style={textStyle}>Users expected to achieve within a similar timeframe as you:</p>
        <div style={profileContainerStyle}>
          <div style={profileStyle}>
            <p style={profileNameStyle}>George</p>
            <img src={profilePic} alt="Profile" style={profilePicStyle} />
            <button className="followButton">Follow</button>
          </div>
          <div style={profileStyle}>
            <p style={profileNameStyle}>Ivy</p>
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
      ))}*/}

      {/* Render memory collection */}
      <h2>Memory Collection</h2>
   
    </div>
  );
};

export default DetailsGoalPage;
