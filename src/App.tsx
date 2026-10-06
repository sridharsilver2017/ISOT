import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { useScheduleStore } from './store/scheduleStore';
import { useAuthStore } from './store/authStore';
import { useProgrammeStore } from './store/programmeStore';

// Pages
import { Home } from './pages/Home';
import { Programme } from './pages/Programme';
import { Session } from './pages/Session';
import { Talk } from './pages/Talk';
import { Speakers } from './pages/Speakers';
import { Speaker } from './pages/Speaker';
import { MySchedule } from './pages/MySchedule';
import { Search } from './pages/Search';
import { Venue } from './pages/Venue';
import { About } from './pages/About';
import { Settings } from './pages/Settings';
import { Brochure } from './pages/Brochure';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export const App: React.FC = () => {
  const { darkMode } = useScheduleStore();
  const { checkAuth } = useAuthStore();
  const { fetchProgrammeFromServer } = useProgrammeStore();

  useEffect(() => {
    checkAuth();
    fetchProgrammeFromServer();
  }, [checkAuth, fetchProgrammeFromServer]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-isot-bg dark:bg-isot-bg-dark text-isot-dark dark:text-gray-100 flex flex-col font-sans transition-colors">
        {/* Desktop Top Header */}
        <AppHeader />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/programme" element={<Programme />} />
            <Route path="/programme/:date" element={<Programme />} />
            <Route path="/session/:sessionId" element={<Session />} />
            <Route path="/talk/:talkId" element={<Talk />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/speaker/:speakerId" element={<Speaker />} />
            <Route path="/my-schedule" element={<MySchedule />} />
            <Route path="/search" element={<Search />} />
            <Route path="/venue" element={<Venue />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/brochure" element={<Brochure />} />
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <BottomNav />
      </div>
    </Router>
  );
};

export default App;
