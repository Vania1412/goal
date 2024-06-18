import React, { useState, useEffect } from 'react';
import { collection, query, where, addDoc, getDocs, updateDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { firestore } from '../firebase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Menu from '../components/Menu.js';
import './HomePage.css';
import { useGlobalState } from '../GlobalStateContext.js';
//import smileIcon from '../assets/smile.webp';
//import neutralIcon from '../assets/neutral.png';
//import cryIcon from '../assets/cry.png';


/*import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";*/


const HomePage = () => {
  const [goals, setGoals] = useState([]);
  const [saving, setSaving] = useState('');
  const [savingGoal, setSavingGoal] = useState('');
  const [savingStatus, setSavingStatus] = useState('');
  // const [imageFile, setImageFile] = useState(null);
  // const [totalSaving, setTotalSaving] = useState(0);
  const [espm, setEspm] = useState(0);
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [actualCosts, setActualCosts] = useState('');
  //  const [unclaimedSaving, setUnclaimedSaving] = useState(0);
  // const [allUnclaimed, setAllUnclaimed] = useState(false);
  const { username, totalSaving, setTotalSaving, unclaimedSaving, setUnclaimedSaving, allUnclaimed, setAllUnclaimed } = useGlobalState();

  const navigate = useNavigate();   


  useEffect(() => {
    const fetchGoals = async () => {
      try {
        // Construct a query to fetch goals for the user with username username
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
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
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username)); // Replace with actual username
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setEspm(userData.espm);
          setSavingStatus(userData.status);
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

  }, [goals, unclaimedSaving, setAllUnclaimed, setTotalSaving, setUnclaimedSaving, username, savingStatus]);

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
      const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
      const userSnapshot = await getDocs(userQuery);
      const userId = userSnapshot.docs[0].id;
      const userDocRef = userSnapshot.docs[0].ref;
      if (!userSnapshot.empty) {

        const newSaving = userSnapshot.docs[0].data()['total saving'] + parseInt(saving);
        await updateDoc(userDocRef, {
          'total saving': newSaving,
          // add a document to 'saving_record' of the user with amount: parseInt(saving) and timestamp: serverTimestamp() 
        });
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
          if (newProgress >= 50 && goalDocData.progress < 50) {
            await addDoc(collection(firestore, "progressUpdates"), {
              username,
              goalTitle: savingGoal,
              progress: 50,
              timestamp: serverTimestamp(),
              celebrations: [],
              viewable: goalDocData.viewable
            });
          }
          if (newProgress === 100 && goalDocData.progress < 100) {
            await addDoc(collection(firestore, "progressUpdates"), {
              username,
              goalTitle: savingGoal,
              progress: 100,
              timestamp: serverTimestamp(),
              celebrations: [],
              viewable: goalDocData.viewable
            });
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




  const handleClaim = (goal) => {
    setSelectedGoal(goal);
    setActualCosts(goal.costs);
    setClaimModalOpen(true);
  };

  const handleConfirmClaim = async () => {
    const today = new Date();
const startDate = selectedGoal.startDate && selectedGoal.startDate.toDate().getTime();  
const differenceInTime = today.getTime() - startDate;
const savingDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

    const userQuery = query(collection(firestore, 'users'), where('Username', '==', username));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
      const userId = userSnapshot.docs[0].id;
      const userDocRef = userSnapshot.docs[0].ref;
      const userData = userSnapshot.docs[0].data();
      const currentTotalSavings = userData['total saving'] || 0;

      // Calculate the new total savings after deducting actualCosts
      const newTotalSavings = currentTotalSavings - actualCosts;

      // Update the user document with the new total savings
      await updateDoc(userDocRef, {
        'total saving': newTotalSavings,
      });
      const goalDocRef = doc(firestore, `users/${userId}/current_goals`, selectedGoal.id);
      await deleteDoc(goalDocRef);
      const achievedGoal = {
        ...selectedGoal,
        'actual costs': actualCosts,
        'expected costs': selectedGoal.costs,
        'saving days': savingDays || 1,
        title: selectedGoal.title,
        's&t': '', 
        timestamp: serverTimestamp()
      };

      const goalsCollectionRef = collection(firestore, `users/${userId}/achieved_goals`);
      await addDoc(goalsCollectionRef, achievedGoal);
      navigate('/achieved');
    }



    // Update local state
    const updatedGoals = goals.filter(goal => goal.id !== selectedGoal.id);
    setGoals(updatedGoals);
    setClaimModalOpen(false);
  };

  const handleStatus = async (status) => {

    const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
    const userSnapshot = await getDocs(userQuery);
    const userDocRef = userSnapshot.docs[0].ref;
    await updateDoc(userDocRef, {
      status: status
    });
    const statusQuery = query(collection(firestore, "progressUpdates"), where("username", "==", username));
    const statusSnapshot = await getDocs(statusQuery);
    const previousStatusDoc = statusSnapshot.docs.find(doc => doc.data().status);

    if (previousStatusDoc) {
      const statusDocRef = previousStatusDoc.ref;
      await deleteDoc(statusDocRef);
      console.log("Previous status deleted successfully");
    }

    await addDoc(collection(firestore, "progressUpdates"), {
      username,
      status: status,
      timestamp: serverTimestamp(),
      viewable: "my followers"
    });
    /// setSavingStatus(status);

  }


  return (
    <div className="container">
      <Menu />
      <Link to={`/profile/${username.toLowerCase()}`} className="link-to-profile">{username}</Link>
      <p className="profile-info">Saving status:
        <select
          value={savingStatus}
          onChange={(e) => handleStatus(e.target.value)}
        >
          <option value="stable">Stable</option>
          <option value="adequate">Adequate</option>
          <option value="strained">Strained</option>
        </select>
      </p>
      <p className="profile-info">Expected Saving Per Month: £{espm}</p>
      <p className="profile-info">Total Saving: £{totalSaving}</p>
      <h1>Saving for your Goal</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter savings"
          value={saving}
          onChange={(e) => setSaving(e.target.value)}
        />
        <select
          value={savingGoal}
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

      <div className="flex-container">
        {goals.sort((a, b) => b.progress - a.progress).map(goal => (
          <div className="card" key={goal.id}>
            <Link to={`/details-goal/${goal.title.toLowerCase().replace(/ /g, '-')}`} className="card-link">
              <h3>{goal.title}</h3>
              <p>Costs: £{goal.costs}</p>
              <p>Progress: {goal.progress}%</p>
            </Link>
            {goal.progress === 100 && <button onClick={() => handleClaim(goal)}>Claim</button>}
          </div>
        ))}
      </div>
      <Link to="/goal-adding"> Add new goal </Link>
      {claimModalOpen && (
        <div className="claim-modal">
          <div className="claim-modal-content">
            <h2>Claim Goal</h2>
            <label>
              Actual Costs:
              <input
                type="number"
                value={actualCosts}
                onChange={(e) => setActualCosts(e.target.value)}
              />
            </label>
            <button onClick={handleConfirmClaim}>Confirm</button>
            <button onClick={() => setClaimModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
