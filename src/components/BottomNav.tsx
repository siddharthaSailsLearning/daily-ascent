import { NavLink, useLocation } from 'react-router-dom';
import { Home, Plus, Calendar, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', icon: Home, label: 'Today' },
  { path: '/add', icon: Plus, label: 'Add' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/analytics', icon: BarChart3, label: 'Stats' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-none border-t border-border/30 px-2 pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className="relative flex flex-col items-center gap-1 px-4 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute -top-0.5 h-0.5 w-8 rounded-full gradient-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
