import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useLanguageStore } from '../stores/languageStore';
import { Sun, Moon, Globe, Bell, User } from 'lucide-react';

const Settings = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });
  
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
  });
  
  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance */}
        <motion.div 
          variants={itemVariants}
          className="border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <h2 className="text-xl font-semibold">{t('settings.appearance')}</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('settings.theme.label')}
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${
                    theme === 'light'
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Sun size={18} />
                  <span>{t('settings.theme.light')}</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Moon size={18} />
                  <span>{t('settings.theme.dark')}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Language */}
        <motion.div 
          variants={itemVariants}
          className="border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
              <Globe size={20} />
            </div>
            <h2 className="text-xl font-semibold">{t('settings.language')}</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('settings.language')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setLanguage('en')}
                  className={`py-3 px-4 rounded-lg border transition-all duration-200 ${
                    language === 'en'
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {t('settings.languages.english')}
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`py-3 px-4 rounded-lg border transition-all duration-200 ${
                    language === 'hi'
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {t('settings.languages.hindi')}
                </button>
                <button
                  onClick={() => setLanguage('kn')}
                  className={`py-3 px-4 rounded-lg border transition-all duration-200 ${
                    language === 'kn'
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {t('settings.languages.kannada')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Notifications */}
        <motion.div 
          variants={itemVariants}
          className="border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-semibold">{t('settings.notifications')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('settings.notificationSettings.email')}</label>
              <div 
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  notifications.email ? 'bg-green-500' : 'bg-secondary'
                }`}
                onClick={() => handleNotificationChange('email')}
              >
                <div
                  className={`absolute top-1 left-1 bg-primary w-4 h-4 rounded-full transform transition-transform duration-200 ${
                    notifications.email ? 'translate-x-6' : ''
                  }`}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('settings.notificationSettings.push')}</label>
              <div 
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  notifications.push ? 'bg-green-500' : 'bg-secondary'
                }`}
                onClick={() => handleNotificationChange('push')}
              >
                <div
                  className={`absolute top-1 left-1 bg-primary w-4 h-4 rounded-full transform transition-transform duration-200 ${
                    notifications.push ? 'translate-x-6' : ''
                  }`}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('settings.notificationSettings.updates')}</label>
              <div 
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  notifications.updates ? 'bg-green-500' : 'bg-secondary'
                }`}
                onClick={() => handleNotificationChange('updates')}
              >
                <div
                  className={`absolute top-1 left-1 bg-primary w-4 h-4 rounded-full transform transition-transform duration-200 ${
                    notifications.updates ? 'translate-x-6' : ''
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Profile */}
        <motion.div 
          variants={itemVariants}
          className="border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            <h2 className="text-xl font-semibold">{t('settings.profile')}</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('settings.profileSettings.name')}
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('settings.profileSettings.email')}
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('settings.profileSettings.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                className="input w-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
      
      <motion.div variants={itemVariants} className="flex justify-end">
        <button className="btn btn-primary">{t('settings.save')}</button>
      </motion.div>
    </motion.div>
  );
};

export default Settings;