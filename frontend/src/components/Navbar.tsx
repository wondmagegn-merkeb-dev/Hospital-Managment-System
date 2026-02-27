import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, User, ChevronRight, Menu, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [];

    // Always include Dashboard as first breadcrumb
    breadcrumbs.push({
      label: 'Dashboard',
      path: '/dashboard',
      isActive: location.pathname === '/dashboard' || location.pathname === '/',
    });

    // Build breadcrumbs from path segments (skip 'dashboard' if it's the first segment)
    let currentPath = '';
    pathnames.forEach((name, index) => {
      // Skip if it's 'dashboard' since we already added it
      if (name === 'dashboard' && index === 0) {
        return;
      }
      
      currentPath += `/${name}`;
      
      // Format label (capitalize and replace hyphens/underscores)
      const label = name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        path: currentPath,
        isActive: index === pathnames.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      {/* Mobile Menu Button */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="mobile-menu-button md:hidden p-2 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-110 active:scale-95 mr-2"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 flex-1 min-w-0" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {index > 0 && (
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/50 flex-shrink-0" />
              )}
              <Link
                to={crumb.path}
                className={`text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  crumb.isActive
                    ? 'text-primary scale-105'
                    : 'text-muted-foreground hover:text-primary hover:scale-105'
                }`}
              >
                {crumb.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button className="relative p-2 sm:p-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-110 active:scale-95 group">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-primary transition-colors" />
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-destructive to-destructive/80 rounded-full animate-pulse shadow-lg"></span>
        </button>

        <div className="relative flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 p-1 rounded-xl hover:bg-accent/50 transition-all duration-200"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium">{user?.full_name || user?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
            </div>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-white backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-50">
              <Link
                to="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/40 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
