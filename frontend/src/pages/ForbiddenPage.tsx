import {
  Link,
} from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div
      className="forbidden-page"
    >
      <h1>
        Accès interdit
      </h1>

      <p>
        Votre profil ne dispose
        pas des autorisations
        nécessaires.
      </p>

      <Link to="/">
        Retour au tableau de bord
      </Link>
    </div>
  );
}