import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const MapEditorPage = () => {
  const { id } = useParams();
  
  return <div>Éditeur de carte de l'utilisateur {id}</div>;
};

const lieuxMenuData = [
  { label: 'Entretien automobile', link: '/lieuxentretien' },
  { label: 'Commerces et services', link: '/services' },
  { label: 'Restauration', link: '/restauration' },
  { label: 'Culture et divertissement', link: '/culture-divertissement' }
];
const LieuxMenuPage = ({ onBack }) => {
const navigate = useNavigate();
const goToEditor = (link) => {
    navigate(link);
  };
  return (
    <div className="card p-4" style={{
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
      <h3 className="text-xl font-bold mb-4">Catégories de lieux:</h3>
      {lieuxMenuData.map((category) => (
  <div
    key={category.label}
    onClick={() => goToEditor(category.link)}
    className={`
      flex items-center p-2 rounded-md cursor-pointer
      transition-all duration-150 btn btn-outline-secondary w-100 mt-2
    `}  >
    <div className="flex items-center">
      <span className="text-xl mr-2">{category.icon}</span>
      <span className="font-semibold">{category.label}</span>
    </div>
  </div>
))}
      <button
        onClick={() => navigate('/editor')}
        className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
      >
        Retour
      </button>
    </div>
  );
};

export default LieuxMenuPage;
