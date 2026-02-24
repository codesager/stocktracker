import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, Search, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketStock {
    symbol: string;
    name: string;
    change: number;
    price: number;
    changesPercentage: number;
}

interface DashboardPageProps {
    apiKey: string;
}

type SortKey = 'symbol' | 'price' | 'change' | 'changesPercentage';
type SortDirection = 'asc' | 'desc';

const MarketTable = ({
    data,
    title,
    icon,
    colorClass
}: {
    data: MarketStock[],
    title: string,
    icon: React.ReactNode,
    colorClass: string
}) => {
    const [sortKey, setSortKey] = useState<SortKey>('changesPercentage');
    const [sortDir, setSortDir] = useState<SortDirection>('desc');
    const [filter, setFilter] = useState('');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const sortedAndFiltered = useMemo(() => {
        return data
            .filter(item =>
                item.symbol.toLowerCase().includes(filter.toLowerCase()) ||
                item.name.toLowerCase().includes(filter.toLowerCase())
            )
            .sort((a, b) => {
                let valA = a[sortKey];
                let valB = b[sortKey];
                if (typeof valA === 'string' && typeof valB === 'string') {
                    return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                } else if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortDir === 'asc' ? valA - valB : valB - valA;
                }
                return 0;
            });
    }, [data, sortKey, sortDir, filter]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
            <div className={`p-4 border-b border-gray-200 dark:border-gray-700 font-bold flex items-center justify-between ${colorClass}`}>
                <div className="flex items-center">
                    {icon}
                    <span className="ml-2 text-lg">{title}</span>
                    <span className="ml-3 text-sm font-normal opacity-80">({data.length} total)</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 text-gray-400 dark:text-gray-300 top-1/2 -translate-y-1/2" size={14} />
                    <input
                        type="text"
                        placeholder="Filter symbols..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="pl-7 pr-2 py-1 rounded-md text-sm border-none bg-black/5 dark:bg-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('symbol')}>
                                Symbol <ArrowUpDown size={12} className="inline ml-1" />
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('price')}>
                                Price <ArrowUpDown size={12} className="inline ml-1" />
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('change')}>
                                Change <ArrowUpDown size={12} className="inline ml-1" />
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('changesPercentage')}>
                                % Change <ArrowUpDown size={12} className="inline ml-1" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFiltered.map(stock => {
                            const isPositive = stock.change >= 0;
                            return (
                                <tr key={stock.symbol} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-3 py-2">
                                        <div className="font-bold text-gray-900 dark:text-gray-100">{stock.symbol}</div>
                                        <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{stock.name}</div>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200">${stock.price?.toFixed(2)}</td>
                                    <td className={`px-3 py-2 text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {isPositive ? '+' : ''}{stock.change?.toFixed(2)}
                                    </td>
                                    <td className={`px-3 py-2 text-sm font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {isPositive ? '+' : ''}{stock.changesPercentage?.toFixed(2)}%
                                    </td>
                                </tr>
                            );
                        })}
                        {sortedAndFiltered.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No stocks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ apiKey }) => {
    const [gainers, setGainers] = useState<MarketStock[]>([]);
    const [losers, setLosers] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(false);

    // Expose a global method or use a generic periodic refresh mechanism
    // For now, we will just fetch on mount.
    useEffect(() => {
        let mounted = true;
        const fetchMarketData = async () => {
            if (!apiKey) return;
            setLoading(true);
            try {
                const [gainersRes, losersRes] = await Promise.all([
                    fetch(`https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${apiKey}`),
                    fetch(`https://financialmodelingprep.com/api/v3/stock_market/losers?apikey=${apiKey}`)
                ]);
                const gainersData = await gainersRes.json();
                const losersData = await losersRes.json();

                if (mounted) {
                    setGainers(Array.isArray(gainersData) ? gainersData : []);
                    setLosers(Array.isArray(losersData) ? losersData : []);
                }
            } catch (err) {
                console.error('Failed to fetch market dashboard data', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchMarketData();

        // Listen to custom event for manual full refresh mapped to "fetchStockData" from app level
        const handleRefresh = () => fetchMarketData();
        window.addEventListener('refreshDashboard', handleRefresh);

        // Listen to interval based auto-refresh
        const autoRefreshInterval = setInterval(() => {
            if (localStorage.getItem('autoRefreshEnabled') === 'true') {
                fetchMarketData();
            }
        }, 60000);

        return () => {
            mounted = false;
            window.removeEventListener('refreshDashboard', handleRefresh);
            clearInterval(autoRefreshInterval);
        };
    }, [apiKey]);

    if (!apiKey) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">No API Key Provided</h2>
                <p className="text-gray-500 mt-2">Please set your FMP API key to view the market dashboard.</p>
            </div>
        );
    }

    return (
        <div className="w-full px-2 sm:px-4 lg:px-6 py-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Active Movers</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time daily top gainers and losers across the market.</p>
                </div>
                {loading && <span className="text-sm text-gray-500 animate-pulse">Loading market data...</span>}
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
                <MarketTable
                    data={gainers}
                    title="Top Gainers"
                    icon={<TrendingUp size={24} />}
                    colorClass="text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
                />
                <MarketTable
                    data={losers}
                    title="Top Losers"
                    icon={<TrendingDown size={24} />}
                    colorClass="text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
                />
            </div>
        </div>
    );
};

export default React.memo(DashboardPage);
