import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from "firebase/firestore";
import { firestore } from '../firebase';
import Menu from '../components/Menu.js';
import { Link } from 'react-router-dom';

const InterestedPage = () => {
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
                }));

                // Fetch user's current goals
                const userQuery = query(collection(firestore, "users"), where("Username", "==", "Wendy237")); // Replace with actual username
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    const titles = userSnapshot.docs[0].data().interested_list || [];
                    
                    

                    const filterGoals = allGoals.filter(goal => titles.includes(goal.titlelc));

                    setGoals(filterGoals);
                }
            } catch (error) {
                console.error("Error fetching goals: ", error);
            }
        };

        fetchGoals();
    }, [goals]);

    return (
        <div>
            <Menu />
            <h1>Interested</h1>

            {goals.length === 0 ? <Link to={`/suggestion`}> Add a goal to Interested List! </Link> : <></>}
            
            <div className="goal-list">
                {goals.map(goal => (
                    <div key={goal.id} className="goal-box">
                        <Link to={`/details-goal/${goal.title.toLowerCase().replace(/ /g, '-')}`} className="goal-link">
                            <h2>{goal.title}</h2>
                            {goal.url && <img src={goal.url} alt={goal.title} className="goal-image" />}
                            <p>Savers: {goal.savers}</p>
                            <p>Achievers: {goal.achievers}</p>
                            <p>Average Costs: {goal['average costs']}</p>
                            <p>Average Saving Days: {goal.asd}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InterestedPage;
