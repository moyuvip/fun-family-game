import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import LanguageSelector from '../../components/LanguageSelector';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F0F7FF]">
      <header className="bg-white shadow-sm w-full">
        <div className="w-full px-4">
          <div className="max-w-[1200px] mx-auto py-3 flex justify-between items-center">
            <h1 className="text-xl font-medium">休闲游戏</h1>
            <LanguageSelector />
          </div>
        </div>
      </header>
      <main className="w-full px-4 py-6">
        <Suspense fallback={<div>加载中...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default MainLayout; 