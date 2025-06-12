import React from 'react';
import { Navbar } from '../Navbar';
import { DebugPanel } from '../DebugPanel';
import { FeaturesIcons } from '../../components/FeaturesIcons';

export const PageLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <DebugPanel />
    </div>
  );
}; 