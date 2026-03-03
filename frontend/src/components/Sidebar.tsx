import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Calendar, 
  Pill, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface SubMenuItem {
  label: string;
  path: string;
  permission?: { resource: string; action: string };
}

interface MenuItem {
  icon: any;
  label: string;
  path?: string;
  permission?: { resource: string; action: string } | null;
  submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: null },
  { 
    icon: Users, 
    label: 'Patients Manage', 
    permission: { resource: 'patient', action: 'read' },
    submenu: [
      { label: 'All Patients', path: '/patients', permission: { resource: 'patient', action: 'read' } },
      { label: 'Add Patient', path: '/patients/add', permission: { resource: 'patient', action: 'create' } },
    ]
  },
  { 
    icon: UserCog, 
    label: 'User Management', 
    permission: { resource: 'user', action: 'read' },
    submenu: [
      { label: 'Users', path: '/users', permission: { resource: 'user', action: 'read' } },
      { label: 'Roles & Permissions', path: '/roles', permission: { resource: 'role', action: 'read' } },
    ]
  },
  { 
    icon: Calendar, 
    label: 'Appointments', 
    permission: { resource: 'appointment', action: 'read' },
    submenu: [
      { label: 'All Appointments', path: '/appointments', permission: { resource: 'appointment', action: 'read' } },
      { label: 'Schedule Appointment', path: '/appointments/new', permission: { resource: 'appointment', action: 'create' } },
      { label: 'Calendar View', path: '/appointments/calendar', permission: { resource: 'appointment', action: 'read' } },
    ]
  },
  { 
    icon: Pill, 
    label: 'Pharmacy', 
    permission: { resource: 'medicine', action: 'read' },
    submenu: [
      { label: 'Medicines', path: '/pharmacy', permission: { resource: 'medicine', action: 'read' } },
      { label: 'Inventory', path: '/pharmacy/inventory', permission: { resource: 'medicine', action: 'read' } },
      { label: 'Orders', path: '/pharmacy/orders', permission: { resource: 'medicine', action: 'read' } },
    ]
  },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { can } = usePermissions();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const visibleMenuItems = useMemo(() => {
    return menuItems
      .map((item) => {
        if (item.submenu) {
          const visibleSubs = item.submenu.filter((sub) => {
            const p = sub.permission;
            if (!p) return true;
            return can.any(p.resource, p.action);
          });
          return { ...item, submenu: visibleSubs };
        }
        return item;
      })
      .filter((item) => {
        if (item.permission === null || item.permission === undefined) return true;
        if (item.submenu) return item.submenu.length > 0;
        return can.any(item.permission.resource, item.permission.action);
      });
  }, [can]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const hasActiveSubmenu = (item: MenuItem) => {
    if (!item.submenu) return false;
    return item.submenu.some((sub) => isActive(sub.path));
  };

  const isItemActive = (item: MenuItem) => {
    if (item.path && isActive(item.path)) return true;
    if (item.submenu && hasActiveSubmenu(item)) return true;
    return false;
  };

  return (
    <div
      className={`bg-white border-r shadow-lg transition-all duration-300 ease-in-out flex flex-col h-screen ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-blue-700 font-bold text-sm">H</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              Hospital
            </h1>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95 text-gray-500 hover:text-gray-800"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const itemIsActive = isItemActive(item);
          const isSubmenuOpen = openSubmenus[item.label] || (isCollapsed ? false : hasActiveSubmenu(item));

          if (item.submenu && !isCollapsed) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    itemIsActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform text-gray-400 ${
                      isSubmenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isSubmenuOpen && (
                  <div className="ml-4 mt-1 space-y-1 pl-4 border-l border-gray-200">
                    {item.submenu.map((subItem) => {
                      const subIsActive = isActive(subItem.path);
                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            subIsActive
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 hover:translate-x-1'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.path || item.label}
              to={item.path || '#'}
              onClick={item.submenu && !isCollapsed ? (e) => {
                e.preventDefault();
                toggleSubmenu(item.label);
              } : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                itemIsActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto border-t">
        {!isCollapsed && (
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-700">Hospital Management</p>
            <p className="text-xs">v1.0.0</p>
          </div>
        )}
      </div>
    </div>
  );
}
