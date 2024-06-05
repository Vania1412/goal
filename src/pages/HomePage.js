import React, { useState, useEffect } from 'react';
import { collection, query, where, addDoc, getDocs, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { firestore } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import Menu from '../components/Menu.js';
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
  // const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState('');
  const [totalSaving, setTotalSaving] = useState(0);
  const [espm, setEspm] = useState(0);

  const navigate = useNavigate();

  const handleGoalClick = (goal) => {
    const formattedTitle = goal.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/details-goal/${formattedTitle}`)
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        // Construct a query to fetch goals for the user with username "Wendy237"
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Wendy237"));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsQuery = query(collection(firestore, `users/${userId}/current_goals`));
          const goalsSnapshot = await getDocs(goalsQuery);
          const data = goalsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || '',
            progress: doc.data().progress || 0,
            costs: doc.data().costs || 0,
            selected: doc.data().selected || false,
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
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Wendy237")); // Replace with actual username
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
  }, []);

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
         await updateDoc(docRef, { category:  "Fashion and Accessories"});
       });
   
       console.log('Title keywords updated successfully.');
     } catch (error) {
       console.error('Error updating title keywords:', error);
     }
   }*/



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



  const addGoal = async () => {
    if (newGoal.trim()) {
      try {
        /*    let imageURL = ''; // Default empty image URL
    
            // Check if an image file is selected
            if (imageFile) {
              // Upload the image file to Firebase Storage
              imageURL = await uploadImage(imageFile, "Wendy237", newGoal);
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
          const updatedCategory = category.filter(cat => !goalData.category.includes(cat));

          await updateDoc(goalDocRef, {
            savers: increment(1),
            'average costs': newAverageCosts,
            category: arrayUnion(...updatedCategory, ...category),
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
            category: category
            //  imageURL: imageURL // Add the imageURL to the goal data
          };
          const goalsCollectionRef = collection(firestore, `goals`);
          await addDoc(goalsCollectionRef, newGoalData);
        }

        // Add the new goal data for the user
        const newGoalDataForUser = {
          title: newGoal,
          progress: 0,
          costs: parseFloat(cost),
          category: category
          //  imageURL: imageURL
        };
        const userQuery = query(collection(firestore, "users"), where("Username", "==", "Wendy237"));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsCollectionRef = collection(firestore, `users/${userId}/current_goals`);
          const docRef = await addDoc(goalsCollectionRef, newGoalDataForUser);
          setGoals([...goals, { id: docRef.id, ...newGoalDataForUser }]);
          setNewGoal('');
          setCost('');
          //    setImageFile(null); // Reset image file after adding the goal
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error adding goal: ", error);
      }
    }
  };



  return (
    <div>
      <Menu />
      <Link to="/badges"> Wendy237 </Link>
      <p>Expected Saving Per Month: £{espm}</p>
      <p>Total Saving: £{totalSaving}</p>
      <h1>Saving for your Goal</h1>
      <div>
        <input
          type="text"
          placeholder="Enter savings"
          value={saving}
          onChange={(e) => setSaving(e.target.value)}
        />
      </div>
      <div>
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
      </div>
      <div>
        <button onClick={() => navigate('/suggestion')}>Need Suggestions</button>
        {/* <button onClick={updateAllExistGoals}>Update Goals</button> */}
      </div>

      <ul>
        {goals.map(goal => (
          <li key={goal.id}>
            <button onClick={() => handleGoalClick(goal)}> {/* Pass the goal object to the handleGoalClick function */}
              {goal.title} - {goal.progress}% - £{goal.costs}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
