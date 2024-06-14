import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { firestore } from '../firebase.js';
import { useGlobalState } from '../GlobalStateContext.js';
import Menu from '../components/Menu.js';
import { Link } from 'react-router-dom';


const FollowingFollowersPage = () => {
  const { username } = useGlobalState();
  const [following, setFollowing] = useState([]);
  const [newFollower, setNewFollower] = useState('');
  const [error, setError] = useState('');
  const [followers, setFollowers] = useState([]);
  const [view, setView] = useState('following'); 
  const [invitees, setInvitees] = useState([]);


  const styles = {
    tabContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',  // Increase space between tabs
      marginBottom: '20px',
     },
    tab: {
      padding: '10px 20px',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'border-bottom 0.3s ease',
    },
    activeTab: {
      borderBottom: '2px solid #007BFF',
    },
    inputContainer: {
      maxWidth: '200px',
      
    },
    input: {
      width: '100%',
      padding: '8px',
      marginBottom: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
    addButton: {
      padding: '7px 20px',
      fontSize: '14px',
      cursor: 'pointer',
      borderRadius: '5px',
      border: 'none',
      backgroundColor: '#28a745',
      color: 'white',
      transition: 'background-color 0.3s ease',
    },
  }; 

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setFollowing(userData.following || []);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching following list:", error);
      }
    };
    

    const fetchFollowers = async () => {
      try {
        const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setFollowers(userData.followers || []);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching followers list:", error);
      }
    };

    fetchFollowing();
    fetchFollowers();
  }, [username]);

 

  const handleAddFollower = async (searchUser) => {
    if (searchUser.trim()) {
      try {
        const followerQuery = query(collection(firestore, "users"), where("Username", "==", searchUser));
        const followerSnapshot = await getDocs(followerQuery);
        if (!followerSnapshot.empty) {
          const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userDocRef = userSnapshot.docs[0].ref;
            await updateDoc(userDocRef, {
              following: arrayUnion(searchUser)
            });
            const followerDocRef = followerSnapshot.docs[0].ref;
            await updateDoc(followerDocRef, {
              followers: arrayUnion(username)
            });
            setFollowing([...following, searchUser]);
            setNewFollower('');
            setError('');
            setInvitees([]);
          }
        } else {
          setError("Username not found");
        }
      } catch (error) {
        console.error("Error adding follower:", error);
      }
    }
  };

  const handleRemoveFollower = async (followerUsername) => {
    try {
      const userQuery = query(collection(firestore, "users"), where("Username", "==", username));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userDocRef = userSnapshot.docs[0].ref;
        await updateDoc(userDocRef, {
          following: arrayRemove(followerUsername)
        });
        const followerQuery = query(collection(firestore, "users"), where("Username", "==", followerUsername));
        const followerSnapshot = await getDocs(followerQuery);
        if (!followerSnapshot.empty) {
          const followerDocRef = followerSnapshot.docs[0].ref;
          await updateDoc(followerDocRef, {
            followers: arrayRemove(username)
          });
          setFollowing(following.filter(user => user !== followerUsername));
        }
      }
    } catch (error) {
      console.error("Error removing follower:", error);
    }
  };

  const searchUsers = async (searchTerm) => {
    setNewFollower(searchTerm);
    if (searchTerm.length === 0) {
      setInvitees([]);
      return;
    }
    const userQuery = query(collection(firestore, 'users'), where('Username', '>=', searchTerm), where('Username', '<=', searchTerm + '\uf8ff'));
    const userSnapshot = await getDocs(userQuery);
    setInvitees(userSnapshot.docs.map(doc => doc.data().Username));
  };

 
  return (
    <div>
      <Menu />
      <div style={styles.tabContainer}>
        <div
          style={view === 'following' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setView('following')}
        >
          Following
        </div>
        <div
          style={view === 'followers' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setView('followers')}
        >
          Followers
        </div>
      </div>

      {view === 'following' && (
        <div>
          <h2>Manage Following</h2>
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={newFollower}
              onChange={(e) => searchUsers(e.target.value)}
              placeholder="Add new follower"
              style={styles.input}
            />
          </div>
          <div className="invite-users">
          <ul>
          {invitees.map((invitee) => (
            <li key={invitee} onClick={() => handleAddFollower(invitee)}>
              {invitee}
            </li>
          ))}
        </ul>
        </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div>
            <h3>Following</h3>
            <ul>
              {following.map(followerUsername => (
                <li key={followerUsername}>
                  <Link to={`/profile/${followerUsername.toLowerCase()}`} className="goal-link">{followerUsername}</Link> 
                  <button onClick={() => handleRemoveFollower(followerUsername)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {view === 'followers' && (
        <div>
          <h2>My Followers</h2>
          <div>
            <h3>Followers</h3>
            <ul>
              {followers.map(followerUsername => (
                <li key={followerUsername}>
                  <Link to={`/profile/${followerUsername.toLowerCase()}`} className="goal-link">{followerUsername}</Link> 
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowingFollowersPage;
