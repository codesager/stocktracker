import React from 'react';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { X, ExternalLink, Calendar, TrendingUp, Newspaper } from "lucide-react";
import { useStockDetails } from '../hooks/useStockDetails';

interface ChartPanelProps {
    symbol: string;
    isDark: boolean;
    onClose: () => void;
    onSelectStock: (symbol: string) => void;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ symbol, isDark, onClose, onSelectStock }) => {
    const { details, loading } = useStockDetails(symbol);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-[calc(100vh-100px)] min-h-[600px] overflow-y-auto flex flex-col mt-6 xl:mt-0 xl:sticky xl:top-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    {symbol} Overview
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Close Panel"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Chart Section */}
            <div className="w-full shrink-0 h-[400px] relative mb-6">
                <AdvancedRealTimeChart
                    theme={isDark ? "dark" : "light"}
                    symbol={symbol}
                    autosize
                />
            </div>

            {/* Fundamentals Section */}
            <div className="flex-1 flex flex-col gap-6">
                {loading ? (
                    <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                    </div>
                ) : details ? (
                    <>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3 shrink-0">
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-start flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center"><TrendingUp className="mr-1" size={12} /> EPS (TTM)</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{details.eps ? `$${details.eps.toFixed(2)}` : 'N/A'}</span>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-start flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center"><TrendingUp className="mr-1" size={12} /> P/E Ratio</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{details.pe ? details.pe.toFixed(2) : 'N/A'}</span>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-start flex-col col-span-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center"><Calendar className="mr-1" size={12} /> Next Earnings</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {details.earningsAnnouncement ? new Date(details.earningsAnnouncement).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Peers */}
                        {details.peers.length > 0 && (
                            <div className="shrink-0">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-1">Similar Stocks (Peers)</h3>
                                <div className="flex flex-wrap gap-2">
                                    {details.peers.map(p => (
                                        <button
                                            key={p}
                                            onClick={() => onSelectStock(p)}
                                            className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-md shadow-sm border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* News */}
                        {details.news.length > 0 && (
                            <div className="flex-1 mt-1">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                                    <Newspaper className="mr-2" size={16} /> Recent News
                                </h3>
                                <div className="space-y-3">
                                    {details.news.map((item, i) => (
                                        <a
                                            key={i}
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                                        >
                                            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 group-hover:underline line-clamp-2">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                                                <span>{item.site}</span>
                                                <span className="flex items-center">{new Date(item.publishedDate).toLocaleDateString()} <ExternalLink size={10} className="ml-1" /></span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">Missing fundamental data</div>
                )}
            </div>
        </div>
    );
};

export default React.memo(ChartPanel);
