import React, { useState, useEffect } from 'react';
import { collection, query, where, addDoc, getDocs, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { firestore } from '../firebase';
import { Link, useLocation } from 'react-router-dom';
import Menu from '../components/Menu.js';
import './HomePage.css';
import { useGlobalState } from '../GlobalStateContext.js';


/*import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";*/


const HomePage = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [saving, setSaving] = useState('');
  const [cost, setCost] = useState('');
  const [savingGoal, setSavingGoal] = useState('');
  const [interestsNumber, setInterestsNumber] = useState(0);
  // const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState('');
  // const [totalSaving, setTotalSaving] = useState(0);
  const [espm, setEspm] = useState(0);
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  //  const [unclaimedSaving, setUnclaimedSaving] = useState(0);
  // const [allUnclaimed, setAllUnclaimed] = useState(false);
  const { totalSaving, setTotalSaving, unclaimedSaving, setUnclaimedSaving, allUnclaimed, setAllUnclaimed } = useGlobalState();


  useEffect(() => {
    const fetchGoals = async () => {
      try {
        // Construct a query to fetch goals for the user with username "Percy0816"
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Percy0816"));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          let unclaimed = 0;
          const goalsProgressRef = query(collection(firestore, `users/${userId}/current_goals`), where("progress", "==", 100));
          const goalProgressSnapshot = await getDocs(goalsProgressRef);
          if (!goalProgressSnapshot.empty) {
            goalProgressSnapshot.docs.forEach(doc => {
              const goalData = doc.data();
              unclaimed += goalData.costs;
            });
          }
          setUnclaimedSaving(unclaimed);
          const goalsQuery = query(collection(firestore, `users/${userId}/current_goals`));
          const goalsSnapshot = await getDocs(goalsQuery);
          setAllUnclaimed(goalsSnapshot.docs.every(doc => doc.data().progress === 100) || goalsSnapshot.empty);
          const data = goalsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || '',
            progress: doc.data().progress || 0,
            costs: doc.data().costs || 0,
            select: doc.data().select || false,
            startingDate: doc.data().startingDate || null,
          }));
          const interestedList = userSnapshot.docs[0].data().interested_list || [];
          setInterestsNumber(interestedList.length)
          setGoals(data);

        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching goals: ", error);
      }
    };
    const fetchUserStats = async () => {
      try {
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Percy0816")); // Replace with actual username
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setEspm(userData.espm);
          setTotalSaving(userData['total saving']);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching user stats: ", error);
      }
    };

    fetchGoals();
    fetchUserStats();

  }, [goals, unclaimedSaving, setAllUnclaimed, setTotalSaving, setUnclaimedSaving]);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setShowMessage(true);
      document.body.style.overflow = 'hidden';
    }

    /*if (location.state?.newUnclaimedSaving) {
      setUnclaimedSaving(location.state.newUnclaimedSaving);
    }*/
  }, [location.state]);

  const handleCloseMessage = () => {
    setShowMessage(false);
    document.body.style.overflow = 'auto';
  };

  /*  const extractKeywords = title => {
      // You can customize this function based on how you want to extract keywords
      return title.toLowerCase().split(' ');
    }*/
  /* const updateAllExistGoals = async () => {
    const goalsCollection = collection(firestore, 'goals');
  
    try {
      const snapshot = await getDocs(goalsCollection);
  
      snapshot.forEach(async doc => {
        const title = doc.data().title;
        //const keywords = extractKeywords(title);
        const docRef = doc.ref;
        await updateDoc(docRef, { asd: Math.ceil(doc.data()['average costs'] /35 * 30 )});
      });
  
      console.log('Title keywords updated successfully.');
    } catch (error) {
      console.error('Error updating title keywords:', error);
    }
  } */



  /* const uploadImage = async (file, username, goalTitle) => {
     // Construct the filename using the provided username and goal title
     const fileName = `${username}_${goalTitle.replaceAll(' ', '_')}`;
     const imageRef = storageRef(storage, fileName);
     uploadBytes(imageRef, imageUpload)
       .then((snapshot) => {
         getDownloadURL(snapshot.ref)
           .then((url) => {
             saveData(url);
           })
           .catch((error) => {
             toastifyError(error.message);
           });
       })
       .catch((error) => {
         toastifyError(error.message);
       });
     const downloadURL = await imageRef.getDownloadURL();
 
     // Store the download URL in Firestore
     //await addDoc(collection(firestore, 'images'), { url: downloadURL });
 
     return downloadURL; // Return the filename for reference
   };*/

  const handleAddSaving = async () => {
    if (saving !== '' && (savingGoal !== '' || allUnclaimed)) {
      const userQuery = query(collection(firestore, "users"), where("Username", "==", "Percy0816"));
      const userSnapshot = await getDocs(userQuery);
      const userId = userSnapshot.docs[0].id;
      const userDocRef = userSnapshot.docs[0].ref;
      if (!userSnapshot.empty) {

        const newSaving = userSnapshot.docs[0].data()['total saving'] + parseInt(saving);
        await updateDoc(userDocRef, { 'total saving': newSaving });
        setTotalSaving(newSaving);
        const goalsCollectionRef = query(collection(firestore, `users/${userId}/current_goals`), where("title", "==", savingGoal));
        const goalSnapshot = await getDocs(goalsCollectionRef);

        if (!goalSnapshot.empty) {
          const goalDocRef = goalSnapshot.docs[0].ref;
          const goalDocData = goalSnapshot.docs[0].data();
          const remainSaving = newSaving - unclaimedSaving;
          const newProgress = goalDocData.costs >= remainSaving ? Math.floor((remainSaving / goalDocData.costs) * 100) : 100;
          if (goalDocData.costs <= remainSaving) {
            setUnclaimedSaving(unclaimedSaving + goalDocData.costs);
          }
          /*   const goalsNotSelectRef = query(collection(firestore, `users/${userId}/current_goals`), where("select", "==", false));
             const goalNotSelectSnapshot = await getDocs(goalsNotSelectRef);
   
             if (!goalNotSelectSnapshot.empty && newProgress === 100) {
               const goalDocNewRef = goalNotSelectSnapshot.docs[0].ref;
               await updateDoc(goalDocNewRef, { select: true });
             }*/

          await updateDoc(goalDocRef, { progress: newProgress });
        }
      }
      setSaving('');

      setSavingGoal('');
    } else {
      if (saving === '') {
        setMessage(`You have not entered your saving.`);
      } else if (savingGoal === '') {
        setMessage(`You need to pick a goal when you have not achieved all your current goals.`);
      }
      setShowMessage(true);
    }
  }

  const addGoal = async () => {
    if (newGoal.trim()) {
      try {
        /*    let imageURL = ''; // Default empty image URL
    
            // Check if an image file is selected
            if (imageFile) {
              // Upload the image file to Firebase Storage
              imageURL = await uploadImage(imageFile, "Percy0816", newGoal);
            }*/

        const goalQuery = query(collection(firestore, "goals"), where("titlelc", "==", newGoal.toLowerCase()));
        const goalSnapshot = await getDocs(goalQuery);

        if (!goalSnapshot.empty) {
          const goalDocRef = goalSnapshot.docs[0].ref;
          const goalData = goalSnapshot.docs[0].data();

          const totalSavers = goalData.savers || 0;
          const totalAchievers = goalData.achievers || 0;
          const currentAverageCosts = goalData['average costs'] || 0;
          const newAverageCosts = Math.ceil(((currentAverageCosts * (totalSavers + totalAchievers)) + parseFloat(cost)) / (1 + totalSavers + totalAchievers));
          const updatedCategory = Array.isArray(goalData.category) ? goalData.category : [];
          if (!updatedCategory.includes(category)) {
            updatedCategory.push(category);
          }

          await updateDoc(goalDocRef, {
            savers: increment(1),
            'average costs': newAverageCosts,
            category: arrayUnion(...updatedCategory),
            //  imageURL: imageURL // Add the imageURL to the goal data
          });
        } else {
          const newGoalData = {
            title: newGoal,
            titlelc: newGoal.toLowerCase(),
            'average costs': parseFloat(cost),
            savers: 1,
            achievers: 0,
            titleKeywords: newGoal.toLowerCase().split(" "),
            category: [category]
            //  imageURL: imageURL // Add the imageURL to the goal data
          };
          const goalsCollectionRef = collection(firestore, `goals`);
          await addDoc(goalsCollectionRef, newGoalData);
        }

        const remainSaving = totalSaving - unclaimedSaving;

        // Add the new goal data for the user
        const newGoalDataForUser = {
          title: newGoal,
          progress: 0,
          costs: parseFloat(cost),
          category: category,
          // select: false
          //  imageURL: imageURL
        };
        if (remainSaving > 0 && allUnclaimed) {
          const costFloat = parseFloat(cost);
          if (remainSaving >= costFloat) {
            newGoalDataForUser.progress = 100;
            setUnclaimedSaving(unclaimedSaving + costFloat);
          } else {
            newGoalDataForUser.progress = Math.floor((remainSaving / costFloat) * 100);
          }
        }
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Percy0816"));
        const userSnapshot = await getDocs(userQuery);
        const userDocRef = userSnapshot.docs[0].ref;
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsCollectionRef = collection(firestore, `users/${userId}/current_goals`);
          //const goalsSnapshot = await getDocs(goalsCollectionRef);

          /*  if (goalsSnapshot.empty) {
              newGoalDataForUser.select = true;
            }*/
          const docRef = await addDoc(goalsCollectionRef, newGoalDataForUser);
          setMessage(`You have successfully added the goal: ${newGoal}`);
          setGoals([...goals, { id: docRef.id, ...newGoalDataForUser }]);
          setNewGoal('');
          setCost('');
          setCategory('');
          const interestedList = userSnapshot.docs[0].data().interested_list || [];
          const updatedInterestedList = interestedList.filter(t => t !== newGoal.toLowerCase());
          await updateDoc(userDocRef, { interested_list: updatedInterestedList });

          setShowMessage(true);
          document.body.style.overflow = 'hidden';
          //    setImageFile(null); // Reset image file after adding the goal
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error adding goal: ", error);
      }
    } else {
      setMessage(`You have not entered your goal.`);
      setShowMessage(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const handldeClaim = async (reachedGoal) => {

  }


  return (
    <div className="container">
      <Menu />
      <Link to="/badges"> Percy0816 </Link>
      <p>Expected Saving Per Month: £{espm}</p>
      <p>Total Saving: £{totalSaving}</p>
      <h1>Saving for your Goal</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter savings"
          value={saving}
          onChange={(e) => setSaving(e.target.value)}
        />
        <select
          // value={savingGoal}
          onChange={(e) => setSavingGoal(e.target.value)}
        >
          <option value="">Select a goals</option>
          {goals.filter(goal => goal.progress !== 100).map(goal => <option value={goal.title}>{goal.title}</option>)}

        </select>
        <button onClick={handleAddSaving}>Add Saving</button>
      </div>

      {showMessage && (
        <div className='modal-overlay'>
          <div className="message-modal">
            <p>{message}</p>
            <button onClick={handleCloseMessage}>Close</button>
          </div>
        </div>
      )}

      <div className="input-container">
        <input
          type="number"
          placeholder="Enter costs"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter new goal"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select a category</option>
          <option value="Tech Gadgets">Tech Gadgets</option>
          <option value="Fashion and Accessories">Fashion and Accessories</option>
          <option value="Travel">Travel</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Education and Personal Development">Education and Personal Development</option>
          <option value="Social and Lifestyle">Social and Lifestyle</option>
        </select>
        {/*<input
          label="Image"
          placeholder="Choose image"
          accept="image/png,image/jpeg"
          type="file"
          onChange={(e) => {
            //  setImageFile(e.target.files[0]);
          }}
        />*/}
        <button onClick={addGoal}>Add New Goal</button>
        {interestsNumber !== 0 && <Link to="/interested"> View Interested List </Link>}
        <Link to="/suggestion"> Need Suggestions </Link>
      </div>
      {/* <div className="input-container">
        
         <button onClick={updateAllExistGoals}>Update Goals</button>
      </div>
 */}
      <div className="goal-list">
        {goals.sort((a, b) => b.progress - a.progress).map(goal => (
          <div className="goal-box" key={goal.id}>
            <Link to={`/details-goal/${goal.title.toLowerCase().replace(/ /g, '-')}`} className="goal-link">
              <h3>{goal.title}</h3>
              <p>Costs: £{goal.costs}</p>
              <p>Progress: {goal.progress}%</p>
            </Link>
            {goal.progress === 100 ? <button onClick={() => handldeClaim(goal)}> Claim </button> : <></>}
            {/*  <div className="goal-info">
        <button onClick={() => handleGoalClick(goal)}>
          Edit costs
        </button>
  </div>*/}
          </div>
        ))}
      </div>

    </div>
  );
}

export default HomePage;
