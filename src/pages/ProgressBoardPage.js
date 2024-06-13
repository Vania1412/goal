import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, arrayUnion, addDoc, increment, serverTimestamp } from "firebase/firestore";
import { firestore } from '../firebase';
import { useGlobalState } from '../GlobalStateContext.js';
import { useNavigate } from 'react-router-dom';
import { update } from 'firebase/database';


const ProgressBoardPage = () => {
    const { username, totalSaving, unclaimedSaving, setUnclaimedSaving, allUnclaimed } = useGlobalState();
    const [progressUpdates, setProgressUpdates] = useState([]);
    const [modifyCelebratedUsers, setModifyCelebratedUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState(null);
    const [newGoalCosts, setNewGoalCosts] = useState(0);
    const [newGoalCategory, setNewGoalCategory] = useState('');
    const [averageCosts, setAverageCosts] = useState(0);
    const [category, setCategory] = useState('');
    const [userGoals, setUserGoals] = useState([]);
    const [userNotClaim, setUserNotClaim] = useState([]);
    const [userAchievedGoals, setUserAchievedGoals] = useState([]);
    const [tips, setTips] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchUserGoals = async () => {
            try {
                const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    const userId = userSnapshot.docs[0].id;
                    const userGoalsQuery = query(collection(firestore, `users/${userId}/current_goals`));
                    const userGoalsSnapshot = await getDocs(userGoalsQuery);
                    const currentUserGoals = userGoalsSnapshot.docs.filter(doc => doc.data().progress !== 100).map(doc => doc.data().title);
                    const currentNotClaim = userGoalsSnapshot.docs.filter(doc => doc.data().progress === 100).map(doc => doc.data().title);

                    setUserGoals(currentUserGoals);
                    setUserNotClaim(currentNotClaim);
                }
            } catch (error) {
                console.error("Error fetching user goals:", error);
            }
        };
        const fetchUserAchievedGoals = async () => {
            try {
                const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    const userId = userSnapshot.docs[0].id;
                    const userGoalsQuery = query(collection(firestore, `users/${userId}/achieved_goals`));
                    const userGoalsSnapshot = await getDocs(userGoalsQuery);
                    const currentUserGoals = userGoalsSnapshot.docs.map(doc => doc.data().title);

                    setUserAchievedGoals(currentUserGoals);
                }
            } catch (error) {
                console.error("Error fetching user goals:", error);
            }
        };
        const fetchProgressUpdates = async () => {
            try {
                const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    const userData = userSnapshot.docs[0].data();
                    const following = userData.following || [];

                    if (following.length > 0) {
                        const updatesQuery = query(
                            collection(firestore, "progressUpdates"),
                            orderBy("timestamp", "desc")
                        );
                        const updatesSnapshot = await getDocs(updatesQuery);
                        const updatesData = updatesSnapshot.docs.map(doc => ({
                            ...doc.data(),
                            id: doc.id
                        }));
                        const filterFollowing = updatesData.filter(doc => following.includes(doc.username) || doc.username === username);
                        setProgressUpdates(filterFollowing);
                    }
                } else {
                    console.log("User not found");
                }
            } catch (error) {
                console.error("Error fetching progress updates:", error);
            }
        };

        fetchUserGoals();
        fetchUserAchievedGoals();

        fetchProgressUpdates();
    }, [username, modifyCelebratedUsers]);

    const handleTips = async (update) => {
        doc(firestore, `progressUpdates`, update.id)
        //add new doc to the collection tips with tips: tips, username: username

    }

    const handleSupport = async (update) => {
        try {
            if (update.progress === 0) {
                const q = query(collection(firestore, 'goals'), where('titlelc', '==', update.goalTitle.toLowerCase()));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const data = querySnapshot.docs[0].data();
                    setTitle(data.title);
                    setAverageCosts(data['average costs']);
                    setCategory(data.category[0]);
                    setShowModal(true);
                    handleAddNewGoal(update);
                    document.body.style.overflow = 'hidden';
                }





                console.log(`Joined the goal "${update.goalTitle}" successfully!`);
            } else {

                await updateDoc(doc(firestore, `progressUpdates`, update.id), {
                    celebrations: arrayUnion(username)
                });
                setModifyCelebratedUsers(modifyCelebratedUsers + 1)


                console.log(`Celebrated the progress of "${update.goalTitle}" successfully!`);
            }
        } catch (error) {
            console.error("Error handling button click:", error);
        }
    };

    const handleView = async (update) => {
        navigate(`/details-goal/${update.goalTitle.toLowerCase().replace(/ /g, '-')}`)
    }

    const handleModalClose = () => {
        setShowModal(false);
        document.body.style.overflow = 'auto';
    };

    const handleAddNewGoal = async () => {
        try {
            const goalQuery = query(collection(firestore, "goals"), where("titlelc", "==", title.toLowerCase()));
            const goalSnapshot = await getDocs(goalQuery);

            if (!goalSnapshot.empty) {
                const goalDocRef = goalSnapshot.docs[0].ref;

                await updateDoc(goalDocRef, {
                    savers: increment(1),
                });
            }
            const userQuery = query(collection(firestore, 'users'), where('Username', '==', username));
            const userSnapshot = await getDocs(userQuery);
            const userDocRef = userSnapshot.docs[0].ref;
            if (!userSnapshot.empty) {
                const userId = userSnapshot.docs[0].id;
                const goalsCollectionRef = collection(firestore, `users/${userId}/current_goals`);
                const newGoalData = {
                    title: title,
                    progress: 0,
                    costs: parseFloat(newGoalCosts !== 0 ? newGoalCosts : averageCosts),
                    category: newGoalCategory !== '' ? newGoalCategory : category
                };

                await addDoc(collection(firestore, "progressUpdates"), {
                    username,
                    goalTitle: title,
                    progress: 0,
                    timestamp: serverTimestamp(),
                    celebrations: []
                });

                let costFloat = 0;
                const remainSaving = totalSaving - unclaimedSaving;
                if (remainSaving > 0 && allUnclaimed) {
                    costFloat = newGoalData.costs;
                    if (remainSaving >= costFloat) {
                        newGoalData.progress = 100;
                        await addDoc(collection(firestore, "progressUpdates"), {
                            username,
                            goalTitle: title,
                            progress: 50,
                            timestamp: serverTimestamp(),
                            celebrations: []
                          });
                           await addDoc(collection(firestore, "progressUpdates"), {
                            username,
                            goalTitle: title,
                            progress: 100,
                            timestamp: serverTimestamp(),
                            celebrations: []
                          });
                        setUnclaimedSaving(unclaimedSaving + costFloat);
                    } else {
                        if (Math.floor((remainSaving / costFloat) * 100) >= 50 && newGoalData.progress < 50) {
                            await addDoc(collection(firestore, "progressUpdates"), {
                              username,
                              goalTitle: title,
                              progress: 50,
                              timestamp: serverTimestamp(),
                              celebrations: []
                            });
                          } 
                        newGoalData.progress = Math.floor((remainSaving / costFloat) * 100);
                    }
                }


                await addDoc(goalsCollectionRef, newGoalData);
                const interestedList = userSnapshot.docs[0].data().interested_list || [];
                const updatedInterestedList = interestedList.filter(t => t !== update.goalTitle.toLowerCase());
                await updateDoc(userDocRef, { interested_list: updatedInterestedList });
                setShowModal(false);
                document.body.style.overflow = 'auto';
                navigate('/home', { state: { message: `You have successfully added the goal: ${title}` } });
            } else {
                console.log('User not found');
            }
        } catch (error) {
            console.error('Error setting goal: ', error);
        }
    };



    return (
        <div>
            <h2>Progress Board</h2>
            <ul>
                {progressUpdates.map((update, index) => (
                    <li key={index} className="progress-update-box">
                        <div className="progress-update-content">
                            {update.progress === 0 ?
                                <p>{update.username} has created a new goal "{update.goalTitle}"</p>
                                : (
                                    <p>
                                        {update.username} has reached {update.progress}% of their goal "{update.goalTitle}"
                                        {(update.celebrations && update.celebrations.length > 0) && (
                                            <span> ({update.celebrations.length} {update.celebrations.length === 1 ? "user" : "users"} celebrated)</span>
                                        )}
                                    </p>
                                )}
                        </div>
                        {(userNotClaim.includes(update.goalTitle) || userAchievedGoals.includes(update.goalTitle)) &&
                        update.username !== username && update.progress === 0 &&
                            <div><p> You have achieved this goal before, any special tips and advice for {update.username}</p>
                                <input
                                    type="text"
                                    placeholder="Enter tips or advice"
                                    value={tips}
                                    onChange={(e) => setTips(e.target.value)}
                                /></div>}
                        <div className="progress-update-buttons">
                            {(update.username !== username) && (update.progress === 0 ? (
                                (userGoals.includes(update.goalTitle)) ? (
                                    <p>You are sharing the same goal with {update.username}</p>
                                ) : (
                                    <>
                                        <button onClick={() => handleView(update)}>View Goal Detail</button>
                                        <button onClick={() => handleSupport(update)}>Join</button>
                                    </>
                                )
                            ) : (
                                <>
                                    <button onClick={() => handleSupport(update)}>Celebrate</button>
                                </>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Add New Goal</h2>
                        <div className="modal-input">
                            <label htmlFor="new-goal-title">Goal: {title}</label>
                        </div>
                        <div className="modal-input">
                            <label htmlFor="new-goal-costs">Costs:</label>
                            <input
                                type="number"
                                id="new-goal-costs"
                                value={newGoalCosts !== 0 ? newGoalCosts : averageCosts}
                                onChange={(e) => setNewGoalCosts(e.target.value)}
                            />
                        </div>
                        <div className="modal-input">
                            <label htmlFor="new-goal-category">Category:</label>
                            <select
                                id="new-goal-category"
                                value={newGoalCategory !== '' ? newGoalCategory : category}
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
                        <button className="modal-button" onClick={() => handleAddNewGoal()}>Confirm</button>
                        <button className="modal-close" onClick={handleModalClose}>Close</button>
                    </div>
                </div>
            )}
        </div>

    );
}

export default ProgressBoardPage;
