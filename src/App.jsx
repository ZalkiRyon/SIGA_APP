import { useAuth } from './context/AuthContext';
import './App.css'
import Routes from './routes';

function App() {
  const { user } = useAuth();
  if (!user) return <Routes tipo="public" />;
  return <Routes tipo={user.role} user={user} />;
}

export default App
