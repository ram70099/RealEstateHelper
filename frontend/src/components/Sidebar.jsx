import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Upload, 
  BarChart2, 
  Layers, 
  Settings, 
  ChevronLeft,
  Building2
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { path: '/', name: t('nav.home'), icon: <Home size={20} /> },
    { path: '/upload', name: t('nav.upload'), icon: <Upload size={20} /> },
    { path: '/analysis', name: t('nav.analysis'), icon: <BarChart2 size={20} /> },
    { path: '/dashboard', name: t('nav.dashboard'), icon: <Layers size={20} /> },
    { path: '/settings', name: t('nav.settings'), icon: <Settings size={20} /> },
  ];
  
  const sidebarVariants = {
    open: { width: 240 },
    closed: { width: 0 },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="open"
      animate="open"
      className="bg-card h-screen w-[240px] border-r border-border flex flex-col"
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary w-8 h-8 rounded-md flex items-center justify-center">
            <Building2 size={20} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary">{t('app.name')}</h1>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-secondary text-muted-foreground"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 text-xs text-muted-foreground border-t border-border">
        <p>© 2025 {t('app.name')}</p>
        <p>{t('app.tagline')}</p>
      </div>
    </motion.aside>
  );
};

export default Sidebar;