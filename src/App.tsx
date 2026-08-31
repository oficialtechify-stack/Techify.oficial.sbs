import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeSection from './components/HomeSection';
import AboutSection from './components/AboutSection';
import AppsSection from './components/AppsSection';
import MotionLabSection from './components/MotionLabSection';
import CareersSection from './components/CareersSection';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import ConsultationModal from './components/ConsultationModal';
import AdminLoginModal from './components/AdminLoginModal';
import CardCustomizerModal from './components/CardCustomizerModal';
import ToastProvider from './components/Toast';
import { InlineEditProvider } from './components/InlineEditProvider';
import { useAdminAuth } from './lib/adminAuth';
import { Sliders } from 'lucide-react';

export default function App() {
  const { isAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isCardCustomizerOpen, setIsCardCustomizerOpen] = useState(false);

  const handleOpenConsultation = (serviceName?: string) => {
    setSelectedService(serviceName);
    setIsConsultationOpen(true);
  };

  // Ensure scroll is reset to top when switching tabs to prevent scroll offset bugs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Keyboard shortcut & Custom Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        const activeEl = document.activeElement;
        const isEditingInput = activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          (activeEl as HTMLElement).isContentEditable
        );

        // If the user isn't actively typing in an input field, intercept Ctrl+A to open Admin Login
        if (!isEditingInput) {
          e.preventDefault();
          setIsAdminLoginOpen(true);
        }
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'TECHIFY_OPEN_ADMIN') {
        setIsAdminLoginOpen(true);
      }
      if (e.data && e.data.type === 'TECHIFY_OPEN_CARD_CUSTOMIZER') {
        setIsCardCustomizerOpen(true);
      }
    };

    const handleOpenCustomizerEvent = () => {
      setIsCardCustomizerOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('message', handleMessage);
    window.addEventListener('techify-open-card-customizer', handleOpenCustomizerEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('techify-open-card-customizer', handleOpenCustomizerEvent);
    };
  }, []);

  return (
    <ToastProvider>
      <InlineEditProvider>
        <div className="min-h-screen bg-[#060606] text-white flex flex-col selection:bg-[#22c55e]/30 selection:text-white w-full max-w-full overflow-x-hidden relative">
          
          {/* Persistent Global Header */}
          <Header 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onOpenConsultation={() => handleOpenConsultation()} 
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)} 
          />

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-full overflow-x-hidden relative">
            {activeTab === 'inicio' && (
              <HomeSection 
                onNavigate={setActiveTab} 
                onOpenConsultation={handleOpenConsultation} 
              />
            )}

            {activeTab === 'sobre-nos' && (
              <AboutSection 
                onNavigate={setActiveTab} 
                onOpenConsultation={handleOpenConsultation} 
              />
            )}

            {activeTab === 'apps' && (
              <AppsSection 
                onOpenConsultation={handleOpenConsultation} 
              />
            )}

            {/* TECHIFY MOTION: Full Interactive Motion Principles, Projects & Lab */}
            {activeTab === 'academia' && (
              <MotionLabSection 
                onNavigate={setActiveTab} 
                onOpenConsultation={handleOpenConsultation} 
              />
            )}

            {activeTab === 'carreiras' && (
              <CareersSection />
            )}

            {activeTab === 'admin' && (
              <AdminPanel />
            )}
          </main>

          {/* Footer (Rendered across Techify tabs, except admin and full-screen motion lab) */}
          {activeTab !== 'admin' && activeTab !== 'academia' && (
            <Footer 
              onNavigate={setActiveTab} 
              onOpenConsultation={handleOpenConsultation} 
            />
          )}

          {/* Modals */}
          <ConsultationModal 
            isOpen={isConsultationOpen} 
            onClose={() => setIsConsultationOpen(false)} 
            defaultService={selectedService} 
          />

          <AdminLoginModal 
            isOpen={isAdminLoginOpen} 
            onClose={() => setIsAdminLoginOpen(false)} 
            onSuccess={() => setActiveTab('admin')} 
          />

          <CardCustomizerModal
            isOpen={isCardCustomizerOpen}
            onClose={() => setIsCardCustomizerOpen(false)}
          />
        </div>
      </InlineEditProvider>
    </ToastProvider>
  );
}
