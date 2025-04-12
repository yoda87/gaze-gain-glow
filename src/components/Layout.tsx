
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gift, Users, User, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

const Layout = ({ children, hideNav = false }: LayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen bg-background font-['Outfit']">
      <main className="flex-1">
        {children}
      </main>
      
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex justify-around items-center h-16 px-4">
            <NavLink to="/" active={location.pathname === '/'} icon={<Home />} label="Accueil" />
            <NavLink to="/watch-ad" active={location.pathname === '/watch-ad'} icon={<Play className="text-brand-purple" />} label="Regarder" className="relative -top-5 bg-white dark:bg-gray-900 rounded-full p-4 border-4 border-brand-purple shadow-lg" />
            <NavLink to="/rewards" active={location.pathname === '/rewards'} icon={<Gift />} label="Récompenses" />
            <NavLink to="/referral" active={location.pathname === '/referral'} icon={<Users />} label="Parrainage" />
            <NavLink to="/profile" active={location.pathname === '/profile'} icon={<User />} label="Profil" />
          </div>
        </nav>
      )}
    </div>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const NavLink = ({ to, active, icon, label, className }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center text-xs font-medium transition-colors",
        active ? "text-brand-purple" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        className
      )}
    >
      <div className="mb-1">{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

export default Layout;
