'use client';

import { useMarketOverview } from '../../hooks/useStocks';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StockCard from '../../components/StockCard';
import SearchBar from '../../components/SearchBar';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatCurrency, formatPercent, getChangeColor } from '../../utils/formatters';

export default function DashboardPage() {
  const { data: overview, isLoading, error, refetch } = useMarketOverview();

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="Failed to load market data" onRetry={() => refetch()} />;
  if (!overview) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Dashboard</h1>
        <p className="text-gray-600">Real-time market data and insights</p>
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {overview.indices.map((index) => (
          <div key={index.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{index.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(index.value)}
                </p>
              </div>
              <Activity className="h-12 w-12 text-primary-600" />
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <span className={`text-lg font-semibold ${getChangeColor(index.change)}`}>
                {formatCurrency(index.change)}
              </span>
              <span className={`text-lg font-semibold ${getChangeColor(index.changePercent)}`}>
                {formatPercent(index.changePercent)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-success mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Top Gainers</h2>
          </div>
          <div className="space-y-4">
            {overview.topGainers.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <TrendingDown className="h-5 w-5 text-danger mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Top Losers</h2>
          </div>
          <div className="space-y-4">
            {overview.topLosers.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Trending</h2>
          </div>
          <div className="space-y-4">
            {overview.trendingStocks.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
