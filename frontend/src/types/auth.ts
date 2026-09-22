export interface ConnectedUser {
  id: number;
  email: string;
  nomAffichage?: string | null;

  roles: string[];
  permissions: string[];

  etudiant?: {
    id: number;
    matricule?: string;
    nom?: string;
    prenom?: string;
  } | null;

  enseignant?: {
    id: number;
    matricule?: string;
    nom?: string;
    prenom?: string;
  } | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  utilisateur: ConnectedUser;
}

export interface ApiError {
  statusCode?: number;
  error?: string;
  message?: string | string[];
  requestId?: string | null;
}
