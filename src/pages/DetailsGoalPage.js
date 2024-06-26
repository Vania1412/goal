import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, updateDoc, increment, doc, arrayRemove, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import Menu from '../components/Menu.js';
import './DetailsGoalPage.css';
import { useGlobalState } from '../GlobalStateContext.js';

const DetailsGoalPage = () => {
  const { goalTitle } = useParams(); // Get the goalTitle from the URL params
  const [goalData, setGoalData] = useState(null);
  const [isGoalSet, setIsGoalSet] = useState(true); // Start as true
  const [averageCosts, setAverageCosts] = useState(0);
  const [featuredStories, setFeaturedStories] = useState([]);
  const [userUsefulStories, setUserUsefulStories] = useState({});
  const [showAllStories, setShowAllStories] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newGoalCosts, setNewGoalCosts] = useState(0);
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [isSavedAsInterested, setIsSavedAsInterested] = useState(false);
  const [viewable, setViewable] = useState('');
  const [memories, setMemories] = useState([]);
  const [selectedImageUrls, setSelectedImageUrls] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const { username, totalSaving, unclaimedSaving, setUnclaimedSaving, allUnclaimed } = useGlobalState();

  const navigate = useNavigate();


  function formatGoalTitle(goalTitle) {
    const words = goalTitle.split('-');
    const formattedTitle = words.join(' ');
    return formattedTitle;
  }

  useEffect(() => {
    const fetchGoalData = async () => {
      try {
        const formattedTitle = formatGoalTitle(goalTitle);
        const q = query(collection(firestore, 'goals'), where('titlelc', '==', formattedTitle));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setGoalData(data);
          setAverageCosts(data['average costs']);

          const featuredStoriesRef = collection(firestore, `goals/${querySnapshot.docs[0].id}/featured_s&t`);
          const storiesSnapshot = await getDocs(featuredStoriesRef);
          const storiesData = storiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })).filter(story => story.content !== "");

          const userUsefulMap = storiesData.reduce((acc, story) => {
            acc[story.id] = story.useful.includes(username);
            return acc;
          }, {});

          setFeaturedStories(storiesData);
          setUserUsefulStories(userUsefulMap);

           // Fetch memories associated with the goal
           const memoriesRef = collection(firestore, `goals/${querySnapshot.docs[0].id}/memories`);
           const memoriesSnapshot = await getDocs(memoriesRef);
           const memoriesData = memoriesSnapshot.docs.map(doc => ({
             id: doc.id,
             ...doc.data()
           }));
 
           setMemories(memoriesData);

          // Check if the goal is already set for the user
          const userQuery = query(collection(firestore, 'users'), where('Username', '==', username));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userId = userSnapshot.docs[0].id;
            const userGoalsQuery = query(collection(firestore, `users/${userId}/current_goals`), where('title', '==', data.title));
            const userGoalsSnapshot = await getDocs(userGoalsQuery);
            if (userGoalsSnapshot.empty) {
              setIsGoalSet(false); // Set to false if the goal is not found in the user's collection
            }
            const interestedList = userSnapshot.docs[0].data().interested_list || [];
            setIsSavedAsInterested(interestedList.includes(formatGoalTitle(goalTitle)));

          }
        } else {
          console.log('Goal not found');
        }
      } catch (error) {
        console.error('Error fetching goal data:', error);
      }
    };



    fetchGoalData();
  }, [goalTitle, username]);

  const handleUsefulClick = async (storyId) => {
    console.log("Clicked on useful for storyId:", storyId);
    try {
      const goalDocQuery = query(collection(firestore, "goals"), where("titlelc", "==", formatGoalTitle(goalTitle)));
      const goalDocSnapshot = await getDocs(goalDocQuery);

      if (!goalDocSnapshot.empty) {
        const goalDocRef = goalDocSnapshot.docs[0].ref;
        const storyRef = doc(firestore, `goals/${goalDocRef.id}/featured_s&t`, storyId);
        const currentUsefulState = userUsefulStories[storyId];

        if (currentUsefulState) {
          // Remove user from useful array
          console.log("Removing user from useful array:", username);
          await updateDoc(storyRef, {
            useful: arrayRemove(username)
          });
        } else {
          // Add user to useful array
          console.log("Adding user to useful array:", username);
          await updateDoc(storyRef, {
            useful: arrayUnion(username)
          });
        }

        // Update local state
        setUserUsefulStories(prevState => ({
          ...prevState,
          [storyId]: !currentUsefulState
        }));

        // Update useful count locally
        setFeaturedStories(prevStories => prevStories.map(story => {
          if (story.id === storyId) {
            const newUsefulArray = currentUsefulState ?
              story.useful.filter(user => user !== username) :
              [...story.useful, username];
            return { ...story, useful: newUsefulArray };
          }
          return story;
        }));
      } else {
        console.error("Goal not found for goalTitle:", goalTitle);
      }
    } catch (error) {
      console.error('Error updating useful status:', error);
    }
  };



  const handleSetGoal = () => {
    setShowModal(true);
    setNewGoalCosts(0);
    setNewGoalCategory('');
    document.body.style.overflow = 'hidden';
  };

  const handleAddNewGoal = async () => {
    if (goalData) {
      try {
        const goalQuery = query(collection(firestore, "goals"), where("titlelc", "==", formatGoalTitle(goalTitle)));
        const goalSnapshot = await getDocs(goalQuery);

        if (!goalSnapshot.empty) {
          const goalDocRef = goalSnapshot.docs[0].ref;

          await updateDoc(goalDocRef, {
            savers: increment(1),
          });
        }
        const userQuery = query(collection(firestore, 'users'), where('Username', '==', username));
        const userSnapshot = await getDocs(userQuery);
        const userDocRef = userSnapshot.docs[0].ref;
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsCollectionRef = collection(firestore, `users/${userId}/current_goals`);
          const newGoalData = {
            title: goalData.title,
            progress: 0,
            costs: parseFloat(newGoalCosts !== 0 ? newGoalCosts : averageCosts),
            category: newGoalCategory !== '' ? newGoalCategory : category[0],
            viewable: viewable
          };

          await addDoc(collection(firestore, "progressUpdates"), {
            username,
            goalTitle: goalData.title,
            progress: 0,
            timestamp: serverTimestamp(),
            celebrations: [],
            viewable: viewable
        });

          let costFloat = 0;
          const remainSaving = totalSaving - unclaimedSaving;
          if (remainSaving > 0 && allUnclaimed) {
            costFloat = newGoalData.costs;
            if (remainSaving >= costFloat) {
              newGoalData.progress = 100;
              await addDoc(collection(firestore, "progressUpdates"), {
                username,
                goalTitle: goalData.title,
                progress: 50,
                timestamp: serverTimestamp(),
                celebrations: [], 
                viewable: viewable
            });
            await addDoc(collection(firestore, "progressUpdates"), {
                username,
                goalTitle: goalData.title,
                progress: 100,
                timestamp: serverTimestamp(),
                celebrations: [], 
                viewable: viewable
            });
              setUnclaimedSaving(unclaimedSaving + costFloat);
            } else {
              if (Math.floor((remainSaving / costFloat) * 100) >= 50 && newGoalData.progress < 50) {
                await addDoc(collection(firestore, "progressUpdates"), {
                    username,
                    goalTitle: goalData.title,
                    progress: 50,
                    timestamp: serverTimestamp(),
                    celebrations: [], 
                    viewable: viewable
                });
            }
              newGoalData.progress = Math.floor((remainSaving / costFloat) * 100);
            }
          }


          await addDoc(goalsCollectionRef, newGoalData);
          setIsGoalSet(true);
          const interestedList = userSnapshot.docs[0].data().interested_list || [];
          const updatedInterestedList = interestedList.filter(t => t !== goalData.titlelc);
          await updateDoc(userDocRef, { interested_list: updatedInterestedList });
          setShowModal(false);
          document.body.style.overflow = 'auto';
          navigate('/home', { state: { message: `You have successfully added the goal: ${goalData.title}` } });
        } else {
          console.log('User not found');
        }
      } catch (error) {
        console.error('Error setting goal: ', error);
      }
    }

  };

  const handleModalClose = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  const handleImageModalClose = () => {
    setShowImageModal(false);
    document.body.style.overflow = 'auto';
  };

  const toggleShowAllStories = () => {
    setShowAllStories(!showAllStories);
  };

  const handleSaveAsInterested = async () => {
    if (goalData) {
      const userQuery = query(collection(firestore, 'users'), where('Username', '==', username));
      const userSnapshot = await getDocs(userQuery);
      const userDocRef = userSnapshot.docs[0].ref;

      if (!userSnapshot.empty) {
        const interestedList = userSnapshot.docs[0].data().interested_list || [];
        if (isSavedAsInterested) {
          const updatedInterestedList = interestedList.filter(t => t !== formatGoalTitle(goalTitle));
          await updateDoc(userDocRef, { interested_list: updatedInterestedList });
        } else {
          const updatedInterestedList = [...interestedList, formatGoalTitle(goalTitle)];
          await updateDoc(userDocRef, { interested_list: updatedInterestedList });
        }
      }
      setIsSavedAsInterested(!isSavedAsInterested);

    }
  };

  const openImageModal = (imageUrls) => {
    // Open modal or handle image click functionality
    console.log('Opening modal for images:', imageUrls);
    // Implement modal logic here (e.g., set state to open modal and pass imageUrls)
    // You can implement modal logic using a library like react-modal or create your own modal component
    // Example with useState to manage modal state
    setShowImageModal(true);
    setSelectedImageUrls(imageUrls);
  };
  const renderMemoryBoxes = () => {


    return memories.map((memory, index) => (
      <div key={index} className="memory-box" onClick={() => openImageModal(memory.imageUrls)} >
        <img src={memory.imageUrls[0]} alt="Memory" className="memory-image" />
        <p className="memory-username">{memory.username}</p>
      </div>
    ));
  };

  if (!goalData) {
    return <div>Loading...</div>;
  }

  const { title, savers, achievers, url, category } = goalData;

  return (
    <div className="details-container">
      <Menu />
      <h1 className="goal-title">{title}</h1>
      <img src={url} alt={title} className="goal-show-image" />
      <p className="goal-info">The average costs is £{averageCosts}</p>
      <p className="goal-info">{savers} users saving for this goal</p>
      <p className="goal-info">{achievers} users achieved this goal</p>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Add New Goal</h2>
            <div className="modal-input">
              <label htmlFor="new-goal-title">Goal: {title}</label>
            </div>
            <div className="modal-input">
              <label htmlFor="new-goal-costs">Costs:</label>
              <input
                type="number"
                id="new-goal-costs"
                value={newGoalCosts !== 0 ? newGoalCosts : averageCosts}
                onChange={(e) => setNewGoalCosts(e.target.value)}
              />
            </div>
            <div className="modal-input">
              <label htmlFor="new-goal-category">Category:</label>
              <select
                id="new-goal-category"
                value={newGoalCategory !== '' ? newGoalCategory : category[0]}
                onChange={(e) => setNewGoalCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                <option value="Tech Gadgets">Tech Gadgets</option>
                <option value="Fashion and Accessories">Fashion and Accessories</option>
                <option value="Travel">Travel</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Education and Personal Development">Education and Personal Development</option>
                <option value="Social and Lifestyle">Social and Lifestyle</option>
              </select>
            </div>
            <div className="modal-input">
              <label htmlFor="new-goal-category">Who can view it:</label>
              <select
                value={viewable}
                onChange={(e) => setViewable(e.target.value)}
              >
                <option value="Me">Me</option>
                <option value="My friends">My friends</option>
                <option value="My followers">My followers</option>

              </select>

            </div>
            <button className="modal-button" onClick={handleAddNewGoal}>Confirm</button>
            <button className="modal-close" onClick={handleModalClose}>Close</button>
          </div>
        </div>
      )}

      <div>
        {!isGoalSet && <button className="set-goal-button" onClick={handleSetGoal}>Set Goal</button>}
      </div>
      <div>
        {!isGoalSet && <button className="set-goal-button" onClick={handleSaveAsInterested}>
          {isSavedAsInterested ? 'Remove from Interested List' : 'Add to Interests'}
        </button>}
      </div>
      {/* <p className="goal-info">Users expected to achieve within a similar timeframe as you:</p>
      <div className="profile-container">
        <div className="profile">
          <img src={profilePic} alt="Profile" className="profile-pic" />
          <p className="profile-name">George</p>
          <button className="follow-button">Follow</button>
        </div>
      </div>
  */}
      {/* Render featured stories and tips */}
      <h2 className="section-title">Featured Stories & Tips</h2>
      <div className={`featured-stories ${showModal ? 'grayed-out' : ''}`}>
        {featuredStories.sort((a, b) => b.useful.length - a.useful.length).slice(0, showAllStories ? undefined : 3).map((story, index) => (
          <div key={index} className="story">
            <p className="story-author">{story.username}</p>
            <p className="story-content">{story.content}</p>
            <div className="story-header">
              <p className="story-useful">{story.useful.length} users think this is helpful.</p>
              <button
                className={`useful-button ${userUsefulStories[story.id] ? 'active' : ''}`}
                onClick={() => handleUsefulClick(story.id)}
              >
                {userUsefulStories[story.id] ? 'Liked' : 'Like'}

              </button>
            </div>

          </div>

        ))}
      </div>
      {featuredStories.length > 3 && (
        <button onClick={toggleShowAllStories}>
          {showAllStories ? 'Collapse' : 'View More'}
        </button>
      )}
      {featuredStories.length === 0 && (
        <p>No featured stories & tips currently.</p>
      )}


      {/* Render memory collection */}
      <h2 className="section-title">Memory Collection</h2>
      <div className="memory-collection">
        {renderMemoryBoxes()}
      </div>

      {showImageModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleImageModalClose}>Close</button>
            <div className="modal-image-container">
              <img src={selectedImageUrls} alt="Memory" className="modal-image" />
            </div>
            {/* Add buttons or controls for switching images here */}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default DetailsGoalPage;

