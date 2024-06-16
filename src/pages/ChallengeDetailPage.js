import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebase.js';
import Menu from '../components/Menu.js';
import './ChallengeDetailPage.css';

const ChallengeDetailPage = () => {
    const { challengeId } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [participantSavings, setParticipantSavings] = useState([]);
    const [totalSavings, setTotalSavings] = useState(0);

    useEffect(() => {
        const docRef = doc(firestore, 'challenges', challengeId);
        const unsubscribeChallenge = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                const challengeData = docSnap.data();
                setChallenge(challengeData);
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
    }, [challengeId]);

 
   

    

    if (!challenge) {
        return <div>Loading...</div>;
    }

    const combinedTargetSavings = challenge.targetAmount * challenge.participants.length;
    const endDate = challenge.endDate ? challenge.endDate.toDate() : null;

    return (
        <div className="challenge-detail-page">
            <Menu />
            <div className="challenge-detail-container">
                <h2>{challenge.type} Challenge</h2>
                <p className="challenge-description">{challenge.description}</p>
                <p className="challenge-end-date">Ends on: {endDate ? endDate.toLocaleDateString() : 'N/A'}</p>
                <p className="challenge-participants">Participants: {challenge.participants.length}/{challenge.userLimit}</p>

                {challenge.type === 'Competitive' && (
                    <div className="rankings">
                        <h3>Current Rankings</h3>
                        <ul>
                            {participantSavings.map((participant, index) => (
                                <li key={index}>
                                    Rank {index + 1}: {participant.username} --- £{participant.savings}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {challenge.type === 'Collaborative' && (
                    <div className="progress">
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
        </div>
    );
};

export default ChallengeDetailPage;
