import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase.js';
import Menu from '../components/Menu.js';
import { useGlobalState } from '../GlobalStateContext.js';
import { useNavigate } from 'react-router-dom';


import './ChallengePage.css';  


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
  const [targetAmount, setTargetAmount] = useState('');
  const { username } = useGlobalState();
  const navigate = useNavigate();

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
        targetAmount: challengeType === 'Collaborative' ? parseFloat(targetAmount) : null,

      });
      await addDoc(collection(firestore, "progressUpdates"), {
        username,
        challengeType,
        timestamp: serverTimestamp(),
      });

      selectedUsers.forEach(async (user) => {
        await addDoc(collection(firestore, "progressUpdates"), {
          username,
          challengeType,
          timestamp: serverTimestamp(),
          invite: user,
          challengeId: challengeDocRef.id
        });
      })
   

      setChallengeType('');
      setDescription('');
      setUserLimit('');
      setEndDate('');
      setSelectedUsers([]);
      setTargetAmount('');
      fetchChallenges();
    } catch (error) {
      console.error('Error creating challenge: ', error);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    const challengeRef = doc(firestore, 'challenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);

    if (challengeDoc.exists()) {
      const challengeData = challengeDoc.data();
      if (challengeData.participants.includes(username)) {
        alert('You have already joined this challenge.');
        return;
      }

      await updateDoc(challengeRef, {
        participants: [...challengeData.participants, username]
      });

      // Update local state to reflect the change immediately
      setChallenges(prevChallenges =>
        prevChallenges.map(challenge =>
          challenge.id === challengeId
            ? { ...challenge, participants: [...challenge.participants, username] }
            : challenge
        )
      );
    }
  };

  const handleInviteUser = async (username) => {
    if (username && !selectedUsers.includes(username)) {
      setSelectedUsers([...selectedUsers, username]);
      
      setInvitees([]);
      setSearchUser('');
    }
  };

  const handleRemoveUser = async (username) => {
      setSelectedUsers(selectedUsers.filter(user => user !== username));
      
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
    <div className="container">
      <Menu />
      <h2>Group Challenges</h2>
      <div className="create-challenge">
        <div className="input-group">
          <label htmlFor="challengeType">Challenge Type:</label>
          <select
            id="challengeType"
            value={challengeType}
            onChange={(e) => setChallengeType(e.target.value)}
          >
            <option value="">Select Challenge Type</option>
            <option value="Competitive">Competitive</option>
            <option value="Collaborative">Collaborative</option>
            <option value="Customise">Customise</option>
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the challenge"
          />
        </div>
        <div className="input-group">
          <label htmlFor="userLimit">User Limit:</label>
          <input
            type="number"
            id="userLimit"
            value={userLimit}
            onChange={(e) => setUserLimit(e.target.value)}
            placeholder="User Limit"
          />
        </div>
        <div className="input-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
          />
        </div>

        {challengeType === 'Collaborative' && (
          <div className="input-group">
            <label htmlFor="endDate">Target Amount per User:</label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Target Amount per User"
            />
          </div>
        )}

        

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="invite-group">
        <h3>Invite Users to Join!</h3>
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
              <li key={user} onClick={() => handleRemoveUser(user)}>
              {user}
            </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="input-group">
          <button onClick={handleCreateChallenge}>Create Challenge</button>
        </div>
      </div>
      <div className="ongoing-challenges">
        <h3>Your Challenges</h3>
        <ul>
          {challenges.filter(challenge => challenge.participants.includes(username)).map((challenge) => {
            const endDate = challenge.endDate ? challenge.endDate.toDate() : null;
            return (
              <li key={challenge.id} onClick={() => navigate(`/challenge/${challenge.id}`)}>
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
