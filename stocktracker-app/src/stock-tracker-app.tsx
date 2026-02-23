import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Sun, 
  Moon, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3,
  X,
  Check,
  Download,
  Upload,
  GripVertical,
  Power
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  Watchlist,
  StockData
} from './types/types';
import { calculateEMA } from './utils/emaUtils';
import { exportWatchlistsToCSV, parseCSVToWatchlists, downloadCSV } from './utils/csvUtils';
import ApiKeyModal from './components/modals/ApiKeyModal';
import AddWatchlistModal from './components/modals/AddWatchlistModal';
import AddStockModal from './components/modals/AddStockModal';
import WatchlistCard from './components/WatchlistCard';
import { useTheme } from './hooks/useTheme';
import { useStockData } from './hooks/useStockData';
import { useWatchlists } from './hooks/useWatchlists';

const StockTracker = () => {
  const { isDark, toggleTheme } = useTheme();
  const [showAddWatchlist, setShowAddWatchlist] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | null>(null);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [selectedLayout, setSelectedLayout] = useState('grid-cols-1 md:grid-cols-2');
  const [apiKey, setApiKey] = useState(localStorage.getItem('fmpApiKey') || '');

  const {
    watchlists,
    editingWatchlist,
    setEditingWatchlist,
    addWatchlist: addWatchlistHook,
    deleteWatchlist,
    toggleWatchlistVisibility,
    addStockToWatchlist,
    removeStockFromWatchlist,
    updateWatchlistName,
    setWatchlistsData
  } = useWatchlists();

  const { stockData, isRefreshing, fetchStockData, autoRefreshEnabled, toggleAutoRefresh } = useStockData(watchlists, apiKey);

  const [showApiKeyModal, setShowApiKeyModal] = useState(!localStorage.getItem('fmpApiKey'));

  // Debug watchlists changes
  useEffect(() => {
    console.log('Watchlists updated:', watchlists);
  }, [watchlists]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = watchlists.findIndex((item) => item.id === active.id);
      const newIndex = watchlists.findIndex((item) => item.id === over?.id);

      const newWatchlists = arrayMove(watchlists, oldIndex, newIndex);
      setWatchlistsData(newWatchlists);
    }
  };

  // Handle API key submission
  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('fmpApiKey', apiKey);
      setShowApiKeyModal(false);
    }
  };

  // Export watchlists to CSV
  const handleExportWatchlists = () => {
    try {
      const csvContent = exportWatchlistsToCSV(watchlists);
      const filename = `watchlists_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      console.log('Exported watchlists:', watchlists);
    } catch (error) {
      console.error('Error exporting watchlists:', error);
      alert('Error exporting watchlists');
    }
  };

  // Import watchlists from CSV
  const handleImportWatchlists = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          alert('Failed to read file content');
          return;
        }
        
        const newWatchlists = parseCSVToWatchlists(text);

        console.log('Importing watchlists:', newWatchlists);
        setWatchlistsData(newWatchlists);
        
        // Immediately fetch data for new stocks
        setTimeout(() => {
          fetchStockData();
        }, 0);

        // Reset file input
        event.target.value = '';
        
        // Show success message after a small delay to ensure state update
        setTimeout(() => {
          alert(`Successfully imported ${newWatchlists.length} watchlist(s)`);
        }, 100);
        
      } catch (error) {
        console.error('Error importing watchlists:', error);
        alert('Error importing watchlists. Please check the file format.');
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file');
    };
    
    reader.readAsText(file);
  };

  const addWatchlist = () => {
    if (addWatchlistHook(newWatchlistName)) {
      setNewWatchlistName('');
      setShowAddWatchlist(false);
    }
  };

  const addStockToWatchlistHandler = () => {
    if (newStockSymbol.trim() && selectedWatchlistId) {
      if (addStockToWatchlist(selectedWatchlistId, newStockSymbol)) {
        setNewStockSymbol('');
        setShowAddStock(false);
        setSelectedWatchlistId(null);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans text-sm ${isDark ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onSubmit={handleApiKeySubmit}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <BarChart3 className="text-blue-600 mr-2" size={28} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Stock Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                {isRefreshing ? (
                  <RefreshCw className="animate-spin mr-1" size={14} />
                ) : (
                  <RefreshCw className="mr-1" size={14} />
                )}
                Last updated: {Object.values(stockData)[0]?.lastUpdate || 'Never'}
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedLayout}
                  onChange={(e) => setSelectedLayout(e.target.value)}
                  className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm"
                >
                  <option value="grid-cols-1 md:grid-cols-2">2 Columns</option>
                  <option value="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">3 Columns</option>
                  <option value="grid-cols-1 md:grid-cols-3 lg:grid-cols-4">4 Columns</option>
                  <option value="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">4 Columns XL</option>
                </select>
              </div>
              <button
                onClick={handleExportWatchlists}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg flex items-center transition-colors text-sm"
              >
                <Download className="mr-1" size={14} />
                Export
              </button>
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center transition-colors text-sm cursor-pointer">
                <Upload className="mr-1" size={14} />
                Import
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportWatchlists}
                  className="hidden"
                />
              </label>
              <button
                onClick={toggleAutoRefresh}
                className={`px-3 py-1 rounded-lg flex items-center transition-colors text-sm ${
                  autoRefreshEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                }`}
                title={autoRefreshEnabled ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              >
                <Power className="mr-1" size={14} />
                Auto
              </button>
              <button
                onClick={() => fetchStockData()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center transition-colors text-sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} size={14} />
                Refresh
              </button>
              <button
                onClick={() => setShowAddWatchlist(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center transition-colors text-sm"
              >
                <Plus className="mr-1" size={14} />
                Add Watchlist
              </button>
              <button
                onClick={toggleTheme}
                className="p-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`w-full px-2 sm:px-4 lg:px-6 py-6 grid ${selectedLayout} gap-4`}>
        {watchlists.filter(wl => wl.visible).length === 0 ? (
          <div className="text-center py-12 col-span-full">
            <BarChart3 size={56} className="mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No watchlists visible
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Create your first watchlist to start tracking stocks
            </p>
            <button
              onClick={() => setShowAddWatchlist(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto transition-colors text-sm"
            >
              <Plus className="mr-1" size={16} />
              Create Watchlist
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={watchlists.filter(wl => wl.visible).map(wl => wl.id)}
              strategy={verticalListSortingStrategy}
            >
              {watchlists
                .filter(wl => wl.visible)
                .map(watchlist => (
                  <WatchlistCard
                    key={watchlist.id}
                    watchlist={watchlist}
                    stockData={stockData}
                    editingWatchlist={editingWatchlist}
                    onToggleVisibility={toggleWatchlistVisibility}
                    onDelete={deleteWatchlist}
                    onEdit={setEditingWatchlist}
                    onUpdateName={updateWatchlistName}
                    onAddStock={(watchlistId) => {
                      setSelectedWatchlistId(watchlistId);
                      setShowAddStock(true);
                    }}
                    onRemoveStock={removeStockFromWatchlist}
                  />
                ))}
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Add Watchlist Modal */}
      <AddWatchlistModal
        isOpen={showAddWatchlist}
        watchlistName={newWatchlistName}
        onWatchlistNameChange={setNewWatchlistName}
        onCancel={() => {
          setShowAddWatchlist(false);
          setNewWatchlistName('');
        }}
        onSubmit={addWatchlist}
      />

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={showAddStock}
        stockSymbol={newStockSymbol}
        selectedWatchlistId={selectedWatchlistId}
        watchlists={watchlists}
        onStockSymbolChange={setNewStockSymbol}
        onCancel={() => {
          setShowAddStock(false);
          setNewStockSymbol('');
          setSelectedWatchlistId(null);
        }}
        onSubmit={addStockToWatchlistHandler}
      />
    </div>
  );
};

export default StockTracker;