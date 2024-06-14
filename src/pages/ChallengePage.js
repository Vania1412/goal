import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, getDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase.js';
import Menu from '../components/Menu.js';
import { useGlobalState } from '../GlobalStateContext.js';

import './ChallengePage.css'; // Assuming you have a CSS file for styling

 
const ChallengePage = () => {
  const [challenges, setChallenges] = useState([]);
  const [challengeType, setChallengeType] = useState('');
  const [description, setDescription] = useState('');
  const [userLimit, setUserLimit] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invitees, setInvitees] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const { username } = useGlobalState();
  

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const q = query(collection(firestore, 'challenges'), where("status", "==", "ongoing"));
      const querySnapshot = await getDocs(q);
      const challengesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChallenges(challengesList);
    } catch (error) {
      console.error('Error fetching challenges: ', error);
    }
  };

  const handleCreateChallenge = async () => {
    if (!challengeType || !description || !userLimit || !endDate) {
      setError('All fields are required.');
      return;
    }

    try {
      const challengeDocRef = await addDoc(collection(firestore, 'challenges'), {
        type: challengeType,
        description: description,
        createdBy: username,
        participants: [username],
        invitees: selectedUsers,
        userLimit: parseInt(userLimit, 10),
        endDate: new Date(endDate),
        status: 'ongoing',
      });

      selectedUsers.forEach(async (user) => {
        const userQuery = query(collection(firestore, 'users'), where('Username', '==', user));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userDocRef = userSnapshot.docs[0].ref;
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          await updateDoc(userDocRef, {
            challenges: userData.challenges ? [...userData.challenges, challengeDocRef.id] : [challengeDocRef.id],
          });
        }
      });

      setChallengeType('');
      setDescription('');
      setUserLimit('');
      setEndDate('');
      setSelectedUsers([]);
      fetchChallenges();  
    } catch (error) {
      console.error('Error creating challenge: ', error);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      const challengeDocRef = doc(firestore, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeDocRef);
      const challengeData = challengeDoc.data();

      if (challengeData.invitees.length +challengeData.participants.length < challengeData.userLimit) {
        await updateDoc(challengeDocRef, {
          participant: [...challengeData.participant, username],
        });

        const userQuery = query(collection(firestore, 'users'), where('Username', '==', username));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userDocRef = userSnapshot.docs[0].ref;
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          await updateDoc(userDocRef, {
            challenges: userData.challenges ? [...userData.challenges, challengeId] : [challengeId],
          });
        }
        fetchChallenges();  
      } else {
        setError('This challenge is already full.');
      }
    } catch (error) {
      console.error('Error joining challenge: ', error);
    }
  };

  const handleInviteUser = (username) => {
    if (username && !selectedUsers.includes(username)) {
      setSelectedUsers([...selectedUsers, username]);
      setInvitees([]);
      setSearchUser('');
    }
  };

  const searchUsers = async (searchTerm) => {
    setSearchUser(searchTerm);
    if (searchTerm.length === 0) {
      setInvitees([]);
      return;
    }
    const userQuery = query(collection(firestore, 'users'), where('Username', '>=', searchTerm), where('Username', '<=', searchTerm + '\uf8ff'));
    const userSnapshot = await getDocs(userQuery);
    setInvitees(userSnapshot.docs.map(doc => doc.data().Username));
  };

  return (
    <div className="challenge-page">
      <Menu />
      <h2>Group Challenges</h2>
      <div className="create-challenge">
        <select
          value={challengeType}
          onChange={(e) => setChallengeType(e.target.value)}
        >
          <option value="">Select Challenge Type</option>
          <option value="Competitive">Competitive</option>
          <option value="Collaborative">Collaborative</option>
          <option value="Daily-target">Daily Target</option>
          <option value="Customise">Customise</option>
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the challenge"
        />
        <input
          type="number"
          value={userLimit}
          onChange={(e) => setUserLimit(e.target.value)}
          placeholder="User Limit"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />
        <button onClick={handleCreateChallenge}>Create Challenge</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="invite-users">
        <h3>Invite Users</h3>
        <input
          type="text"
          value={searchUser}
          placeholder="Search for users"
          onChange={(e) => searchUsers(e.target.value)}
        />
        <ul>
          {invitees.map((invitee) => (
            <li key={invitee} onClick={() => handleInviteUser(invitee)}>
              {invitee}
            </li>
          ))}
        </ul>
        <div>
          <h4>Selected Users</h4>
          <ul>
            {selectedUsers.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="ongoing-challenges">
        <h3>Challenges Joined</h3>
        <ul>
          {challenges.filter(challenge => challenge.participants.includes(username)).map((challenge) => {
            const endDate = challenge.endDate?.seconds
              ? new Date(challenge.endDate.seconds * 1000)
              : null;

            return (
              <li key={challenge.id}>
                <div>
                  <strong>{challenge.type} Challenge</strong>
                  <p>{challenge.description}</p>
                  <p>Ends on: {endDate ? endDate.toLocaleDateString() : 'N/A'}</p>
                  <p>Participants: {challenge.participants.length}/{challenge.userLimit}</p>
            
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="ongoing-challenges">
        <h3>Ongoing Challenges</h3>
        <ul>
          {challenges.filter(challenge => !challenge.participants.includes(username)).map((challenge) => {
            const endDate = challenge.endDate?.seconds
              ? new Date(challenge.endDate.seconds * 1000)
              : null;

            return (
              <li key={challenge.id}>
                <div>
                  <strong>{challenge.type} Challenge</strong>
                  <p>{challenge.description}</p>
                  <p>Ends on: {endDate ? endDate.toLocaleDateString() : 'N/A'}</p>
                  <p>Participants: {challenge.participants.length}/{challenge.userLimit}</p>
                  {challenge.invitees.length + challenge.participants.length < challenge.userLimit && (
                    <button onClick={() => handleJoinChallenge(challenge.id)}>Join Challenge</button>
                  )}
               
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ChallengePage;
