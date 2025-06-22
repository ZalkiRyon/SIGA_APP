import { useAuth } from './context/AuthContext';
import './App.css'
import AppRoutes from './routes';

function App() {
  const { user } = useAuth();
  if (!user) return <AppRoutes tipo="public" />;
  return <AppRoutes tipo={user.role} user={user} />;
}

export default App
