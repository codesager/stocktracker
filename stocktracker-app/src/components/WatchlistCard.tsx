import React from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  BarChart3,
  GripVertical
} from 'lucide-react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Watchlist, StockData } from '../types/types';
import StockRow from './StockRow';

interface WatchlistCardProps {
  watchlist: Watchlist;
  stockData: Record<string, StockData>;
  editingWatchlist: number | null;
  onToggleVisibility: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onUpdateName: (id: number, newName: string) => void;
  onAddStock: (watchlistId: number) => void;
  onRemoveStock: (watchlistId: number, stockSymbol: string) => void;
}

const WatchlistCard: React.FC<WatchlistCardProps> = ({
  watchlist,
  stockData,
  editingWatchlist,
  onToggleVisibility,
  onDelete,
  onEdit,
  onUpdateName,
  onAddStock,
  onRemoveStock
}) => {
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
              onBlur={(e) => onUpdateName(watchlist.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdateName(watchlist.id, (e.target as HTMLInputElement).value);
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
            onClick={() => onEdit(watchlist.id)}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onToggleVisibility(watchlist.id)}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            {watchlist.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={() => onAddStock(watchlist.id)}
            className="text-green-500 hover:text-green-700 transition-colors"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => onDelete(watchlist.id)}
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
                <StockRow 
                  key={stock} 
                  stock={stock} 
                  watchlistId={watchlist.id}
                  stockData={stockData}
                  onRemoveStock={onRemoveStock}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No stocks in this watchlist yet</p>
          <button
            onClick={() => onAddStock(watchlist.id)}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Add your first stock
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchlistCard; 