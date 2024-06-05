import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from "firebase/firestore";
import { firestore } from '../firebase';
import Menu from '../components/Menu.js';
import { Link } from 'react-router-dom';
import './SuggestionPage.css';

const SuggestionPage = () => {
    const [goals, setGoals] = useState([]);
    const [sortBy, setSortBy] = useState('savers');

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
                    const userId = userSnapshot.docs[0].id;
                    const userGoalsQuery = query(collection(firestore, `users/${userId}/current_goals`));
                    const userGoalsSnapshot = await getDocs(userGoalsQuery);
                    const currentUserGoals = userGoalsSnapshot.docs.map(doc => doc.data().title);
        
                    // Filter out goals that are not in the current user's goals
                    const suggestedGoals = allGoals.filter(goal => !currentUserGoals.includes(goal.title));
        
                    // Sort the goals based on the selected sort option
                    const sortedGoals = suggestedGoals.sort((a, b) => {
                        if (sortBy === 'savers') {
                            return b.savers - a.savers;
                        } else if (sortBy === 'achievers') {
                            return b.achievers - a.achievers;
                        } else if (sortBy === 'total') {
                            return (b.savers + (b.achievers || 0)) - (a.savers + (a.achievers || 0));
                        }
                        return 0;
                    });
        
                    setGoals(sortedGoals);
                } else {
                    // If user not found, set all goals without filtering
                    setGoals(allGoals);
                }
            } catch (error) {
                console.error("Error fetching goals: ", error);
            }
        };

        fetchGoals();
    }, [sortBy]);

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    return (
        <div>
            <Menu />
            <h1>Suggested Goals</h1>
            <div>
                <label htmlFor="sort-select">Sort by: </label>
                <select id="sort-select" value={sortBy} onChange={handleSortChange}>
                    <option value="savers">Savers</option>
                    <option value="achievers">Achievers</option>
                    <option value="total">Total</option>
                </select>
            </div>
            <div className="goal-list">
                {goals.map(goal => (
                    <div key={goal.id} className="goal-box">
                        <Link to={`/details-goal/${goal.title.toLowerCase().replace(/ /g, '-')}`} className="goal-link">
                            <h2>{goal.title}</h2>
                            <p>Savers: {goal.savers}</p>
                            <p>Achievers: {goal.achievers}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestionPage;
