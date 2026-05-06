import { useState } from 'react';
import {
  FaExclamationTriangle,
  FaGlobe,
  FaTimes
} from 'react-icons/fa';
import '../../../css/editor.css';
import { useNavigate } from 'react-router-dom';

const SidebarItem = ({ icon, label, onClick }) => (
  <div
    onClick={onClick}
    className={`
      flex items-center p-2 rounded-md cursor-pointer
      transition-all duration-150 btn btn-outline-secondary w-100 mt-2
    `}
  >
    <div className="flex items-center">
      {icon}
      <span className="ms-3">{label}</span>
    </div>
  </div>
);

const MapEditorSidebar = ({ onReportClick }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true); // pour gérer l'ouverture/fermeture

  const goToEditor = (link) => {
    navigate(link);
  };

  if (!isOpen) return null; // sidebar fermée

  return (
    <div
      className="card p-4"
      style={{
        width: '300px',
        height: '100vh',
        position: 'fixed', // fixe à gauche
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        borderTopRightRadius: '15px',
        borderBottomRightRadius: '15px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex flex-col h-full">
{/* Bouton fermer */}
  <h2 className="text-lg font-semibold">Guidiny</h2>
  
  <button
    className="ml-auto btn btn-outline-secondary flex items-center justify-center"
    onClick={() => setIsOpen(false)}
  >
    <FaTimes size={20} />
  </button>


<SidebarItem
  icon={<FaExclamationTriangle size={30} />}
  label="Dangers"
  onClick={() => goToEditor('/dangers')}
/>

        <hr className="my-2" />
        <SidebarItem
          icon={<FaGlobe size={30} />}
          label="Lieux"
          onClick={() => goToEditor('/lieux')}
        />
        <hr className="my-2" />
        <button
          className="btn btn-info w-100 mt-auto"
          onClick={() => goToEditor('/dashboard')}
        >
          Retour
        </button>
      </div>
    </div>
  );
};

export default MapEditorSidebar;
