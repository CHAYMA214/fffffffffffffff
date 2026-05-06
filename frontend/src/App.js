import {  Routes, Route } from 'react-router-dom';
import './css/App.css';
import "leaflet/dist/leaflet.css"
import ResetPassword from './component/user.js/resetpassword';
import Map from './component/home.js/Map';
import MapEditorPage from './component/wazeeditor/home/homeeditor';
import MapEditorsiddebarPage from './component/wazeeditor/home/homeeditorsidebar'
import LieuxMenuPage from './component/wazeeditor/ajouter/lieux'
import Dangerpage from './component/wazeeditor/ajouter/dangers';
import SignUp from './component/user.js/SignUp';
import ForgotPassword from './component/user.js/forgotPassword';
import SignIn from './component/user.js/SignIn';
import LieuxentretienMenuPage from './component/wazeeditor/ajouter/lieux/lieuxentretien';
import LieuxserviceMenuPage from './component/wazeeditor/ajouter/lieux/lieuxservices';
import LieuxrestaurantMenuPage from './component/wazeeditor/ajouter/lieux/lieuxrestauration';
import LieuxculturesMenuPage from './component/wazeeditor/ajouter/lieux/lieuxcutures';
import AjouterLieu from './component/tools/formulaire';
import ReportFormSidebar from './component/home.js/reprtfromsidebar';
import UserDashboard from './component/home.js/dashbord';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {useState} from 'react';
function App() {
    const [selectedMarker, setSelectedMarker] = useState(null);
  return (
          <GoogleOAuthProvider clientId="429684687360-g2k8r105lva833bthgi3upbgrmh69b9j.apps.googleusercontent.com">
        <Routes>

         <Route path="/" element={
  <>
<Map >
  
</Map>
  </>
} />

          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/editor" element={
            <>
              <MapEditorPage />
              <MapEditorsiddebarPage />
            </>
          } />
          <Route path="/lieux" element={
            <>
              <MapEditorPage />
              <LieuxMenuPage />
            </>
          } />
          <Route path="/dangers" element={
            <>
              <MapEditorPage />
              <Dangerpage />
            </>
          } />
          <Route path="/lieuxentretien" element={
            <>
              <MapEditorPage />
              <LieuxentretienMenuPage />
            </>
          } />
          <Route path="/services" element={
            <>
              <MapEditorPage />
              <LieuxserviceMenuPage />
            </>
          } />
          <Route path="/restauration" element={
            <>
              <MapEditorPage />
              <LieuxrestaurantMenuPage />
            </>
          } />
          <Route path="/culture-divertissement" element={
            <>
              <MapEditorPage />
              <LieuxculturesMenuPage />
            </>
          } />
          <Route path="/ajouter-lieu" element={
            <>
              <MapEditorPage />
              <AjouterLieu />
            </>
          } />
          <Route path="/login" element={<SignIn />} />
          <Route path="/report" element={<><MapEditorPage /><ReportFormSidebar /></>
} />
 <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/signup" element={<SignUp /> } />
          <Route path="/dashboard" element={<UserDashboard setSelectedMarker={setSelectedMarker} />}/>
        </Routes>

</GoogleOAuthProvider>

  );
}
export default App;
