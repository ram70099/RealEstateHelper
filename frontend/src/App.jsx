import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import Analysis from './pages/Analysis/Analysis';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Hooks
import { useThemeStore } from './stores/themeStore';
import { useEffect } from 'react';

function App() {
  const location = useLocation();
  const { theme } = useThemeStore();
  
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
}

export default App;