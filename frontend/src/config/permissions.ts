import permissionsConfig from './permissions.json';
import type { Permission } from '../types/role';

export interface PermissionResource {
  resource: string;
  actions: string[];
}

export interface PermissionModule {
  name: string;
  resources: PermissionResource[];
}

export interface PermissionsConfig {
  modules: PermissionModule[];
}

const config = permissionsConfig as PermissionsConfig;

/**
 * Builds a flat list of Permission objects from the JSON config.
 * Uses name (e.g. "create_user") as the unique identifier.
 */
export function buildPermissionsFromConfig(): Permission[] {
  const permissions: Permission[] = [];

  config.modules.forEach((module) => {
    module.resources.forEach(({ resource, actions }) => {
      actions.forEach((action) => {
        permissions.push({
          name: `${action}_${resource}`,
          description: null,
          module: module.name,
        });
      });
    });
  });

  return permissions;
}

export { config as permissionsConfig };
