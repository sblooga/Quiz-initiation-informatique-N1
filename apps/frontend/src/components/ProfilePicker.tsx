import { useState } from 'react';
import { Link } from 'react-router-dom';
import teacherImg from '../assets/teacher.svg';
import avatar1 from '../assets/avatar1.svg';
import avatar2 from '../assets/avatar2.svg';
import avatar3 from '../assets/avatar3.svg';
import avatar4 from '../assets/avatar4.svg';

const defaults = [
  { name: 'Professeur', img: teacherImg },
  { name: 'Alice', img: avatar1 },
  { name: 'Bernard', img: avatar2 },
  { name: 'Chloé', img: avatar3 },
  { name: 'Daniel', img: avatar4 }
];

export default function ProfilePicker() {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('profiles');
    return saved ? JSON.parse(saved) : defaults;
  });

  const addProfile = () => {
    const name = prompt('Nom du nouvel élève ?');
    if (!name) return;
    const newProfiles = [...profiles, { name, img: avatar1 }];
    setProfiles(newProfiles);
    localStorage.setItem('profiles', JSON.stringify(newProfiles));
  };

  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
      {profiles.map(p => (
        <Link key={p.name} to={`/quiz?profile=${encodeURIComponent(p.name)}`} className="flex flex-col items-center" aria-label={`Profil ${p.name}`}>
          <img src={p.img} alt="" className="w-24 h-24 rounded-full border" />
          <span className="mt-2">{p.name}</span>
        </Link>
      ))}
      <button onClick={addProfile} className="border rounded p-4">Ajouter un élève</button>
    </div>
  );
}
