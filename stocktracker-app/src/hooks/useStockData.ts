import { useState, useCallback, useEffect, useMemo } from 'react';
import { calculateEMA } from '../utils/emaUtils';
import type { StockData, Watchlist } from '../types/types';

export const useStockData = (watchlists: Watchlist[], apiKey: string) => {
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(() => {
    // Load auto-refresh preference from localStorage, default to true
    const saved = localStorage.getItem('autoRefreshEnabled');
    return saved === null ? true : saved === 'true';
  });
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

  // Simulate API data fetching
  const fetchStockData = useCallback(async () => {
    console.log('fetchStockData', localStorage.getItem('fmpApiKey'));
    if (!localStorage.getItem('fmpApiKey')) {
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
    const results = await Promise.all(allSymbols.map(symbol => generateStockData(symbol)));

    for (const data of results) {
      if (data) {
        newStockData[data.ticker] = data;
      }
    }

    setStockData(newStockData);
    setIsRefreshing(false);
  }, [watchlists, generateStockData]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    const newValue = !autoRefreshEnabled;
    setAutoRefreshEnabled(newValue);
    localStorage.setItem('autoRefreshEnabled', String(newValue));
  }, [autoRefreshEnabled]);

  // Deduplicate symbols to avoid re-fetching when just watchlist name/order changes
  const trackedSymbols = useMemo(() => {
    return [...new Set(
      watchlists.filter(wl => wl.visible).flatMap(wl => wl.stocks)
    )].sort().join(',');
  }, [watchlists]);

  // Initial fetch on mount and when symbols/apiKey change (independent of auto-refresh)
  useEffect(() => {
    fetchStockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackedSymbols, apiKey]);

  // Auto-refresh interval (only when enabled)
  useEffect(() => {
    if (!autoRefreshEnabled) {
      return;
    }
    
    const interval = setInterval(fetchStockData, 60000);
    return () => clearInterval(interval);
  }, [fetchStockData, autoRefreshEnabled]);

  return {
    stockData,
    isRefreshing,
    fetchStockData,
    autoRefreshEnabled,
    toggleAutoRefresh
  };
}; 