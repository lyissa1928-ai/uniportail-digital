import type {
  ApiError,
} from '../types/auth';

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3001/api';

const TOKEN_KEY =
  'suivi_evaluation_access_token';

export function getToken() {
  return sessionStorage.getItem(
    TOKEN_KEY,
  );
}

export function setToken(
  token: string,
) {
  sessionStorage.setItem(
    TOKEN_KEY,
    token,
  );
}

export function clearToken() {
  sessionStorage.removeItem(
    TOKEN_KEY,
  );
}

export class ApiException
  extends Error
{
  status: number;
  details?: ApiError;

  constructor(
    status: number,
    details?: ApiError,
  ) {
    const raw =
      details?.message;

    const message =
      Array.isArray(raw)
        ? raw.join(', ')
        : raw ??
          `Erreur HTTP ${status}`;

    super(message);

    this.status = status;
    this.details = details;
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers =
    new Headers(
      options.headers,
    );

  headers.set(
    'Accept',
    'application/json',
  );

  if (
    options.body &&
    !headers.has(
      'Content-Type',
    )
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    );
  }

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
      },
    );

  if (!response.ok) {
    let details:
      ApiError | undefined;

    try {
      details =
        await response.json();
    }
    catch {
      details =
        undefined;
    }

    if (
      response.status === 401 &&
      path !== '/auth/login'
    ) {
      clearToken();
    }

    throw new ApiException(
      response.status,
      details,
    );
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  return response.json();
}

export {
  API_URL,
};
