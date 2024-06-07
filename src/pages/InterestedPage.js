import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, updateDoc, increment, addDoc } from "firebase/firestore";
import { firestore } from '../firebase';
import Menu from '../components/Menu.js';
import { Link, useNavigate } from 'react-router-dom';

const InterestedPage = () => {
    const [goals, setGoals] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newGoalCosts, setNewGoalCosts] = useState(0);
    const [newGoalCategory, setNewGoalCategory] = useState('');
    const [goalAddData, setGoalAddData] = useState(null);
    const navigate = useNavigate();

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

    const handleSetGoal = () => {
        setShowModal(true);
        setNewGoalCosts(0);
        setNewGoalCategory('');
        document.body.style.overflow = 'hidden';
    };

    const handleAddNewGoal = async () => {
        
        try {
            const goalQuery = query(collection(firestore, "goals"), where("titlelc", "==", goalAddData.titlelc
            ));
            const goalSnapshot = await getDocs(goalQuery);

            if (!goalSnapshot.empty) {
                const goalDocRef = goalSnapshot.docs[0].ref;

                await updateDoc(goalDocRef, {
                    savers: increment(1),
                });
            }
            const userQuery = query(collection(firestore, 'users'), where('Username', '==', "Percy0816"));
            const userSnapshot = await getDocs(userQuery);
            const userDocRef = userSnapshot.docs[0].ref;
            if (!userSnapshot.empty) {
                const userId = userSnapshot.docs[0].id;
                const goalsCollectionRef = collection(firestore, `users/${userId}/current_goals`);
                const newGoalData = {
                    title: goalAddData.title,
                    progress: 0,
                    costs: parseFloat(newGoalCosts !== 0 ? newGoalCosts : goalAddData['average costs']),
                    category: newGoalCategory !== '' ? newGoalCategory : goalAddData.category[0]
                };
                await addDoc(goalsCollectionRef, newGoalData);
                const interestedList = userSnapshot.docs[0].data().interested_list || [];
                const updatedInterestedList = interestedList.filter(t => t !== goalAddData.titlelc);
                await updateDoc(userDocRef, { interested_list: updatedInterestedList });
                navigate('/home', { state: { message: `You have successfully added the goal: ${goalAddData.title}` } });
            } else {
                console.log('User not found');
            }
        } catch (error) {
            console.error('Error setting goal: ', error);
        }

        setShowModal(false);
        document.body.style.overflow = 'auto';
    };

    const handleModalClose = () => {
        setShowModal(false);
        document.body.style.overflow = 'auto';
    };

    const handleRemoveGoal = async (removeTitle) => {
        const userQuery = query(collection(firestore, 'users'), where('Username', '==', "Percy0816"));
        const userSnapshot = await getDocs(userQuery);
        const userDocRef = userSnapshot.docs[0].ref;

        if (!userSnapshot.empty) {
            const interestedList = userSnapshot.docs[0].data().interested_list || [];
            const updatedInterestedList = interestedList.filter(t => t !== removeTitle);
            await updateDoc(userDocRef, { interested_list: updatedInterestedList });
        }
    };

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
                            <p>Average Costs: £{goal['average costs']}</p>
                            <p>Average Saving Days: {goal.asd}</p>
                        </Link>
                        
                        <button className="set-goal-button" onClick={() => {setGoalAddData(goal); handleSetGoal()}}>Set Goal</button>
                        <button className="set-goal-button" onClick={() => handleRemoveGoal(goal.titlelc)}>Remove</button>
                    </div>
                    
                ))}
            </div>
            {showModal && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h2 className="modal-title">Add New Goal</h2>
                                    <div className="modal-input">
                                        <label htmlFor="new-goal-title">Goal: {goalAddData.title}</label>
                                    </div>
                                    <div className="modal-input">
                                        <label htmlFor="new-goal-costs">Costs:</label>
                                        <input
                                            type="number"
                                            id="new-goal-costs"
                                            value={newGoalCosts !== 0 ? newGoalCosts : goalAddData['average costs']}
                                            onChange={(e) => setNewGoalCosts(e.target.value)}
                                        />
                                    </div>
                                    <div className="modal-input">
                                        <label htmlFor="new-goal-category">Category:</label>
                                        <select
                                            id="new-goal-category"
                                            value={newGoalCategory !== '' ? newGoalCategory : goalAddData.category[0]}
                                            onChange={(e) => setNewGoalCategory(e.target.value)}
                                        >
                                            <option value="">Select a category</option>
                                            <option value="Tech Gadgets">Tech Gadgets</option>
                                            <option value="Fashion and Accessories">Fashion and Accessories</option>
                                            <option value="Travel">Travel</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="Education and Personal Development">Education and Personal Development</option>
                                            <option value="Social and Lifestyle">Social and Lifestyle</option>
                                        </select>
                                    </div>
                                    <button className="modal-button" onClick={handleAddNewGoal}>Confirm</button>
                                    <button className="modal-close" onClick={handleModalClose}>Close</button>
                                </div>
                            </div>
                        )}
        </div>
    );
};

export default InterestedPage;
