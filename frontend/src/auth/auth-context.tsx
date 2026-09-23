import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

type LogoutReason =
  | 'MANUAL'
  | 'INACTIVITY'
  | 'SESSION_EXPIRED';

type AuthMessage =
  | {
      type:
        'AUTH_REQUEST';
      requestId:
        string;
    }
  | {
      type:
        'AUTH_STATE';
      requestId:
        string;
      token:
        string;
      stamp:
        number;
    }
  | {
      type:
        'AUTH_LOGIN';
      token:
        string;
      stamp:
        number;
    }
  | {
      type:
        'AUTH_LOGOUT';
      reason:
        LogoutReason;
      stamp:
        number;
    };

interface AuthContextValue {
  user: ConnectedUser | null;
  loading: boolean;
  authenticated: boolean;
  logoutReason:
    LogoutReason | null;

  login: (
    email: string,
    motDePasse: string,
  ) => Promise<void>;

  logout: (
    reason?: LogoutReason,
  ) => void;

  clearLogoutReason:
    () => void;

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

const AUTH_CHANNEL =
  'uniportail_auth_channel';

const ACTIVITY_KEY =
  'uniportail_last_activity';

const SESSION_STAMP_KEY =
  'uniportail_session_stamp';

const SESSION_TIMEOUT_MS =
  30 *
  60 *
  1000;

const ACTIVITY_THROTTLE_MS =
  10 *
  1000;

function readStamp() {
  const raw =
    sessionStorage.getItem(
      SESSION_STAMP_KEY,
    );

  const value =
    Number(raw);

  return Number.isFinite(
    value,
  )
    ? value
    : 0;
}

function writeStamp(
  stamp:
    number,
) {
  sessionStorage.setItem(
    SESSION_STAMP_KEY,
    String(stamp),
  );
}

function clearStamp() {
  sessionStorage.removeItem(
    SESSION_STAMP_KEY,
  );
}

function readLastActivity() {
  const raw =
    localStorage.getItem(
      ACTIVITY_KEY,
    );

  const value =
    Number(raw);

  return Number.isFinite(
    value,
  )
    ? value
    : 0;
}

function writeLastActivity(
  at =
    Date.now(),
) {
  localStorage.setItem(
    ACTIVITY_KEY,
    String(at),
  );
}

function clearLastActivity() {
  localStorage.removeItem(
    ACTIVITY_KEY,
  );
}

function requestId() {
  return (
    Date.now()
      .toString(36) +
    '-' +
    Math.random()
      .toString(36)
      .slice(2)
  );
}

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

  const [
    logoutReason,
    setLogoutReason,
  ] =
    useState<
      LogoutReason | null
    >(null);

  const channelRef =
    useRef<
      BroadcastChannel | null
    >(null);

  const syncTimerRef =
    useRef<
      number | null
    >(null);

