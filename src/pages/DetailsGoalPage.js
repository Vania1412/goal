import React from 'react';
import { useParams } from 'react-router-dom';
import profilePic from '../assets/icon.png';

function DetailsGoalPage() {
  const { title } = useParams();

  const containerStyle = {
    padding: '20px',
    textAlign: 'center',
  };

  const headerStyle = {
    alignItems: 'center',
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '10px 0',
  };

  const textStyle = {
    fontSize: '16px',
    margin: '5px 0',
  };

  const profileContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '10px 0',
  };

  const profileStyle = {
    alignItems: 'center',
    margin: '0 10px',
  };

  const profileNameStyle = {
    fontSize: '16px',
    marginBottom: '5px',
  };

  const profilePicStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
  };

  const subtitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '10px 0',
  };

  const profileTipStyle = {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
  };

  const profilePicTipStyle = {
    width: '30px',
    height: '30px',
    borderRadius: '15px',
    marginRight: '10px',
  };

  const profileNameTipStyle = {
    fontSize: '16px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <p style={textStyle}>Trip To Italy</p>
        <p style={textStyle}>23 users saving for this goal</p>
        <p style={textStyle}>64 users achieved this goal</p>
        <p style={textStyle}>Users expected to achieve within a similar timeframe as you:</p>
        <div style={profileContainerStyle}>
          <div style={profileStyle}>
            <p style={profileNameStyle}>George</p>
            <img src={profilePic} alt="Profile" style={profilePicStyle} />
            <button className="followButton">Follow</button>
          </div>
          <div style={profileStyle}>
            <p style={profileNameStyle}>Ivy</p>
            <img src={profilePic} alt="Profile" style={profilePicStyle} />
            <button className="followButton">Follow</button>
          </div>
        </div>
        <h2 style={subtitleStyle}>Featured Stories & Tips</h2>
        <div style={profileTipStyle}>
          <img src={profilePic} alt="Profile" style={profilePicTipStyle} />
          <p style={profileNameTipStyle}>Tim</p>
        </div>
        <p style={textStyle}>Buy round-trip tickets as soon as you know the starting date of your trip. Always keep track of the ticket price!</p>
        <div style={profileTipStyle}>
          <img src={profilePic} alt="Profile" style={profilePicTipStyle} />
          <p style={profileNameTipStyle}>Olivia</p>
        </div>
        <p style={textStyle}>If you are going to Firenze, try Trattoria Dall'oste!! It's so delicious, definitely worth the price.</p>
        <button onClick={() => window.history.back()}>Go back to Home</button>
        <h2 style={subtitleStyle}>Memory Collection</h2>
        <div>
          <p style={textStyle}>John</p>
          <p style={textStyle}>Freya</p>
          <p style={textStyle}>Isabella</p>
        </div>
      </div>
    </div>
  );
}

export default DetailsGoalPage;
