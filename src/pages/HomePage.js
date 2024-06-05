import React, { useState, useEffect } from 'react';
import { collection, query, where, addDoc, getDocs, updateDoc, increment} from "firebase/firestore";
import { firestore } from '../firebase';
import { useNavigate, Link } from 'react-router-dom'; 
import Menu from '../components/Menu.js'; 

const HomePage = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [saving, setSaving] = useState('');
  const [cost, setCost] = useState('');
  const [totalSaving, setTotalSaving] = useState(0);
  const [espm, setEspm] = useState(0);

  const navigate = useNavigate(); 

  const handleGoalClick = (goal) => {  
    const formattedTitle = goal.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/details-goal/${formattedTitle}`)
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
    const fetchUserStats = async () => {
      try {
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Wendy237")); // Replace with actual username
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setEspm(userData.espm);
          setTotalSaving(userData['total saving']);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching user stats: ", error);
      }
    };

    fetchGoals();
    fetchUserStats();
  }, []);


  const addGoal = async () => {
    if (newGoal.trim()) {
      try {
        const goalQuery = query(collection(firestore, "goals"), where("titlelc", "==", newGoal.toLowerCase()));
        const goalSnapshot = await getDocs(goalQuery);
  
        if (!goalSnapshot.empty) {
          const goalDocRef = goalSnapshot.docs[0].ref;
          const goalData = goalSnapshot.docs[0].data();

          const totalSavers = goalData.savers || 0;
          const totalAchievers = goalData.achievers || 0;
          const currentAverageCosts = goalData['average costs'] || 0;
          const newAverageCosts = Math.ceil(((currentAverageCosts * (totalSavers + totalAchievers)) + parseFloat(cost)) / (1 + totalSavers + totalAchievers));

          await updateDoc(goalDocRef, {
            savers: increment(1),
            'average costs': newAverageCosts
          });
        } else {
          const newGoalData = {
            title: newGoal,
            titlelc: newGoal.toLowerCase(),
            'average costs': cost,
            savers: 1,
            achievers: 0
          };
          const goalsCollectionRef = collection(firestore, `goals`);
          await addDoc(goalsCollectionRef, newGoalData);
        }
  
        // Add the new goal data for the user
        const newGoalDataForUser = {
          title: newGoal,
          progress: 0,
          costs: parseFloat(cost)
        };
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Wendy237"));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsCollectionRef = collection(firestore, `users/${userId}/goals`);
          const docRef = await addDoc(goalsCollectionRef, newGoalDataForUser);
          setGoals([...goals, { id: docRef.id, ...newGoalDataForUser }]);
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
      <Link to="/badges"> Wendy237 </Link>
      <p>Expected Saving Per Month: £{espm}</p>
      <p>Total Saving: £{totalSaving}</p>
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
        <button onClick={addGoal}>Add New Goal</button>
        <button onClick={() => navigate('/suggestion')}>Need Suggestions</button>
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
