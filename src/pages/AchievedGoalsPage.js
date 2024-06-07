import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, addDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import Menu from '../components/Menu.js';
import { Link } from 'react-router-dom';


const AchievedGoalsPage = () => {
  const [achievedGoals, setAchievedGoals] = useState([]);
  const [successMessage, setMessage] = useState('');

  useEffect(() => {
    const fetchAchievedGoals = async () => {
      try {
        const userQuery = query(collection(firestore, 'users'), where("Username", "==", "Percy0816"));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsQuery = query(collection(firestore, `users/${userId}/achieved_goals`));
          const goalsSnapshot = await getDocs(goalsQuery);
          const goalsData = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAchievedGoals(goalsData);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error('Error fetching achieved goals:', error);
      }
    };
    fetchAchievedGoals();
  }, []);

  const handleShare = async (itemId, text, originalText, itemTitle) => {
    if (text !== undefined && text !== originalText) {
      try {
        // Query the user collection to find the document with the username "Percy0816"
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Percy0816"));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          // Update the "S&T" field of the corresponding achieved goal document under the user's document
          await updateDoc(doc(firestore, `users/${userId}/achieved_goals`, itemId), {
            's&t': text
          });

          // Update the "featured_s&t" collection within the goal document
          const goalDocQuery = query(collection(firestore, "goals"), where("title", "==", itemTitle));

          const goalSnapshot = await getDocs(goalDocQuery);
          if (!goalSnapshot.empty) {
            const goalData = goalSnapshot.docs[0].data();
            const goalDataRef = goalSnapshot.docs[0].ref;
            const goalId = goalSnapshot.docs[0].id;

            // Check if the "featured_s&t" collection exists
            if (!goalData['featured_s&t']) {
              // Create the "featured_s&t" collection if it doesn't exist
              await setDoc(doc(firestore, `goals/${goalId}/featured_s&t/initialDoc`), {
                username: userSnapshot.docs[0].data().Username,
                content: text,
                useful: []
              });
            } else {
              // Update or add a new document in the "featured_s&t" collection
              const featuredSTQuery = query(collection(firestore, `goals/${goalId}/featured_s&t`), where('username', '==', userSnapshot.docs[0].data().Username));
              const featuredSTSnapshot = await getDocs(featuredSTQuery);

              if (!featuredSTSnapshot.empty) {
                // Update the existing document in the "featured_s&t" collection
                const docRefToUpdate = featuredSTSnapshot.docs[0].ref;
                await updateDoc(docRefToUpdate, {
                  content: text  //maybe a record show it is updated
                });
              } else {
                // Add a new document to the "featured_s&t" collection
                await addDoc(collection(goalDataRef, 'featured_s&t'), {
                  username: userSnapshot.docs[0].data().Username,
                  content: text
                });
              }
            }
          }


          setAchievedGoals(prevGoals => prevGoals.map(goal => {
            if (goal.id === itemId) {
              return { ...goal, 's&t': text };
            }
            return goal;
          }));

          if (text !== '') {
            setMessage('Shared successfully!');
          } else {
            setMessage('Deleted successfully!');
          }
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error('Error sharing Stories & Tips:', error);
        setMessage('Error sharing Stories & Tips');
      }
    } else {
      setMessage('Please modify.');
    }
    setTimeout(() => {
      setMessage('');
    }, 2000);
  };


  return (
    <div className="container">
      <Menu />
      <h1>Achieved Goals</h1>
      {achievedGoals.length === 0 ? <Link to={`/home`}> Keep saving and achieve your first goal! </Link> : <></>}
      {achievedGoals.map(item => (
        <div key={item.id} className="goalItem">
          <p className="goalText">Title: {item.title}</p>
          <p className="goalText">Expected Costs: £{item['expected costs']}</p>
          <p className="goalText">Actual Costs: £{item['actual costs']}</p>
          <p className="goalText">Saving Days: {item['saving days']}</p>
          <p className="goalText">Shared Stories & Tips:</p>
          {item['s&t'] ? (
            <div>
              <input
                className="input"
                defaultValue={item['s&t']}
                onChange={(e) => {
                  const updatedGoals = achievedGoals.map(goal => {
                    if (goal.id === item.id) {
                      return { ...goal, st: e.target.value };
                    }
                    return goal;
                  });
                  setAchievedGoals(updatedGoals);
                }}
              />
              <button onClick={() => handleShare(item.id, item.st, item['s&t'], item.title)}>
                Update
              </button>
            </div>
          ) : (
            <div>
              <input
                className="input"
                placeholder="Any Stories and Tips?"
                onChange={(e) => item.st = e.target.value}
              />
              <button onClick={() => handleShare(item.id, item.st, '')}>
                Share
              </button>
            </div>
          )}
        </div>
      ))}
      {successMessage && (
        <div className="modal">
          <p className="modalText">{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AchievedGoalsPage;
