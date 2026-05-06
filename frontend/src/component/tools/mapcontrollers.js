import React from 'react';
import { useMap } from "react-leaflet";
import { FaCrosshairs, FaPlus, FaMinus ,FaUserCircle, Fa500Px  } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../css/map.css';
const MapControls = ({ setPosition }) => {  
const navigate = useNavigate();
  const map = useMap();
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
  return (
    <div>
    <div className="button-group">
      <button className='iconStyle' onClick={locateUser}>
        <FaCrosshairs />
      </button>
      <button className='iconStyle' onClick={zoomIn}>
        <FaPlus />
      </button>
      <button className='iconStyle' onClick={zoomOut}>
        <FaMinus />
      </button>
    <button className='iconStyle'   onClick={() => navigate('/login')}>
        <FaUserCircle />
      </button>
</div>
</div>);
};

export default MapControls;
