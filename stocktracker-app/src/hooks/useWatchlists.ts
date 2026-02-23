import { useState, useEffect } from 'react';
import type { Watchlist } from '../types/types';

export const useWatchlists = () => {
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
  const [editingWatchlist, setEditingWatchlist] = useState<number | null>(null);

  // Debug watchlists changes
  useEffect(() => {
    console.log('Watchlists updated:', watchlists);
  }, [watchlists]);

  const addWatchlist = (name: string) => {
    if (name.trim()) {
      const newWatchlist = {
        id: Date.now(),
        name,
        stocks: [],
        visible: true
      };
      setWatchlists([...watchlists, newWatchlist]);
      return true;
    }
    return false;
  };

  const deleteWatchlist = (id: number) => {
    setWatchlists(watchlists.filter(wl => wl.id !== id));
  };

  const toggleWatchlistVisibility = (id: number) => {
    setWatchlists(watchlists.map(wl => 
      wl.id === id ? { ...wl, visible: !wl.visible } : wl
    ));
  };

  const addStockToWatchlist = (watchlistId: number, stockSymbol: string) => {
    if (stockSymbol.trim()) {
      setWatchlists(watchlists.map(wl => 
        wl.id === watchlistId 
          ? { ...wl, stocks: [...wl.stocks, stockSymbol.toUpperCase()] }
          : wl
      ));
      return true;
    }
    return false;
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

  const setWatchlistsData = (newWatchlists: Watchlist[]) => {
    setWatchlists(newWatchlists);
  };

  return {
    watchlists,
    editingWatchlist,
    setEditingWatchlist,
    addWatchlist,
    deleteWatchlist,
    toggleWatchlistVisibility,
    addStockToWatchlist,
    removeStockFromWatchlist,
    updateWatchlistName,
    setWatchlistsData
  };
}; 