import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Application</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-white shadow mt-6">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <p className="text-sm text-gray-600"> 2025 My Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;