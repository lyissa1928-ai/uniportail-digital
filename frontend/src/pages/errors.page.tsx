import {
  Link,
} from 'react-router';

export function ForbiddenPage() {
  return (
    <div className="screen-center">
      <div className="error-card">
        <span className="error-code">
          403
        </span>

        <h1>
          Accès refusé
        </h1>

        <p>
          Votre compte ne possède
          pas les droits nécessaires.
        </p>

        <Link
          to="/dashboard"
          className="primary-button link-button"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="screen-center">
      <div className="error-card">
        <span className="error-code">
          404
        </span>

        <h1>
          Page introuvable
        </h1>

        <Link
          to="/dashboard"
          className="primary-button link-button"
        >
          Retour
        </Link>
      </div>
    </div>
  );
}
