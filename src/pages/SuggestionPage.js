import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from "firebase/firestore";
import { firestore } from '../firebase';
import Menu from '../components/Menu.js';
import { Link } from 'react-router-dom';

const SuggestionPage = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        // Fetch all goals
        const goalsQuery = query(collection(firestore, "goals"));
        const goalsSnapshot = await getDocs(goalsQuery);
        const allGoals = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => b.savers - a.savers);;

        // Fetch user's current goals
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Wendy237")); // Replace with actual username
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const userGoalsQuery = query(collection(firestore, `users/${userId}/goals`));
          const userGoalsSnapshot = await getDocs(userGoalsQuery);
          const currentUserGoals = userGoalsSnapshot.docs.map(doc => doc.data().title);

          // Filter out goals that are not in the current user's goals
          const suggestedGoals = allGoals.filter(goal => !currentUserGoals.includes(goal.title));
          setGoals(suggestedGoals);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching goals: ", error);
      }
    };

    fetchGoals();
  }, []);

  return (
    <div>
      <Menu />
      <h1>Suggested Goals</h1>
      <ul>
        {goals.map(goal => (
          <li key={goal.id}>
            <Link to={`/details-goal/${goal.title.toLowerCase().replace(/ /g, '-')}`}>
              {goal.title} - Savers: {goal.savers}, Achievers: {goal.achievers}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionPage;
