import React, { useState, useEffect } from 'react';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from 'leaflet';
import '../../css/map.css';
import MapdashControls from '../tools/dashmapcontrollers';
import LeafletRoutingMachine from "../tools/wrapper";
import DirectionPanel from '../tools/DirectionPanelhome';
// Correction des icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DefaultIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png", // icône en ligne
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const myPositionIcon = L.icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

function UserDashboard({ setSelectedMarker }) {
  const [position, setPosition] = useState(null);
  const [allMarkers, setAllMarkers] = useState([]);
  const [start, setStart] = useState(null);  // ✅ déplacé à l’intérieur
  const [end, setEnd] = useState(null);      // ✅ déplacé à l’intérieur

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await fetch('/api/markers');
        const data = await response.json();
        setAllMarkers(data.markers);
      } catch (err) {
        console.error('Erreur lors de la récupération des marqueurs :', err);
      }
    };
    fetchMarkers();
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
            <DirectionPanel setStart={setStart} setEnd={setEnd} start={start} end={end} />
      
      <MapContainer center={[35.82539, 10.63699]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapdashControls setPosition={setPosition} />

        {/* Position utilisateur */}
        {position && (
          <>
            <Marker position={position} icon={myPositionIcon} />
            <Circle center={position} radius={200} pathOptions={{ fillColor: 'blue' }} />
          </>
        )}

        {/* Marqueurs backend */}
        {allMarkers.map(marker => (
          <Marker
            key={marker.id}
            position={[marker.location.lat, marker.location.lng]}
            eventHandlers={{
              click: () => {
                setSelectedMarker({
                  ...marker,
                  location: [marker.location.lat, marker.location.lng],
                  isSaved: true,
                });
              }
            }}
          >
            <Popup>
              <strong>{marker.type}</strong><br />
              {marker.description}<br />
              {marker.address}
            </Popup>
          </Marker>
        ))}

        {/* Début et fin du trajet */}
        {start && <Marker position={start} icon={DefaultIcon} />}
        {end && <Marker position={end} icon={DefaultIcon} />}

        {/* Routing */}
        {start && end && <LeafletRoutingMachine start={start} end={end} />}
      </MapContainer>
    </div>
  );
}

export default UserDashboard;
