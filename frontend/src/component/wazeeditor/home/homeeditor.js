import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents
} from 'react-leaflet';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../user.js/auth';

const blueIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue.png",
  iconSize: [21, 34],
  iconAnchor: [10, 34],
});

async function saveMarkerToBackend(marker) {
  const res = await fetch('/api/markers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(marker),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erreur lors de l’enregistrement');
  }
  return await res.json();
}

async function deleteMarkerFromBackend(markerId) {
  const res = await fetch(`/api/markers/${markerId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression');
  }
}

function MapClickHandler({ onMapClick, isEnabled }) {
  useMapEvents({
    click(e) {
      if (isEnabled) onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

function MarkerDynamicPopup({ marker, onUpdate, onFieldChange, eventHandlers }) {
  const saveAndClose = async (e) => {
    e.preventDefault();
    try {
      await saveMarkerToBackend(marker);
      onUpdate(marker.id, { ...marker, isSaved: true });
      toast.success('Marqueur enregistré avec succès');
    } catch (err) {
      toast.error('verifier votre données');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMarkerFromBackend(marker.id);
      onUpdate(marker.id, null);
      toast.success("Marqueur supprimé !");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <Marker position={marker.location} icon={blueIcon} eventHandlers={eventHandlers}>
      <Popup autoClose={false} closeOnClick={false}>
        {!marker.isSaved ? (
          <div style={{ width: 220 }}>
            <label>Description:</label>
            <textarea
              value={marker.description}
              onChange={e => onFieldChange(marker.id, 'description', e.target.value)}
              style={{ width: '100%' }}
            />
            <label>Adresse:</label>
            <input
              type="text"
              value={marker.address}
              onChange={e => onFieldChange(marker.id, 'address', e.target.value)}
              style={{ width: '100%' }}
            />
            <label>Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const localUrl = URL.createObjectURL(file);
                  onFieldChange(marker.id, 'image', localUrl);
                }
              }}
              style={{ width: '100%' }}
            />
            <label>Créateur:</label>
            <input
              type="text"
              value={marker.creator}
              disabled
              style={{ width: '100%', background: '#f0f0f0' }}
            />
            <button
              onClick={saveAndClose}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '6px',
                background: 'green',
                color: 'white',
                border: 'none',
                borderRadius: 4
              }}
            >
              Enregistrer
            </button>
          </div>
        ) : (
          <div style={{ width: 220 }}>
            <strong>Type:</strong> {marker.type}<br />
            <strong>Description:</strong><br />
            <div>{marker.description || 'Aucune description'}</div>
            <strong>Adresse:</strong><br />
            <div>{marker.address}</div>
            {marker.image && (
              <>
                <strong>Image:</strong><br />
                <img src={marker.image} alt="marker" style={{ width: '100%' }} />
              </>
            )}
            <strong>Créateur:</strong><br />
            <div>{marker.creator}</div>

            <button
              style={{
                marginTop: 10,
                backgroundColor: '#d9534f',
                color: 'white',
                border: 'none',
                padding: '6px',
                width: '100%',
                borderRadius: 4,
              }}
              onClick={handleDelete}
            >
              Supprimer
            </button>
          </div>
        )}
      </Popup>
    </Marker>
  );
}

export default function MyMap() {
  const { user } = useAuth();
  const location = useLocation();
  const label = new URLSearchParams(location.search).get("label");
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const handleFieldChange = (id, field, value) => {
    setMarkers(prev =>
      prev.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  const handleUpdate = (id, updated) => {
    if (updated === null) {
      setMarkers(prev => prev.filter(m => m.id !== id));
    } else {
      setMarkers(prev => prev.map(m => m.id === id ? updated : m));
    }
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return data.display_name || 'Adresse non trouvée';
    } catch {
      return 'Adresse non trouvée';
    }
  };

  const handleMapClick = async (position) => {
    if (!label || !user?.id) return;

    const address = await getAddressFromCoords(position[0], position[1]);
    const newMarker = {
      id: Date.now(),
      type: label,
      description: '',
      address,
      location: position,
      image:
        'https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_(aerial_view).jpg',
      creator: user.id,
      isSaved: false
    };
    setMarkers(prev => [...prev, newMarker]);
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  useEffect(() => {
    const fetchUserMarkers = async () => {
      if (!user) return;
        const response = await fetch(`/api/markers/user/${user.id}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        const loadedMarkers = data.markers.map(marker => ({
          id: marker.id,
          type: marker.type,
          description: marker.description,
          address: marker.address,
          location: [marker.location.lat, marker.location.lng],
          image: marker.image,
          creator: marker.creator,
          isSaved: true,
        }));

        setMarkers(loadedMarkers);

    };

    fetchUserMarkers();
  }, [user]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[35.82539, 10.63699]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} isEnabled={!!label} />
        {markers.map(marker => (
          <MarkerDynamicPopup
            key={marker.id}
            marker={marker}
            onUpdate={handleUpdate}
            onFieldChange={handleFieldChange}
            eventHandlers={{
              click: () => handleMarkerClick(marker),
            }}
          />
        ))}
      </MapContainer>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
