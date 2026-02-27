import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRequiredPermission } from '../config/routePermissions';
import type { UserPermissions } from '../services/authService';

/** Treat "view" and "read" as equivalent (backend may use either) */
const ACTION_ALIASES: Record<string, string[]> = {
  read: ['read', 'view'],
  view: ['read', 'view'],
};

/**
 * Check if user has a specific permission (resource + action).
 * Backend format: permissions = { "user": ["view", "create"], "patient": ["read"] }
 * Supports both "read" and "view" as equivalent actions.
 */
export function hasPermission(
  permissions: UserPermissions | undefined,
  resource: string,
  action: string
): boolean {
  if (!permissions) return false;
  const actions = permissions[resource];
  if (!Array.isArray(actions)) return false;
  if (actions.includes(action)) return true;
  const aliases = ACTION_ALIASES[action];
  if (aliases) {
    return aliases.some((a) => actions.includes(a));
  }
  return false;
}

/**
 * Hook to access permission checks for the current user.
 */
export function usePermissions() {
  const { user } = useAuth();
  const permissions = user?.permissions ?? {};

  const can = useMemo(
    () => ({
      read: (resource: string) => hasPermission(permissions, resource, 'read'),
      create: (resource: string) => hasPermission(permissions, resource, 'create'),
      update: (resource: string) => hasPermission(permissions, resource, 'update'),
      delete: (resource: string) => hasPermission(permissions, resource, 'delete'),
      any: (resource: string, action: string) => hasPermission(permissions, resource, action),
    }),
    [permissions]
  );

  const hasRouteAccess = useMemo(
    () => (pathname: string) => {
      const required = getRequiredPermission(pathname);
      if (!required) return true;
      return hasPermission(permissions, required.resource, required.action);
    },
    [permissions]
  );

  return { permissions, can, hasRouteAccess };
}
