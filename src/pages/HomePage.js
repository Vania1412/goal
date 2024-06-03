import React, { useState, useEffect } from 'react';
import { collection, query, where, addDoc, getDocs } from "firebase/firestore";
import { firestore } from '../firebase';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import Menu from '../components/Menu.js'; 

const HomePage = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [saving, setSaving] = useState('');
  const [cost, setCost] = useState('');

  const navigate = useNavigate(); 

  const handleGoalClick = (goal) => { // Pass the goal object as an argument
    navigate(`/details-goal`);  // Pass the goal object in the state
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        // Construct a query to fetch goals for the user with username "Wendy237"
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Wendy237"));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsQuery = query(collection(firestore, `users/${userId}/goals`));
          const goalsSnapshot = await getDocs(goalsQuery);
          const data = goalsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || '',
            progress: doc.data().progress || 0,
            costs: doc.data().costs || 0,
            selected: doc.data().selected || false,
            startingDate: doc.data().startingDate || null,
           }));
          setGoals(data);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching goals: ", error);
      }
    };
    fetchGoals();
  }, []);

  const addGoal = async () => {
    if (newGoal.trim()) {
      const newGoalData = {
        title: newGoal,
        progress: 0,
        costs: parseFloat(cost),
      };
      try {
        // Assume "Wendy237" is the username of the user
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Wendy237"));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsCollectionRef = collection(firestore, `users/${userId}/goals`);
          const docRef = await addDoc(goalsCollectionRef, newGoalData);
          setGoals([...goals, { id: docRef.id, ...newGoalData }]);
          setNewGoal('');
          setCost('');
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error adding goal: ", error);
      }
    }
  };

  return (
    <div>
      <Menu /> 
      <h1>Saving for your Goal</h1>
      <div>
        <input
          type="text"
          placeholder="Enter savings"
          value={saving}
          onChange={(e) => setSaving(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter costs"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter new goal"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
        />
        <button onClick={addGoal}>Add Goal</button>
      </div>
     <ul>
      {goals.map(goal => (
        <li key={goal.id}>
          <button onClick={() => handleGoalClick(goal)}> {/* Pass the goal object to the handleGoalClick function */}
            {goal.title} - {goal.progress}% - £{goal.costs}
          </button>
        </li>
      ))}
    </ul>
    </div>
  );
};

export default HomePage;
