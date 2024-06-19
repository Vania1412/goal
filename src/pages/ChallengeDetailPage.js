import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, collection, query, where, onSnapshot, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../firebase.js';
import Menu from '../components/Menu.js';
import { useGlobalState } from '../GlobalStateContext.js';
import './ChallengeDetailPage.css';

const ChallengeDetailPage = () => {
    const { challengeId } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [participantSavings, setParticipantSavings] = useState([]);
    const [totalSavings, setTotalSavings] = useState(0);
    const [showJoin, setShowJoin] = useState(false);
    const { username } = useGlobalState();


    useEffect(() => {
        const docRef = doc(firestore, 'challenges', challengeId);
        const unsubscribeChallenge = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                const challengeData = docSnap.data();
                setChallenge(challengeData);
                if (!challengeData.participants.includes(username)) {
                    setShowJoin(true);
                }
                await setupParticipantListeners(challengeData.participants);
            }
        });


        const participantUnsubscribes = [];
        const unsubscribeParticipants = () => {
            participantUnsubscribes.forEach(unsub => unsub());
        };

        const setupParticipantListeners = async (participants) => {
            unsubscribeParticipants();
            let savingsSum = 0;
            const savingsData = [];
            participants.forEach((username) => {
                const userQuery = query(collection(firestore, 'users'), where('Username', '==', username));
                const userUnsubscribe = onSnapshot(userQuery, (querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const userData = doc.data();
                        const existingParticipant = savingsData.find((p) => p.username === username);
                        if (existingParticipant) {
                            savingsSum -= existingParticipant.savings;
                            existingParticipant.savings = userData['total saving'] || 0;
                            savingsSum += existingParticipant.savings;
                        } else {
                            const savings = userData['total saving'] || 0;
                            savingsData.push({ username, savings });
                            savingsSum += savings;
                        }
                        savingsData.sort((a, b) => b.savings - a.savings);
                        setParticipantSavings([...savingsData]);
                        setTotalSavings(savingsSum);
                    });
                });
                participantUnsubscribes.push(userUnsubscribe);
            });
        };

        return () => {
            unsubscribeChallenge();
            unsubscribeParticipants();
        };
    }, [challengeId, username]);

    const handleJoinChallenge = async () => {
        const challengeRef = doc(firestore, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);

        if (challengeDoc.exists()) {

            await updateDoc(challengeRef, {
                participants: arrayUnion(username)
            });
            setShowJoin(false);

        }
    };



    if (!challenge) {
        return <div>Loading...</div>;
    }

    const combinedTargetSavings = challenge.targetAmount * challenge.participants.length;
    const endDate = challenge.endDate ? challenge.endDate.toDate() : null;

    return (
        <div className="container">
            <Menu />
            <div className="challenge-detail-container">
                <h2>Challenge</h2>
                <p className="challenge-description">Mode: {challenge.type}</p>
                <p className="challenge-description">Description: {challenge.description}</p>
                <p className="challenge-end-date">Ends on: {endDate ? endDate.toLocaleDateString() : 'N/A'}</p>
                <p className="challenge-participants">Participants: {challenge.participants.length}/{challenge.userLimit}</p>

                {challenge.type === 'Competitive' && (
                    <div className="rankings">
                        <h3>Current Rankings</h3>
                        <ul>
                            {participantSavings.map((participant, index) => (
                                <li key={index}>
                                    Rank {index + 1}: <Link
                                to={`/profile/${participant.username.toLowerCase()}`}
                                className="goal-link"
                              >
                                {participant.username}
                              </Link> --- £{participant.savings}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {challenge.type === 'Collaborative' && (
                    
                    <div className="progress">
                        <ul>
                            {challenge.participants.map(participant => (
                                <Link
                                to={`/profile/${participant.toLowerCase()}`}
                                className="goal-link"
                              >
                                {participant}
                              </Link>
                            ))}
                        </ul>
                        <h3>Progress</h3>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${(totalSavings / combinedTargetSavings) * 100}%`,
                                }}
                            ></div>
                        </div>
                        <p className="progress-text">{totalSavings}/{combinedTargetSavings} saved</p>
                    </div>
                )}
            </div>
            {showJoin && <button className = "progress-button" onClick={handleJoinChallenge}>Join Challenge</button>}
        </div>
    );
};

export default ChallengeDetailPage;
