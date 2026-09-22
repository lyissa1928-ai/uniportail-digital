import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router';

import { useAuth } from './auth-context';

export function ProtectedRoute() {
  const {
    authenticated,
    loading,
  } = useAuth();

  const location =
    useLocation();

  if (loading) {
    return (
      <div className="screen-center">
        <div className="loader" />
        <p>
          Chargement de votre espace...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}