  const lastActivityWriteRef =
    useRef(0);

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
          clearStamp();
          setUser(null);
        }
        finally {
          setLoading(false);
        }
      },
      [],
    );

  const applyLogout =
    useCallback(
      (
        reason:
          LogoutReason,
        broadcast:
          boolean,
      ) => {
        const stamp =
          Date.now();

        clearToken();
        clearStamp();
        clearLastActivity();

        setUser(null);
        setLoading(false);

        setLogoutReason(
          reason ===
          'MANUAL'
            ? null
            : reason,
        );

        if (
          broadcast
        ) {
          channelRef.current
            ?.postMessage({
              type:
                'AUTH_LOGOUT',
              reason,
              stamp,
            } satisfies AuthMessage);
        }
      },
      [],
    );

  useEffect(
    () => {
      if (
        typeof BroadcastChannel ===
        'undefined'
      ) {
        void refreshUser();
        return;
      }

      const channel =
        new BroadcastChannel(
          AUTH_CHANNEL,
        );

      channelRef.current =
        channel;

      const pendingRequest =
        requestId();

      channel.onmessage =
        (
          event:
            MessageEvent<AuthMessage>,
        ) => {
          const message =
            event.data;

          if (
            !message ||
            typeof message !==
              'object'
          ) {
            return;
          }

          if (
            message.type ===
            'AUTH_REQUEST'
          ) {
            const token =
              getToken();

            if (!token) {
              return;
            }

            channel.postMessage({
              type:
                'AUTH_STATE',
              requestId:
                message.requestId,
              token,
              stamp:
                readStamp() ||
                Date.now(),
            } satisfies AuthMessage);

            return;
          }

          if (
            message.type ===
            'AUTH_STATE'
          ) {
            if (
              message.requestId !==
                pendingRequest ||
              getToken()
            ) {
              return;
            }

            if (
              syncTimerRef.current !==
              null
            ) {
              window.clearTimeout(
                syncTimerRef.current,
              );

              syncTimerRef.current =
                null;
            }

            setToken(
              message.token,
            );

            writeStamp(
              message.stamp,
            );

            writeLastActivity();

            setLogoutReason(
              null,
            );

            void refreshUser();

            return;
          }

          if (
            message.type ===
            'AUTH_LOGIN'
          ) {
            const currentStamp =
              readStamp();

            if (
              message.stamp <
              currentStamp
            ) {
              return;
            }

            setToken(
              message.token,
            );

            writeStamp(
              message.stamp,
            );

            writeLastActivity();

            setLogoutReason(
              null,
            );

            setLoading(true);

            void refreshUser();

            return;
          }

          if (
            message.type ===
            'AUTH_LOGOUT'
          ) {
            const currentStamp =
              readStamp();

            if (
              message.stamp <
              currentStamp
            ) {
              return;
            }

            clearToken();
            clearStamp();
            clearLastActivity();

            setUser(null);
            setLoading(false);

            setLogoutReason(
              message.reason ===
              'MANUAL'
                ? null
                : message.reason,
            );
          }
        };

      if (
        getToken()
      ) {
        void refreshUser();
      }
      else {
        channel.postMessage({
          type:
            'AUTH_REQUEST',
          requestId:
            pendingRequest,
        } satisfies AuthMessage);

        syncTimerRef.current =
          window.setTimeout(
            () => {
              syncTimerRef.current =
                null;

              void refreshUser();
            },
            300,
          );
      }

      return () => {
        if (
          syncTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            syncTimerRef.current,
          );
        }

        channel.close();

        if (
          channelRef.current ===
          channel
        ) {
          channelRef.current =
            null;
        }
      };
    },
    [
      refreshUser,
    ],
  );

  useEffect(
    () => {
      const handleUnauthorized =
        () => {
          if (
            getToken()
          ) {
            return;
          }

          applyLogout(
            'SESSION_EXPIRED',
            true,
          );
        };

      window.addEventListener(
        'uniportail:unauthorized',
        handleUnauthorized,
      );

      return () => {
        window.removeEventListener(
          'uniportail:unauthorized',
          handleUnauthorized,
        );
      };
    },
    [
      applyLogout,
    ],
  );

  useEffect(
    () => {
      const markActivity =
        () => {
          if (
            !getToken()
          ) {
            return;
          }

          const now =
            Date.now();

          if (
            now -
              lastActivityWriteRef.current <
            ACTIVITY_THROTTLE_MS
          ) {
            return;
          }

          lastActivityWriteRef.current =
            now;

          writeLastActivity(
            now,
          );
        };

      const events:
        Array<
          keyof WindowEventMap
        > = [
          'pointerdown',
          'keydown',
          'scroll',
          'touchstart',
          'focus',
        ];

      for (
        const eventName
        of events
      ) {
        window.addEventListener(
          eventName,
          markActivity,
          {
            passive:
              true,
          },
        );
      }

      const visibilityHandler =
        () => {
          if (
            document.visibilityState ===
            'visible'
          ) {
            markActivity();
          }
        };

      document.addEventListener(
        'visibilitychange',
        visibilityHandler,
      );

      const interval =
        window.setInterval(
          () => {
            if (
              !getToken()
            ) {
              return;
            }

            const lastActivity =
              readLastActivity();

            if (
              !lastActivity
            ) {
              writeLastActivity();
              return;
            }

            if (
              Date.now() -
                lastActivity >=
              SESSION_TIMEOUT_MS
            ) {
              applyLogout(
                'INACTIVITY',
                true,
              );
            }
          },
          15 *
            1000,
        );

      return () => {
        for (
          const eventName
          of events
        ) {
          window.removeEventListener(
            eventName,
            markActivity,
          );
        }

        document.removeEventListener(
          'visibilitychange',
          visibilityHandler,
        );

        window.clearInterval(
          interval,
        );
      };
    },
    [
      applyLogout,
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

    const stamp =
      Date.now();

    setToken(
      result.accessToken,
    );

    writeStamp(
      stamp,
    );

    writeLastActivity(
      stamp,
    );

    setLogoutReason(
      null,
    );

    setUser(
      result.utilisateur,
    );

    channelRef.current
      ?.postMessage({
        type:
          'AUTH_LOGIN',
        token:
          result.accessToken,
        stamp,
      } satisfies AuthMessage);
  }

  function logout(
    reason:
      LogoutReason =
        'MANUAL',
  ) {
    applyLogout(
      reason,
      true,
    );
  }

  function clearLogoutReason() {
    setLogoutReason(
      null,
    );
  }

  const value =
    useMemo(
      () => ({
        user,
        loading,

        authenticated:
          !!user,

        logoutReason,

        login,
        logout,
        clearLogoutReason,
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
        logoutReason,
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

export {
  SESSION_TIMEOUT_MS,
};
