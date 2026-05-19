import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden" data-testid="main-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar onMobileSidebarToggle={() => setCollapsed((prev) => !prev)} />
        <main
          className="flex-1 overflow-y-auto p-6 animate-fade-in"
          data-testid="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
