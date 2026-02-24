import { useState, useEffect } from 'react';

export interface StockNews {
    title: string;
    publishedDate: string;
    url: string;
    site: string;
    image?: string;
}

export interface StockDetails {
    eps: number | null;
    pe: number | null;
    earningsAnnouncement: string | null;
    peers: string[];
    news: StockNews[];
}

export const useStockDetails = (symbol: string | null) => {
    const [details, setDetails] = useState<StockDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const apiKey = localStorage.getItem('fmpApiKey');

        if (!apiKey || !symbol) {
            setDetails(null);
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [quoteRes, peersRes, newsRes] = await Promise.all([
                    fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`),
                    fetch(`https://financialmodelingprep.com/api/v4/stock_peers?symbol=${symbol}&apikey=${apiKey}`),
                    fetch(`https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=5&apikey=${apiKey}`)
                ]);

                const quoteData = await quoteRes.json().catch(() => []);
                const peersData = await peersRes.json().catch(() => []);
                const newsData = await newsRes.json().catch(() => []);

                if (isMounted) {
                    const quote = Array.isArray(quoteData) && quoteData.length > 0 ? quoteData[0] : {};

                    let peersList: string[] = [];
                    if (Array.isArray(peersData) && peersData.length > 0 && peersData[0].peersList) {
                        peersList = peersData[0].peersList;
                    }

                    setDetails({
                        eps: quote.eps ?? null,
                        pe: quote.pe ?? null,
                        earningsAnnouncement: quote.earningsAnnouncement ?? null,
                        peers: peersList,
                        news: Array.isArray(newsData) ? newsData.slice(0, 5) : []
                    });
                }
            } catch (err) {
                console.error('Failed to fetch stock details', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDetails();

        return () => {
            isMounted = false;
        };
    }, [symbol]);

    return { details, loading };
};
