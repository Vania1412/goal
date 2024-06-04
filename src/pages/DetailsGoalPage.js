import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';

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

  // Destructure goalData for easier access
  const { title, saver, achiever} = goalData;

  return (
    <div>
      <h1>{title}</h1>
      <p>{saver} users saving for this goal</p>
      <p>{achiever} users achieved this goal</p>

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
