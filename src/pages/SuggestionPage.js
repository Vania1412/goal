import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from "firebase/firestore";
import { firestore } from '../firebase';
import Menu from '../components/Menu.js';
import { Link } from 'react-router-dom';
import './SuggestionPage.css';

const SuggestionPage = () => {
    const [goals, setGoals] = useState([]);
    const [sortBy, setSortBy] = useState('savers');

    const categories = ["Tech Gadgets", "Fashion and Accessories", "Travel", "Entertainment", "Education and Personal Development", "Social and Lifestyle"];
    const [selectedCategories, setSelectedCategories] = useState(categories);


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

                    const filteredGoals = selectedCategories.length > 0
                        ? allGoals.filter(goal => selectedCategories.some(category => goal.category.includes(category)))
                        : [];
        
                    // Filter out goals that are not in the current user's goals
                    const suggestedGoals = filteredGoals.filter(goal => !currentUserGoals.includes(goal.title));
        
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
    }, [sortBy, selectedCategories]);

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const handleCategoryChange = (event) => {
        const category = event.target.value;
        setSelectedCategories(prevCategories =>
            prevCategories.includes(category)
                ? prevCategories.filter(c => c !== category)
                : prevCategories.concat(category)
        );
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
            <div>
                <label>Filter by categories:</label>
                {categories.map(category => (
                    <div key={category}>
                        <input
                            type="checkbox"
                            id={category}
                            value={category}
                            checked={selectedCategories.includes(category)}
                            onChange={handleCategoryChange}
                        />
                        <label htmlFor={category}>{category}</label>
                    </div>
                ))}
            </div>
            <div className="goal-list">
                {goals.map(goal => (
                    <div key={goal.id} className="goal-box">
                        <Link to={`/details-goal/${goal.title.toLowerCase().replace(/ /g, '-')}`} className="goal-link">
                            <h2>{goal.title}</h2>
                            {goal.url && <img src={goal.url} alt={goal.title} className="goal-image" />}
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
