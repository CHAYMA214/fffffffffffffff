import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMap } from "react-leaflet";
import { FaCrosshairs, FaPlus, FaMinus, FaUserCircle, FaTimes,FaEdit  } from 'react-icons/fa';
import { useAuth } from '../user.js/auth';
import '../../css/map.css'; 

const MapdashControls = ({ setPosition }) => {
  const map = useMap();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPosition = [latitude, longitude];
          map.setView(userPosition, 15);
          setPosition(userPosition);
        },
        () => alert('Unable to retrieve your location.')
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const goto = () => {
    navigate('/editor');
  };

  return (
    <>
      <div className="mapdash-controls">
        <div className="button-group">
               <button className="iconStyle" onClick={goto} title="Edit Info">
            <FaEdit />
          </button>
          <button className="iconStyle" onClick={() => setShowPopup(true)} title="User Info">
            <FaUserCircle />
          </button>
          <button className="iconStyle" onClick={locateUser} title="Locate Me">
            <FaCrosshairs />
          </button>
          <button className="iconStyle" onClick={zoomIn} title="Zoom In">
            <FaPlus />
          </button>
          <button className="iconStyle" onClick={zoomOut} title="Zoom Out">
            <FaMinus />
          </button>
        </div>
      </div>
      {showPopup && (
  <div className="popup-overlay">
    <div className="popup">
      <button className="close-btn" onClick={() => setShowPopup(false)}><FaTimes /></button>
      <h4>User Info</h4>

      {user ? (
        <>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>User not logged in.</p>
      )}
    </div>
  </div>
)}

      <style>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .popup {
          background: white;
          padding: 20px;
          border-radius: 10px;
          width: 300px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          position: relative;
          text-align: center;
        }

        .close-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
        }

        .logout-btn {
          margin-top: 15px;
          background: #dc3545;
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default MapdashControls;
