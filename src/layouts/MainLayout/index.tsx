import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import LanguageSelector from '../../components/LanguageSelector';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col">
      <header className="bg-white shadow-sm w-full">
        <div className="w-full px-4">
          <div className="max-w-[1200px] mx-auto py-3 flex justify-between items-center">
            <h1 className="text-xl font-medium">休闲游戏</h1>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-6 flex-grow">
        <Suspense fallback={<div>加载中...</div>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="bg-white shadow-sm w-full mt-auto">
        <div className="max-w-[1200px] mx-auto py-4 px-4">
          <div className="flex flex-col items-center text-sm text-gray-600 space-y-2">
            <p>©2024 - 2025 程序员悟饭. All rights reserved.</p>
            <a 
              href="https://github.com/moyuvip/fun-family-game.git"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors flex items-center gap-1"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-4 h-4"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 