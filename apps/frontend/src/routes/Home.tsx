import { Link } from 'react-router-dom';
import ProfilePicker from '../components/ProfilePicker';
import HighContrastToggle from '../components/HighContrastToggle';

export default function Home() {
  return (
    <div className="p-4 space-y-6">
      <HighContrastToggle />
      <h1 className="text-2xl font-bold text-center">COURS D’INITIATION INFORMATIQUE N1</h1>
      <p className="text-center">Choisissez un profil pour commencer.</p>
      <ProfilePicker />
      <div className="flex justify-center space-x-4">
        <Link to="/admin" className="underline">Importer/Mettre à jour le CSV</Link>
      </div>
    </div>
  );
}
