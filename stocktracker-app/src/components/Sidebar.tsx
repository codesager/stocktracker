import React from 'react';
import { Home, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    currentPage: 'home' | 'dashboard';
    setCurrentPage: (page: 'home' | 'dashboard') => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    setIsCollapsed,
    currentPage,
    setCurrentPage
}) => {
    return (
        <div className={`flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} shrink-0 min-h-screen`}>
            <div className="p-4 flex justify-end">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
            <nav className="flex-1 px-2 space-y-2 mt-4">
                <button
                    onClick={() => setCurrentPage('home')}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors overflow-hidden ${currentPage === 'home'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                    title="Home"
                >
                    <Home size={20} className="shrink-0" />
                    {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Home Watchlists</span>}
                </button>
                <button
                    onClick={() => setCurrentPage('dashboard')}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors overflow-hidden ${currentPage === 'dashboard'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                    title="Dashboard"
                >
                    <LayoutDashboard size={20} className="shrink-0" />
                    {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Market Dashboard</span>}
                </button>
            </nav>
        </div>
    );
};

export default React.memo(Sidebar);
