import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageSpinner } from '../ui/index.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}
