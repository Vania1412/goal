// src/utils/handleEndOfMonthResults.js

import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const handleEndOfMonthResults = async () => {
  const competitionsQuery = query(collection(firestore, 'competitions'), where('endDate', '<=', new Date()));
  const competitionsSnapshot = await getDocs(competitionsQuery);

  competitionsSnapshot.docs.forEach(async (competitionDoc) => {
    const competitionData = competitionDoc.data();
    const participants = competitionData.participants;
    const savings = await Promise.all(participants.map(async username => {
      const userDoc = await getDoc(doc(firestore, 'users', username));
      return { username, savings: userDoc.data().savings || 0 };
    }));
    savings.sort((a, b) => b.savings - a.savings);

    const top3 = savings.slice(0, 3);
    await Promise.all(top3.map(async user => {
      await updateDoc(doc(firestore, 'users', user.username), {
        badges: arrayUnion('Top 3 Saver')
      });
    }));
    const lowPerformers = savings.filter(user => user.savings < 0.4 * savings[0].savings);
    await Promise.all(lowPerformers.map(async user => {
      // Announce low performance on progress board
    }));
  });

  const collaborationsQuery = query(collection(firestore, 'collaborations'), where('endDate', '<=', new Date()));
  const collaborationsSnapshot = await getDocs(collaborationsQuery);

  collaborationsSnapshot.docs.forEach(async (collaborationDoc) => {
    const collaborationData = collaborationDoc.data();
    const participants = collaborationData.participants;
    const totalSavings = await Promise.all(participants.map(async username => {
      const userDoc = await getDoc(doc(firestore, 'users', username));
      return userDoc.data().savings || 0;
    })).reduce((sum, savings) => sum + savings, 0);

    if (totalSavings >= collaborationData.targetAmount) {
      await Promise.all(participants.map(async user => {
        await updateDoc(doc(firestore, 'users', user), {
          badges: arrayUnion('Collaborative Saver')
        });
      }));
    } else {
      await Promise.all(participants.map(async user => {
        // Announce failure on progress board
      }));
    }
  });
};

export default handleEndOfMonthResults;
