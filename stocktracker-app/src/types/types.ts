export interface Watchlist {
  id: number;
  name: string;
  stocks: string[];
  visible: boolean;
}

export interface StockData {
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