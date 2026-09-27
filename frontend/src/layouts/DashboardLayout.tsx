import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-charcoal">
      <Header onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto min-w-0">
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
