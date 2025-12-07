import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Hide header for certain pages
  const hideHeader = [
    '/driver/login',
    '/admin/login',
    '/municipal/login',
  ].some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeader && <Header />}
      <main className={`${!hideHeader ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
