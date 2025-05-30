import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Menu, 
  X,
  User,
  LogOut,
  Settings,
  HelpCircle
} from 'lucide-react';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { t } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  const notifications = [
    {
      title: 'New Property Match',
      description: 'A property matching your criteria is now available',
      time: '5 minutes ago',
      isUnread: true
    },
    {
      title: 'Price Drop Alert',
      description: 'Price reduced for a property in your watchlist',
      time: '2 hours ago',
      isUnread: true
    },
    {
      title: 'Analysis Complete',
      description: 'Your property analysis report is ready',
      time: 'Yesterday',
      isUnread: false
    }
  ];
  
  return (
    <header className="bg-card border-b border-border py-3 px-4">
      <div className="max-w-[2000px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder={t('Search properties...')} 
              className="input pl-9 py-1.5 text-sm w-[300px] bg-secondary/50" 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={toggleNotifications}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground relative"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-50"
                >
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Notifications</h3>
                      <span className="text-xs text-muted-foreground">Mark all as read</span>
                    </div>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <div 
                        key={index}
                        className={`p-4 border-b border-border hover:bg-secondary/50 cursor-pointer ${
                          notification.isUnread ? 'bg-secondary/20' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 mt-2 rounded-full ${
                            notification.isUnread ? 'bg-blue-500' : 'bg-transparent'
                          }`} />
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-border">
                    <button className="w-full text-center text-sm text-primary p-2 hover:bg-secondary rounded-lg">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <button 
              onClick={toggleUserMenu}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary-foreground font-medium">
                JD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">Premium User</p>
              </div>
            </button>
            
            <AnimatePresence>
              {showUserMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50"
                >
                  <div className="p-3 border-b border-border">
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                  </div>
                  
                  <div className="p-2">
                    <button className="flex items-center gap-2 w-full text-left p-2 text-sm hover:bg-secondary rounded-lg">
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <button className="flex items-center gap-2 w-full text-left p-2 text-sm hover:bg-secondary rounded-lg">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <button className="flex items-center gap-2 w-full text-left p-2 text-sm hover:bg-secondary rounded-lg">
                      <HelpCircle size={16} />
                      <span>Help & Support</span>
                    </button>
                    <div className="h-px bg-border my-2" />
                    <button className="flex items-center gap-2 w-full text-left p-2 text-sm hover:bg-secondary rounded-lg text-red-500">
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;