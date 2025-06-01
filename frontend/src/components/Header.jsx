import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Menu,
  X,
} from 'lucide-react';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const notifications = [
    {
      title: 'New Property Match',
      description: 'A property matching your criteria is now available',
      time: '5 minutes ago',
      isUnread: true,
    },
    {
      title: 'Price Drop Alert',
      description: 'Price reduced for a property in your watchlist',
      time: '2 hours ago',
      isUnread: true,
    },
    {
      title: 'Analysis Complete',
      description: 'Your property analysis report is ready',
      time: 'Yesterday',
      isUnread: false,
    },
  ];

  return (
    <header className="bg-card border-b border-border py-3 px-4 sticky top-0 z-40">
      <div className="max-w-[2000px] mx-auto flex items-center justify-between">
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="relative hidden md:block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder={t('Search properties...')}
              className="input pl-9 py-1.5 text-sm w-[300px] bg-secondary/50 rounded-md border border-border focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground relative"
            aria-label="Notifications"
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
                className="absolute right-0 mt-3 w-96 bg-card border border-border rounded-lg shadow-xl z-50"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  <button className="text-xs text-muted-foreground hover:underline">
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`p-4 border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors ${
                        notification.isUnread ? 'bg-secondary/20' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`w-2 h-2 mt-2 rounded-full ${
                            notification.isUnread ? 'bg-blue-500' : 'bg-transparent'
                          }`}
                        />
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
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
      </div>
    </header>
  );
};

export default Header;
