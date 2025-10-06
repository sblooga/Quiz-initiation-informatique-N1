import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import Quiz from './routes/Quiz';
import Results from './routes/Results';
import Scoreboard from './routes/Scoreboard';
import Admin from './routes/Admin';
import Enrollment from './routes/Enrollment';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/resultats" element={<Results />} />
      <Route path="/scores" element={<Scoreboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/inscription" element={<Enrollment />} />
    </Routes>
  );
}
