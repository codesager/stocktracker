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
  GripVertical
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

interface Watchlist {
  id: number;
  name: string;
  stocks: string[];
  visible: boolean;
}

interface StockData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  ema8: number | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  lastUpdate: string;
}

interface TierConfig {
  maxWatchlists: number;
  layout: string;
  layoutOptions?: string[];
}

interface TierConfigs {
  free: TierConfig;
  premium: TierConfig;
}

const StockTracker = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    {
      id: 1,
      name: 'Growth Stocks',
      stocks: ['AAPL', 'GOOGL', 'MSFT'],
      visible: true
    },
    {
      id: 2,
      name: 'Value Stocks',
      stocks: ['BRK.B', 'JPM', 'JNJ'],
      visible: true
    }
  ]);
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddWatchlist, setShowAddWatchlist] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | null>(null);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [editingWatchlist, setEditingWatchlist] = useState<number | null>(null);
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');
  const [selectedLayout, setSelectedLayout] = useState('grid-cols-1 md:grid-cols-2');
  const [apiKey, setApiKey] = useState(localStorage.getItem('fmpApiKey') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(!localStorage.getItem('fmpApiKey'));

  const tierConfigs: TierConfigs = {
    free: { 
      maxWatchlists: 2, 
      layout: 'grid-cols-1 md:grid-cols-2',
      layoutOptions: ['grid-cols-1 md:grid-cols-2']
    },
    premium: { 
      maxWatchlists: 9, 
      layout: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      layoutOptions: [
        'grid-cols-1 md:grid-cols-2',
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        'grid-cols-1 md:grid-cols-3 lg:grid-cols-4',
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      ]
    }
  };

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Update layout when tier changes
  useEffect(() => {
    setSelectedLayout(tierConfigs[userTier].layout);
  }, [userTier]);

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
      setWatchlists((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
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
  const exportWatchlists = () => {
    try {
      const csvContent = [
        'Watchlist Name,Stocks,Visible',
        ...watchlists.map(wl => {
          const escapedName = wl.name.replace(/"/g, '""');
          const stocksString = wl.stocks.join(';');
          return `"${escapedName}","${stocksString}","${wl.visible}"`;
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `watchlists_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      console.log('Exported watchlists:', watchlists);
    } catch (error) {
      console.error('Error exporting watchlists:', error);
      alert('Error exporting watchlists');
    }
  };

  // Import watchlists from CSV
  const importWatchlists = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        
        const lines = text.split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line && line.length > 0);
        
        if (lines.length < 2) {
          alert('CSV file is empty or has no data rows');
          return;
        }

        if (lines[0] !== 'Watchlist Name,Stocks,Visible') {
          alert('Invalid CSV format. Expected header: Watchlist Name,Stocks,Visible');
          return;
        }

        const newWatchlists: Watchlist[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          try {
            // More robust CSV parsing
            const parts = line.split(',');
            if (parts.length < 3) {
              console.warn(`Skipping invalid line ${i + 1}: ${line}`);
              continue;
            }
            
            const name = parts[0].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
            const stocksStr = parts[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
            const visibleStr = parts[2].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
            
            if (!name) {
              console.warn(`Skipping line ${i + 1}: missing watchlist name`);
              continue;
            }
            
            const stocks = stocksStr ? stocksStr.split(';').filter((s: string) => s.trim()) : [];
            const visible = visibleStr.toLowerCase() === 'true';
            
            newWatchlists.push({
              id: Date.now() + i + Math.floor(Math.random() * 1000),
              name,
              stocks,
              visible
            });
          } catch (parseError) {
            console.error(`Error parsing line ${i + 1}:`, parseError);
            continue;
          }
        }

        if (newWatchlists.length === 0) {
          alert('No valid watchlists found in the CSV file');
          return;
        }

        if (newWatchlists.length > tierConfigs[userTier].maxWatchlists) {
          alert(`Cannot import ${newWatchlists.length} watchlists. ${userTier.charAt(0).toUpperCase() + userTier.slice(1)} tier allows up to ${tierConfigs[userTier].maxWatchlists} watchlists.`);
          return;
        }

        console.log('Importing watchlists:', newWatchlists);
        setWatchlists(newWatchlists);
        
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

  
  // Fetch stock quote and historical data
  const generateStockData = useCallback(async (ticker: string) => {
    if (!apiKey) return;
    
    try {
      // Fetch current quote
      const quoteResponse = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${apiKey}`
      );
      const quoteData = await quoteResponse.json();
      console.log('quoteData', quoteData);
      // Fetch historical data for EMA calculation (60 days to ensure we have enough data)
      const historyResponse = await fetch(
        `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?timeseries=300&apikey=${apiKey}`
      );
      const historyData = await historyResponse.json();
      console.log('historyData', historyData);
      if (quoteData.length > 0 && historyData.historical) {
        const quote = quoteData[0];
        const prices = historyData.historical.reverse().map((day: { close: any; }) => day.close);
        
        return {
          ticker: quote.symbol,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changesPercentage,
          open: quote.open,
          high: quote.dayHigh,
          low: quote.dayLow,
          close: quote.previousClose,
          ema8: calculateEMA(prices, 8),
          ema20: calculateEMA(prices, 20),
          ema50: calculateEMA(prices, 50),
          ema200: calculateEMA(prices, 200),
          lastUpdate: new Date().toLocaleTimeString()
        };
      }
      return null;
    } catch (err) {
      console.error(`Error fetching data for ${ticker}:`, err);
      return null;
    }
  }, [apiKey]);

  
  // Calculate EMA
  const calculateEMA = (prices: number[], period: number): number | null => {
    // Input validation
    if (!Number.isInteger(period) || period <= 0) {
      throw new Error("Period must be a positive integer");
    }
    if (prices.length < period || prices.some(isNaN)) {
      return null;
    }
  
    const multiplier = 2 / (period + 1);
    // Calculate initial SMA
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
    // Calculate EMA for subsequent prices
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }
  
    return Number(ema.toFixed(4)); // Round to 4 decimal places for precision
  };
  /*
  // Mock stock data generator (replace with real FMP API calls)
  const generateMockStockData = useCallback((symbol) => {
    const basePrice = 100 + Math.random() * 400;
    const change = (Math.random() - 0.5) * 10;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol,
      open: basePrice + Math.random() * 5,
      high: basePrice + Math.random() * 10,
      low: basePrice - Math.random() * 10,
      close: basePrice,
      change,
      changePercent,
      sma8: basePrice + Math.random() *  8 - 4,
      sma20: basePrice + Math.random() * 20 - 10,
      sma50: basePrice + Math.random() * 50 - 25,
      sma200: basePrice + Math.random() * 200 - 100,
      lastUpdated: new Date().toLocaleTimeString()
    };
  }, []);
*/
  // Simulate API data fetching
  const fetchStockData = useCallback(async () => {
    console.log('fetchStockData', localStorage.getItem('fmpApiKey'));
    if (!localStorage.getItem('fmpApiKey')) {
      setShowApiKeyModal(true);
      return;
    }
    
    setIsRefreshing(true);
    const allSymbols = [...new Set(
      watchlists
        .filter(wl => wl.visible)
        .flatMap(wl => wl.stocks)
    )];

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newStockData: Record<string, StockData> = {};
    for (const symbol of allSymbols) {
      const data = await generateStockData(symbol);
      if (data) {
        newStockData[symbol] = data;
      }
    }

    setStockData(newStockData);
    setIsRefreshing(false);
  }, [watchlists, generateStockData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 1200000);
    return () => clearInterval(interval);
  }, [fetchStockData]);

  const addWatchlist = () => {
    if (newWatchlistName.trim() && watchlists.length < tierConfigs[userTier].maxWatchlists) {
      const newWatchlist = {
        id: Date.now(),
        name: newWatchlistName,
        stocks: [],
        visible: true
      };
      setWatchlists([...watchlists, newWatchlist]);
      setNewWatchlistName('');
      setShowAddWatchlist(false);
    } else if (watchlists.length >= tierConfigs[userTier].maxWatchlists) {
      alert(`Maximum watchlists reached for ${userTier} tier (${tierConfigs[userTier].maxWatchlists}). Upgrade to premium for more!`);
    }
  };

  const deleteWatchlist = (id: number) => {
    setWatchlists(watchlists.filter(wl => wl.id !== id));
  };

  const toggleWatchlistVisibility = (id: number) => {
    setWatchlists(watchlists.map(wl => 
      wl.id === id ? { ...wl, visible: !wl.visible } : wl
    ));
  };

  const addStockToWatchlist = () => {
    if (newStockSymbol.trim() && selectedWatchlistId) {
      setWatchlists(watchlists.map(wl => 
        wl.id === selectedWatchlistId 
          ? { ...wl, stocks: [...wl.stocks, newStockSymbol.toUpperCase()] }
          : wl
      ));
      setNewStockSymbol('');
      setShowAddStock(false);
      setSelectedWatchlistId(null);
    }
  };

  const removeStockFromWatchlist = (watchlistId: number, stockSymbol: string) => {
    setWatchlists(watchlists.map(wl => 
      wl.id === watchlistId 
        ? { ...wl, stocks: wl.stocks.filter(stock => stock !== stockSymbol) }
        : wl
    ));
  };

  const updateWatchlistName = (id: number, newName: string) => {
    setWatchlists(watchlists.map(wl => 
      wl.id === id ? { ...wl, name: newName } : wl
    ));
    setEditingWatchlist(null);
  };

  const StockRow = ({ stock, watchlistId }: { stock: string; watchlistId: number }) => {
    const data = stockData[stock];
    if (!data) return null;

    const isPositive = data.change >= 0;

    return (
      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="px-2 py-1 font-medium text-gray-900 dark:text-gray-100 flex items-center text-xs">
          {stock}
          <button
            onClick={() => removeStockFromWatchlist(watchlistId, stock)}
            className="ml-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        </td>
        <td className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">${data.open.toFixed(2)}</td>
        <td className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">${data.high.toFixed(2)}</td>
        <td className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">${data.low.toFixed(2)}</td>
        <td className="px-2 py-1 font-medium text-gray-900 dark:text-gray-100 text-xs">${data.price.toFixed(2)}</td>
        <td className={`px-2 py-1 flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'} text-xs`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span className="ml-1">
            {isPositive ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
          </span>
        </td>
        <td className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">${data.ema8?.toFixed(2) || 'N/A'}</td>
        <td className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">${data.ema20?.toFixed(2) || 'N/A'}</td>
        <td className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">${data.ema50?.toFixed(2) || 'N/A'}</td>
        <td className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">${data.ema200?.toFixed(2) || 'N/A'}</td>
      </tr>
    );
  };

  // Sortable Watchlist Card Component
  const SortableWatchlistCard = ({ watchlist }: { watchlist: Watchlist }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: watchlist.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 mb-4 group"
      >
              <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div 
              className="mr-2 cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} />
            </div>
            {editingWatchlist === watchlist.id ? (
              <input
                type="text"
                defaultValue={watchlist.name}
                className="text-lg font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100"
                onBlur={(e) => updateWatchlistName(watchlist.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateWatchlistName(watchlist.id, (e.target as HTMLInputElement).value);
                  }
                }}
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <BarChart3 className="mr-2" size={18} />
                {watchlist.name}
              </h2>
            )}
          </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingWatchlist(watchlist.id)}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => toggleWatchlistVisibility(watchlist.id)}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            {watchlist.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={() => {
              setSelectedWatchlistId(watchlist.id);
              setShowAddStock(true);
            }}
            className="text-green-500 hover:text-green-700 transition-colors"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => deleteWatchlist(watchlist.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {watchlist.stocks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Open</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">High</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Low</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">EMA 8</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">EMA 20</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">EMA 50</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">EMA 200</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.stocks.map(stock => (
                <StockRow key={stock} stock={stock} watchlistId={watchlist.id} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No stocks in this watchlist yet</p>
          <button
            onClick={() => {
              setSelectedWatchlistId(watchlist.id);
              setShowAddStock(true);
            }}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Add your first stock
          </button>
        </div>
      )}
    </div>
  );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans text-sm ${isDark ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Enter Financial Modeling Prep API Key
            </h3>
            <input
              type="text"
              placeholder="Enter FMP API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={handleApiKeySubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Check className="mr-1" size={14} />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

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
                  value={userTier}
                  onChange={(e) => setUserTier(e.target.value as 'free' | 'premium')}
                  className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm"
                >
                  <option value="free">Free Tier</option>
                  <option value="premium">Premium Tier</option>
                </select>
                {userTier === 'premium' && (
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
                )}
              </div>
              <button
                onClick={exportWatchlists}
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
                  onChange={importWatchlists}
                  className="hidden"
                />
              </label>
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
                onClick={() => setIsDark(!isDark)}
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
                  <SortableWatchlistCard key={watchlist.id} watchlist={watchlist} />
                ))}
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Add Watchlist Modal */}
      {showAddWatchlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Create New Watchlist
            </h3>
            <input
              type="text"
              placeholder="Enter watchlist name..."
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && addWatchlist()}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  setShowAddWatchlist(false);
                  setNewWatchlistName('');
                }}
                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addWatchlist}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Check className="mr-1" size={14} />
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Add Stock to {watchlists.find(wl => wl.id === selectedWatchlistId)?.name}
            </h3>
            <input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)..."
              value={newStockSymbol}
              onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && addStockToWatchlist()}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  setShowAddStock(false);
                  setNewStockSymbol('');
                  setSelectedWatchlistId(null);
                }}
                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addStockToWatchlist}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center text-sm"
              >
                <Plus className="mr-1" size={14} />
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTracker;