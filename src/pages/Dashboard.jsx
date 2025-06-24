import React, { useState } from 'react';
import { useDebug } from '../context/DebugContext';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { Feed } from '../components/Feed';
import { MySignals } from '../components/MySignals';
import { SignalCreation } from '../components/SignalCreation';

export const Dashboard = () => {
    const { addDebugLog } = useDebug();
    const [activeMode, setActiveMode] = useState('feed');

    const handleModeChange = (mode) => {
        setActiveMode(mode);
        addDebugLog({
            emoji: '🔄',
            title: 'Dashboard mode changed',
            data: { from: activeMode, to: mode },
        });
    };

    const renderContent = () => {
        switch (activeMode) {
            case 'feed':
                return <Feed />;
            case 'my-signals':
                return <MySignals />;
            case 'create':
                return <SignalCreation />;
            default:
                return <Feed />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <DashboardSidebar activeMode={activeMode} onModeChange={handleModeChange} />
            
            {/* Main Content */}
            <div className="ml-64 pt-16">
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};