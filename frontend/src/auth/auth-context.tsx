import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  api,
  clearToken,
  getToken,
  setToken,
} from '../lib/api';

import type {
  ConnectedUser,
  LoginResponse,
} from '../types/auth';

interface AuthContextValue {
  user: ConnectedUser | null;
  loading: boolean;
  authenticated: boolean;

  login: (
    email: string,
    motDePasse: string,
  ) => Promise<void>;

  logout: () => void;

  refreshUser:
    () => Promise<void>;

  hasRole:
    (role: string) => boolean;

  hasPermission:
    (permission: string) => boolean;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<
      ConnectedUser | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const refreshUser =
    useCallback(
      async () => {
        if (!getToken()) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const current =
            await api<
              ConnectedUser
            >('/auth/me');

          setUser(current);
        }
        catch {
          clearToken();
          setUser(null);
        }
        finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(
    () => {
      void refreshUser();
    },
    [
      refreshUser,
    ],
  );

  async function login(
    email: string,
    motDePasse: string,
  ) {
    const result =
      await api<LoginResponse>(
        '/auth/login',
        {
          method: 'POST',

          body:
            JSON.stringify({
              email,
              motDePasse,
            }),
        },
      );

    setToken(
      result.accessToken,
    );

    setUser(
      result.utilisateur,
    );
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value =
    useMemo(
      () => ({
        user,
        loading,

        authenticated:
          !!user,

        login,
        logout,
        refreshUser,

        hasRole:
          (role: string) =>
            user?.roles.includes(
              role,
            ) ?? false,

        hasPermission:
          (
            permission:
              string,
          ) =>
            user?.permissions
              .includes(
                permission,
              ) ?? false,
      }),
      [
        user,
        loading,
        refreshUser,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      'useAuth doit être utilisé dans AuthProvider',
    );
  }

  return context;
}
