import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
export default function AjouterLieu() {
  const location = useLocation();
  const navigate = useNavigate();
  const position = location.state?.position;
  const category = location.state?.category || 'lieu';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!position) {
    return <p>Erreur : aucune position fournie.</p>;
  }
  const handleSubmit = (e) => {
    e.preventDefault();
  
    const data = {
      position,
      name,
      description,
      category,
    };
  
    navigate('/', {
      state: { newMarker: data, category }
    });
  };
  
  const titleMap = {
    danger: "Ajouter un danger",
    note: "Ajouter une note",
    event: "Ajouter un événement",
    report: "Ajouter un rapport",
    trajet: "Ajouter un trajet",
    lieu: "Ajouter un lieu"
  };

  return (
    <div className="card p-4"
      style={{
        width: '300px',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        borderTopRightRadius: '15px',
        borderBottomRightRadius: '15px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
      }}>
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-3">{titleMap[category] || "Ajouter"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Nom</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nom..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Coordonnées</label>
            <input
              type="text"
              className="form-control"
              value={`${position[0].toFixed(5)}, ${position[1].toFixed(5)}`}
              readOnly
            />
          </div>
          <button type="submit" className="btn btn-primary">Enregistrer</button>
        </form>
      </div>
    </div>
  );
}
