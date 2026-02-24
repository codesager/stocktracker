import React from 'react';
import { Plus } from 'lucide-react';
import type { Watchlist } from '../../types/types';

interface AddStockModalProps {
  isOpen: boolean;
  stockSymbol: string;
  selectedWatchlistId: number | null;
  watchlists: Watchlist[];
  onStockSymbolChange: (symbol: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  stockSymbol,
  selectedWatchlistId,
  watchlists,
  onStockSymbolChange,
  onCancel,
  onSubmit
}) => {
  if (!isOpen) return null;

  const selectedWatchlist = watchlists.find(wl => wl.id === selectedWatchlistId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 w-96">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Add Stock to {selectedWatchlist?.name}
        </h3>
        <input
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL)..."
          value={stockSymbol}
          onChange={(e) => onStockSymbolChange(e.target.value.toUpperCase())}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        />
        <div className="flex justify-end space-x-2 mt-3">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center text-sm"
          >
            <Plus className="mr-1" size={14} />
            Add Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal; 