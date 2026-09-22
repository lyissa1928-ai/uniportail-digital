import type {
  ReactNode,
} from 'react';

import {
  Navigate,
} from 'react-router';

import { useAuth } from './auth-context';

interface Props {
  children: ReactNode;

  permission?: string;

  anyPermission?:
    string[];

  role?: string;
}

export function RequireAccess({
  children,
  permission,
  anyPermission,
  role,
}: Props) {
  const {
    user,
  } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    role &&
    !user.roles.includes(
      role,
    )
  ) {
    return (
      <Navigate
        to="/403"
        replace
      />
    );
  }

  if (
    permission &&
    !user.permissions.includes(
      permission,
    )
  ) {
    return (
      <Navigate
        to="/403"
        replace
      />
    );
  }

  if (
    anyPermission &&
    !anyPermission.some(
      (item) =>
        user.permissions
          .includes(item),
    )
  ) {
    return (
      <Navigate
        to="/403"
        replace
      />
    );
  }

  return children;
}
