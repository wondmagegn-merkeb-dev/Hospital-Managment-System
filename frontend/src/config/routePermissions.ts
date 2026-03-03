/**
 * Maps routes to required permissions.
 * Format: resource + action (e.g. "read_user" means user needs "read" on "user" resource).
 * Use null for routes that require no specific permission (e.g. dashboard, profile).
 */
export const ROUTE_PERMISSIONS: Record<string, { resource: string; action: string } | null> = {
  '/dashboard': null,
  '/profile': null,
  '/users': { resource: 'user', action: 'read' },
  '/roles': { resource: 'role', action: 'read' },
  '/patients': { resource: 'patient', action: 'read' },
  '/patients/add': { resource: 'patient', action: 'create' },
  '/patients/records': { resource: 'patient', action: 'read' },
  '/appointments': { resource: 'appointment', action: 'read' },
  '/appointments/new': { resource: 'appointment', action: 'create' },
  '/appointments/calendar': { resource: 'appointment', action: 'read' },
  '/pharmacy': { resource: 'medicine', action: 'read' },
  '/pharmacy/inventory': { resource: 'medicine', action: 'read' },
  '/pharmacy/orders': { resource: 'medicine', action: 'read' },
};

/**
 * Get the required permission for a path.
 * Checks exact match first, then prefix match for nested routes.
 */
export function getRequiredPermission(pathname: string): { resource: string; action: string } | null {
  const normalized = pathname.replace(/\/$/, '') || '/';
  if (ROUTE_PERMISSIONS[normalized] !== undefined) {
    return ROUTE_PERMISSIONS[normalized];
  }
  // For nested routes, find the most specific match
  const segments = normalized.split('/').filter(Boolean);
  let current = '';
  let best: { resource: string; action: string } | null = null;
  for (const seg of segments) {
    current += (current ? '/' : '/') + seg;
    const perm = ROUTE_PERMISSIONS[current];
    if (perm !== undefined) {
      best = perm;
    }
  }
  return best;
}
