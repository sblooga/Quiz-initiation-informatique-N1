import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import Quiz from './routes/Quiz';
import Results from './routes/Results';
import Scoreboard from './routes/Scoreboard';
import Admin from './routes/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/resultats" element={<Results />} />
      <Route path="/classement" element={<Scoreboard />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
