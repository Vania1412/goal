// src/utils/matchUsersForChallenges.js

import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const matchUsersForChallenges = async (username, challengeType) => {
  const userQuery = query(collection(firestore, 'users'), where('connections', 'array-contains', username));
  const userSnapshot = await getDocs(userQuery);
  const userList = userSnapshot.docs.map(doc => doc.data().username);

  if (challengeType === 'competition') {
    const competitors = userList.slice(0, 10);
    const competitionRef = await addDoc(collection(firestore, 'competitions'), {
      participants: [username, ...competitors],
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      type: 'competition'
    });
    return competitionRef.id;
  } else if (challengeType === 'collaboration') {
    const collaborators = userList.slice(0, 10);
    const collaborationRef = await addDoc(collection(firestore, 'collaborations'), {
      participants: [username, ...collaborators],
      targetAmount: 10000, // Example target amount
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      type: 'collaboration'
    });
    return collaborationRef.id;
  }
};

export default matchUsersForChallenges;
