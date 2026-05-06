import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReportFormSidebar = ({ marker, userId, defaultType, onClose, onSuccess }) => {
  const [type, setType] = useState(defaultType || '');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState(marker?.address || '');

  const navigate = useNavigate();
  const lat = marker?.location?.[0];
  const lng = marker?.location?.[1];

  useEffect(() => {
    if (defaultType) setType(defaultType);
    if (marker?.address) setAddress(marker.address);
  }, [defaultType, marker]);

  useEffect(() => {
    if (!marker) {
      setType('');
      setDescription('');
      setImage('');
      setError('');
      setAddress('');
    }
  }, [marker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (lat == null || lng == null) {
      setError('La position du marqueur est invalide.');
      toast.error('La position du marqueur est invalide.');
      setLoading(false);
      return;
    }

    if (image && !/^data:image\/|^https?:\/\//.test(image)) {
      setError("Le format de l'image est invalide.");
      toast.error("Le format de l'image est invalide.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reports/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          description,
          lat,
          lng,
          image,
          address
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors de l’envoi du signalement.');

      toast.success('Signalement envoyé avec succès !');
      onSuccess(data.marker);
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card position-fixed top-0 start-0 h-100 shadow"
      style={{ width: '300px', zIndex: 1000, borderTopRightRadius: '15px', borderBottomRightRadius: '15px' }}
    >
      <div className="card-body position-relative">
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-2"
          aria-label="Fermer"
          onClick={onClose}
        />
        <h5 className="card-title mb-3">Signaler un danger</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="reportType" className="form-label">Type</label>
            <select
              id="reportType"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Choisir</option>
              <option value="accident">Accident</option>
              <option value="route bloquée">Route bloquée</option>
              <option value="travaux">Travaux</option>
              <option value="inondation">Inondation</option>
              <option value="animal">Animal</option>
              <option value="nid-de-poule">Nid-de-poule</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="reportDescription" className="form-label">Description</label>
            <textarea
              id="reportDescription"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="reportImage" className="form-label">Image (URL ou base64, optionnel)</label>
            <input
              id="reportImage"
              type="text"
              className="form-control"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Lien vers l'image (optionnel)"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="reportAddress" className="form-label">Adresse</label>
            <input id="reportAddress" type="text" className="form-control" value={address} readOnly />
          </div>

          <div className="mb-3">
            <label htmlFor="reportLat" className="form-label">Latitude</label>
            <input id="reportLat" type="text" className="form-control" value={lat != null ? lat.toFixed(6) : 'Inconnu'} readOnly />
          </div>

          <div className="mb-3">
            <label htmlFor="reportLng" className="form-label">Longitude</label>
            <input id="reportLng" type="text" className="form-control" value={lng != null ? lng.toFixed(6) : 'Inconnu'} readOnly />
          </div>

          {error && <div className="text-danger mb-2">{error}</div>}

          <div className="d-flex">
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                navigate('/editor');
              }}
            >
              Annuler
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default ReportFormSidebar;
