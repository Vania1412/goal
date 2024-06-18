import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, addDoc, getDoc, orderBy } from 'firebase/firestore';
import { firestore, storage } from '../firebase';
import Menu from '../components/Menu.js';
import { Link } from 'react-router-dom';
import { useGlobalState } from '../GlobalStateContext.js';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { v4 } from "uuid";
import './AchievedGoalsPage.css';

const AchievedGoalsPage = () => {
  const [achievedGoals, setAchievedGoals] = useState([]);
  const [successMessage, setMessage] = useState('');
  const { username } = useGlobalState();
  const [img, setImg] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  useEffect(() => {
    const fetchAchievedGoals = async () => {
      try {
        const userQuery = query(collection(firestore, 'users'), where("Username", "==", username));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const goalsQuery = query(collection(firestore, `users/${userId}/achieved_goals`), orderBy("timestamp", "desc"));
          const goalsSnapshot = await getDocs(goalsQuery);
          const goalsData = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAchievedGoals(goalsData);
          const initialImageIndexes = {};
          goalsData.forEach(goal => {
            initialImageIndexes[goal.id] = 0;
          });
          setCurrentImageIndex(initialImageIndexes);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error('Error fetching achieved goals:', error);
      }
    };
    fetchAchievedGoals();
  }, [username]);

  const handleShare = async (itemId, text, originalText, itemTitle) => {
    if (text !== undefined && text !== originalText) {
      try {
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          await updateDoc(doc(firestore, `users/${userId}/achieved_goals`, itemId), {
            's&t': text
          });

          const goalDocQuery = query(collection(firestore, "goals"), where("title", "==", itemTitle));
          const goalSnapshot = await getDocs(goalDocQuery);
          if (!goalSnapshot.empty) {
            const goalData = goalSnapshot.docs[0].data();
            const goalDataRef = goalSnapshot.docs[0].ref;
            const goalId = goalSnapshot.docs[0].id;

            if (!goalData['featured_s&t']) {
              await setDoc(doc(firestore, `goals/${goalId}/featured_s&t/initialDoc`), {
                username: userSnapshot.docs[0].data().Username,
                content: text,
                useful: []
              });
            } else {
              const featuredSTQuery = query(collection(firestore, `goals/${goalId}/featured_s&t`), where('username', '==', userSnapshot.docs[0].data().Username));
              const featuredSTSnapshot = await getDocs(featuredSTQuery);

              if (!featuredSTSnapshot.empty) {
                const docRefToUpdate = featuredSTSnapshot.docs[0].ref;
                await updateDoc(docRefToUpdate, {
                  content: text
                });
              } else {
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

  const handleImageUpload = async (itemId) => {
    if (img !== null) {
      const imgRef = ref(storage, `files/${v4()}`);
      uploadBytes(imgRef, img).then(value => {
        getDownloadURL(value.ref).then(async (url) => {
          try {
            const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
              const userId = userSnapshot.docs[0].id;
              const goalDoc = doc(firestore, `users/${userId}/achieved_goals`, itemId);
              const goalSnapshot = await getDoc(goalDoc);
              const goalData = goalSnapshot.data();
              const existingImages = goalData.imageUrls || [];

              await updateDoc(goalDoc, {
                imageUrls: [...existingImages, url]
              });

              setAchievedGoals(prevGoals => prevGoals.map(goal => {
                if (goal.id === itemId) {
                  return { ...goal, imageUrls: [...existingImages, url] };
                }
                return goal;
              }));
              setMessage('Image uploaded successfully!');
              setImg(null);  // Reset image input
            } else {
              console.log("User not found");
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            setMessage('Error uploading image');
          }
        });
      });
    }
  };

  const showNextImage = (goalId) => {
    setCurrentImageIndex(prevIndexes => {
      const currentIndex = prevIndexes[goalId];
      const newIndex = (currentIndex + 1) % achievedGoals.find(goal => goal.id === goalId).imageUrls.length;
      return { ...prevIndexes, [goalId]: newIndex };
    });
  };

  const showPreviousImage = (goalId) => {
    setCurrentImageIndex(prevIndexes => {
      const currentIndex = prevIndexes[goalId];
      const goal = achievedGoals.find(goal => goal.id === goalId);
      const newIndex = (currentIndex - 1 + goal.imageUrls.length) % goal.imageUrls.length;
      return { ...prevIndexes, [goalId]: newIndex };
    });
  };

  const openModal = (url) => {
    setModalImage(url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage('');
  };

  return (
    <div className="container">
      <Menu />
      <h2>Achieved Goals</h2>
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
          <div className="imageGallery">
            <div className="uploadContainer">

            </div>
            {item.imageUrls && item.imageUrls.length > 0 && (
              <div className="imageContainer">
                <div className="imageWrapper">
                  <img
                    src={item.imageUrls[currentImageIndex[item.id]]}
                    alt="achieved goal"
                    className="goalImage"
                    onClick={() => openModal(item.imageUrls[currentImageIndex[item.id]])}
                  />
                </div>
                <div className="imageNavigation">
                  <button onClick={() => showPreviousImage(item.id)}>&lt;</button>
                  <button onClick={() => showNextImage(item.id)}>&gt;</button>
                </div>
                
              </div>
            )}
            
          </div>
          <div><input type="file" onChange={(e) => setImg(e.target.files[0])} />
          <button onClick={() => handleImageUpload(item.id)}>Upload Image</button></div>

        </div>
      ))}
      {successMessage && (
        <div className="modal">
          <p className="modalText">{successMessage}</p>
        </div>
      )}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <img src={modalImage} alt="enlarged goal" className="modalImage" />
        </div>
      )}
    </div>
  );
};

export default AchievedGoalsPage;
