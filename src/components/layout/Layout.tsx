import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { GlobalSearch } from '../common/GlobalSearch';
import { Toast } from '../common/Toast';

export const Layout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-admin-bg font-sans">
      {/* Desktop Sidebar */}
      <DesktopSidebar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Global Modals & Notifications */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <Toast />
    </div>
  );
};
