import type { Watchlist } from '../types/types';

/**
 * Export watchlists to CSV format
 * @param watchlists - Array of watchlists to export
 * @returns CSV content as string
 */
export const exportWatchlistsToCSV = (watchlists: Watchlist[]): string => {
  const csvContent = [
    'Watchlist Name,Stocks,Visible',
    ...watchlists.map(wl => {
      const escapedName = wl.name.replace(/"/g, '""');
      const stocksString = wl.stocks.join(';');
      return `"${escapedName}","${stocksString}","${wl.visible}"`;
    })
  ].join('\n');

  return csvContent;
};

/**
 * Parse CSV content and convert to watchlists
 * @param csvContent - CSV content as string
 * @returns Array of parsed watchlists
 */
export const parseCSVToWatchlists = (csvContent: string): Watchlist[] => {
  const lines = csvContent.split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line && line.length > 0);
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  if (lines[0] !== 'Watchlist Name,Stocks,Visible') {
    throw new Error('Invalid CSV format. Expected header: Watchlist Name,Stocks,Visible');
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
    throw new Error('No valid watchlists found in the CSV file');
  }

  return newWatchlists;
};

/**
 * Download CSV file
 * @param csvContent - CSV content as string
 * @param filename - Name of the file to download
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}; 