# AlphaTracker

A React-based Single Page Application (SPA) designed to track stocks, visualize historical data using TradingView, and monitor live market movers. Built with Vite and Tailwind CSS.

## Features

- **Custom Watchlists:** Create multiple watchlists, reorder them via drag-and-drop, and seamlessly add or remove specific stock tickers.
- **Real-Time Data Extraction:** Integrates with the Financial Modeling Prep (FMP) API to pull live EPS, P/E ratios, next earnings announcements, stock peers, and market quotes.
- **Advanced Interactive Charting:** Uses the `react-ts-tradingview-widgets` library to embed feature-rich, dynamic TradingView charts.
- **Peer Navigation:** Quickly pivot between related companies using clickable "Similar Stocks" badges.
- **Top Movers Dashboard:** View real-time daily "Top Gainers" and "Top Losers" across the entire stock market, with sortable and filterable grids.
- **Configurable Auto-Refresh:** Keep your prices up to date automatically without lifting a finger.
- **Data Persistence:** Your watchlists, FMP API key, layout preferences, and UI theme (Dark/Light) are safely stored in your local browser storage.
- **Import/Export Integration:** Easily download your watchlists as CSV files and upload them again on different devices.

## Tech Stack

- [React](https://reactjs.org/) (Hooks, Context, Memoization)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) (Icons)
- [@dnd-kit](https://dndkit.com/) (Drag and Drop Watchlists)
- [TradingView Advanced Chart Widget](https://www.tradingview.com/widget/advanced-chart/)

## Getting Started

### Prerequisites

To run this application locally, you will need to have [Node.js](https://nodejs.org/en/) installed on your machine.
You will also need a free API key from [Financial Modeling Prep (FMP)](https://site.financialmodelingprep.com/developer/docs).

### Installation

1. Clone this repository (or download the zip extraction).
2. Open your terminal and navigate to the root directory `stocktracker-app`.
3. Install the dependencies by running:

```bash
npm install
```

4. Start the local development server:

```bash
npm run dev
```

5. Open your browser to the local address provided (usually `http://localhost:5173`).
6. When prompted by the application UI, enter your secure FMP API key to begin fetching stock data.

## Deployment Information

This project is a static front-end SPA and is fully optimized for continuous deployment on platforms like Vercel, Netlify, or GitHub Pages.

To create an optimized production build, run:
```bash
npm run build
```
This generates the minimized, deploy-ready artifacts inside the `dist/` directory.

---
*Created as a lightweight, lightning-fast dashboard to monitor investments.*
