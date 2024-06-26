import React, { useState, useEffect } from 'react';
import { collection, query, where, addDoc, getDocs, updateDoc, increment, arrayUnion, serverTimestamp } from "firebase/firestore";
import { firestore } from '../firebase.js';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Menu from '../components/Menu.js';
import './HomePage.css';
import { useGlobalState } from '../GlobalStateContext.js';


/*import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";*/


const GoalAddingPage = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [cost, setCost] = useState('');
  const [interestsNumber, setInterestsNumber] = useState(0);
  // const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState('');
  // const [totalSaving, setTotalSaving] = useState(0);
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [viewable, setViewable] = useState('');
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
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username)); // Replace with actual username
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
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

  }, [goals, unclaimedSaving, setAllUnclaimed, setTotalSaving, setUnclaimedSaving, username]);

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



  const addGoal = async () => {
    if (newGoal.trim()) {
      try {
        /*    let imageURL = ''; // Default empty image URL
    
            // Check if an image file is selected
            if (imageFile) {
              // Upload the image file to Firebase Storage
              imageURL = await uploadImage(imageFile, username, newGoal);
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
          viewable: viewable,
          startDate: new Date() 
          // select: false

          //  imageURL: imageURL
        };
        await addDoc(collection(firestore, "progressUpdates"), {
          username,
          goalTitle: newGoal,
          progress: 0,
          timestamp: serverTimestamp(),
          celebrations: [],
          viewable: viewable
        });
        const costFloat = parseFloat(cost);
        if (remainSaving > 0 && allUnclaimed) {
          
          if (remainSaving >= costFloat) {
               await addDoc(collection(firestore, "progressUpdates"), {
                username,
                goalTitle: newGoal,
                progress: 50,
                timestamp: serverTimestamp(),
                celebrations: [],
                viewable: viewable
              });
               await addDoc(collection(firestore, "progressUpdates"), {
                username,
                goalTitle: newGoal,
                progress: 100,
                timestamp: serverTimestamp(),
                celebrations: [],
                viewable: viewable
              });
            newGoalDataForUser.progress = 100;
            setUnclaimedSaving(unclaimedSaving + costFloat);
          } else {
            if (Math.floor((remainSaving / costFloat) * 100) >= 50 && newGoalDataForUser.progress < 50) {
              await addDoc(collection(firestore, "progressUpdates"), {
                username,
                goalTitle: newGoal,
                progress: 50,
                timestamp: serverTimestamp(),
                celebrations: [], 
                viewable: viewable
              });
            }
            newGoalDataForUser.progress = Math.floor((remainSaving / costFloat) * 100);
            
            
          }
        }
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
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
          
         // setMessage(`You have successfully added the goal: ${newGoal}`);
          setGoals([...goals, { id: docRef.id, ...newGoalDataForUser }]);
          setNewGoal('');
          setCost('');
          setCategory('');
          setViewable('')
          const interestedList = userSnapshot.docs[0].data().interested_list || [];
          const updatedInterestedList = interestedList.filter(t => t !== newGoal.toLowerCase());
          await updateDoc(userDocRef, { interested_list: updatedInterestedList });
          navigate('/home', { state: { message: `You have successfully added the goal: ${newGoal}`, newUnclaimedSaving: unclaimedSaving - costFloat } });


        //  setShowMessage(true);
          //document.body.style.overflow = 'hidden';
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



  return (
    <div className="container">
      <Menu />
      {showMessage && (
        <div className='modal-overlay'>
          <div className="message-modal">
            <p>{message}</p>
            <button onClick={handleCloseMessage}>Close</button>
          </div>
        </div>
      )}
     <h2>Add a New Goal</h2>

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
        <select
          value={viewable}
          onChange={(e) => setViewable(e.target.value)}
        >
          <option value="">Select who can view it</option>
          <option value="Me">Me</option>
          <option value="My friends">My friends</option>
          <option value="My followers">My followers</option>
      
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
  
    

    </div>
  );
}

export default GoalAddingPage;
