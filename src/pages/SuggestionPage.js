import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from "firebase/firestore";
import { firestore } from '../firebase';
import Menu from '../components/Menu.js';
import { Link } from 'react-router-dom';
import './SuggestionPage.css';
import sortIcon from '../assets/sort ascending icon.png';
import randomizeIcon from '../assets/randomize icon.png';

const SuggestionPage = () => {
    const [goals, setGoals] = useState([]);
    const [sortBy, setSortBy] = useState('savers');
    const [sortOrder, setSortOrder] = useState('desc');
    const [minCost, setMinCost] = useState(''); // State for minimum cost filter
    const [maxCost, setMaxCost] = useState(''); // State for maximum cost filter
    const [keywords, setKeywords] = useState([]);
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
                const userQuery = query(collection(firestore, "users"), where("Username", "==", "Percy0816")); // Replace with actual username
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    const userId = userSnapshot.docs[0].id;
                    const userGoalsQuery = query(collection(firestore, `users/${userId}/current_goals`));
                    const userGoalsSnapshot = await getDocs(userGoalsQuery);
                    const currentUserGoals = userGoalsSnapshot.docs.map(doc => doc.data().title);

                    const filteredGoals = selectedCategories.length > 0
                        ? allGoals.filter(goal => selectedCategories.some(category => goal.category.includes(category)))
                        : [];

                    const suggestedGoals = filteredGoals.filter(goal => !currentUserGoals.includes(goal.title));

                    const withinPriceGoals = suggestedGoals.filter(goal => {
                        const averageCost = goal['average costs'];
                        if ((minCost !== '' && averageCost < parseFloat(minCost)) || (maxCost !== '' && averageCost > parseFloat(maxCost))) {
                            return false;
                        }
                        return true;
                    });

                    let sortedGoals = suggestedGoals
                    if (sortBy !== 'random') {
                        sortedGoals = withinPriceGoals.sort((a, b) => {
                            const orderMultiplier = sortOrder === 'desc' ? 1 : -1;
                            if (sortBy === 'savers') {
                                return (b.savers - a.savers) * orderMultiplier;
                            } else if (sortBy === 'achievers') {
                                return (b.achievers - a.achievers) * orderMultiplier;
                            } else if (sortBy === 'total') {
                                return ((b.savers + (b.achievers || 0)) - (a.savers + (a.achievers || 0))) * orderMultiplier;
                            } else if (sortBy === 'costs') {
                                return (b['average costs'] - a['average costs']) * orderMultiplier;
                            } else if (sortBy === 'saving days') {
                                return (b.asd - a.asd) * orderMultiplier;
                            }
                            return 0;
                        });
                    } else {
                        sortedGoals = shuffleArray(withinPriceGoals);
                    }

                    const keyGoals = keywords.length === 0 ? sortedGoals : sortedGoals
                        .map(goal => ({
                            ...goal,
                            matchCount: keywords.reduce((count, keyword) => {
                                return count + (goal.titleKeywords.includes(keyword) ? 1 : 0);
                            }, 0)
                        }))
                        .sort((a, b) => b.matchCount - a.matchCount).filter(a => a.matchCount > 0);

                    setGoals(keyGoals);
                }
            } catch (error) {
                console.error("Error fetching goals: ", error);
            }
        };

        fetchGoals();
    }, [sortBy, selectedCategories, sortOrder, minCost, maxCost, keywords]);

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const modifySortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleCategoryChange = (event) => {
        const category = event.target.value;
        setSelectedCategories(prevCategories =>
            prevCategories.includes(category)
                ? prevCategories.filter(c => c !== category)
                : prevCategories.concat(category)
        );
    };

    const handleMinCostChange = (event) => {
        setMinCost(event.target.value);
    };

    const handleMaxCostChange = (event) => {
        setMaxCost(event.target.value);
    };

    const handleKeywordsChange = (event) => {
        setKeywords(event.target.value.toLowerCase().split(' '))
    }

    const shuffleArray = (array) => {
        let currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
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
                    <option value="costs">Costs</option>
                    <option value="saving days">Saving days</option>
                 </select>
                <button onClick={modifySortOrder} className="sort-button">
                    {sortBy === "random" ? (
                        <img src={randomizeIcon} alt="Randomize" className={`randomize-icon`} />
                    ) : (
                        <img src={sortIcon} alt="Sort" className={`sort-icon ${sortOrder}`} />
                    )}
                </button>
            </div>
            <div className="cost-filter">
                <label>Costs (£) in range: </label>
                <input id="min-cost" type="number" value={minCost} onChange={handleMinCostChange} />
                <label> to </label>
                <input id="max-cost" type="number" value={maxCost} onChange={handleMaxCostChange} />
            </div>
            <div className="search-filter">
                <label htmlFor="search-keyword">Search: </label>
                <input
                    id="search-keyword"
                    type="text"
                    onChange={handleKeywordsChange}
                    placeholder="Enter keywords"
                />
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
            {goals.length === 0 ? <p>No suggestion found</p> : <></>}
            <div className="goal-list">
                {goals.map(goal => (
                    <div key={goal.id} className="goal-box">
                        <Link to={`/details-goal/${goal.title.toLowerCase().replace(/ /g, '-')}`} className="goal-link">
                            <h2>{goal.title}</h2>
                            {goal.url && <img src={goal.url} alt={goal.title} className="goal-image" />}
                            <p>Savers: {goal.savers}</p>
                            <p>Achievers: {goal.achievers}</p>
                            <p>Average Costs: £{goal['average costs']}</p>
                            <p>Average Saving Days: {goal.asd}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestionPage;
