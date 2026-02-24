import React from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import type { StockData } from '../types/types';

interface StockRowProps {
  stock: string;
  watchlistId: number;
  stockData: Record<string, StockData>;
  onRemoveStock: (watchlistId: number, stockSymbol: string) => void;
  onSelectStock: (stockSymbol: string) => void;
}

const StockRow: React.FC<StockRowProps> = ({
  stock,
  watchlistId,
  stockData,
  onRemoveStock,
  onSelectStock
}) => {
  const data = stockData[stock];
  if (!data) return (
    <tr className="group border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="px-2 py-1 font-medium text-gray-900 dark:text-gray-100 flex items-center text-xs">
        {stock}
        <button
          onClick={() => onRemoveStock(watchlistId, stock)}
          className="ml-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove invalid symbol"
        >
          <X size={10} />
        </button>
      </td>
      <td colSpan={9} className="px-2 py-1 text-gray-500 text-xs italic">
        Invalid symbol or no data available.
      </td>
    </tr>
  );

  const isPositive = data.change >= 0;

  return (
    <tr
      className="group border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
      onClick={() => onSelectStock(stock)}
    >
      <td className="px-2 py-1 font-medium text-gray-900 dark:text-gray-100 flex items-center text-xs">
        {stock}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveStock(watchlistId, stock);
          }}
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

export default React.memo(StockRow); 