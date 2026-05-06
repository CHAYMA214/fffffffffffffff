import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import ReportFormSidebar from '../home.js/reprtfromsidebar';

function Offcanvas({ marker }) {
  const navigate = useNavigate();
  const [reporting, setReporting] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const onReportClick = () => {
    if (!marker) {
      toast.info("Veuillez d'abord sélectionner un marqueur sur la carte.");
      return;
    }
    if (!marker.isSaved) {
      toast.info("Veuillez enregistrer le marqueur avant de signaler.");
      return;
    }
    setSelectedMarker(marker);
    setReporting(true);
  };

  const handleCloseReportForm = () => {
    setReporting(false);
    setSelectedMarker(null);
  };

  return (
    <>
      <div
        className="offcanvas offcanvas-start"
        data-bs-scroll="true"
        tabIndex="-1"
        id="offcanvasWithBothOptions"
        aria-labelledby="offcanvasWithBothOptionsLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasWithBothOptionsLabel"></h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body">
          {/* Tes switches */}
          <div className="form-check form-switch d-flex justify-content-between align-items-center mb-3">
            <input className="form-check-input" type="checkbox" id="trafficJamsSwitch" />
            <label className="form-check-label" htmlFor="trafficJamsSwitch">
              Show traffic jams
            </label>
            <i className="bi bi-cone-striped" style={{ fontSize: "1.2rem" }} />
          </div>
          {/* ... autres switches ... */}

          <hr />

          <button
            className="btn btn-outline-primary w-100 mb-3"
            onClick={() => {
              navigate("/editor");
            }}
          >
            Edit the map
          </button>
          <button className="btn btn-outline-primary w-100 mb-3" onClick={onReportClick}>
            Report an issue
          </button>

          <hr />

          <h6>About Us</h6>
          <ul className="list-unstyled ps-3">
            <li>
              <a
                href="https://www.linkedin.com/in/chayma-baklouti/"
                className="text-decoration-none"
              >
                About us
              </a>
            </li>
          </ul>

          <button className="btn btn-outline-secondary w-100 mt-2">Support</button>
        </div>
      </div>

      {/* Affichage conditionnel du formulaire de report */}
      {reporting && selectedMarker && (
        <ReportFormSidebar
          marker={selectedMarker}
          onClose={handleCloseReportForm}
        />
      )}

      <ToastContainer />
    </>
  );
}

export default Offcanvas;
