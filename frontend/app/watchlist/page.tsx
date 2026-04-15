'use client';

import { useWatchlist, useRemoveFromWatchlist } from '../../hooks/useWatchlist';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Link from 'next/link';
import { Star, Trash2, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function WatchlistPage() {
  const { data: watchlistData, isLoading, error, refetch } = useWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="Failed to load watchlist" onRetry={() => refetch()} />;

  const items = watchlistData?.items || [];

  const handleRemove = (companyId: string) => {
    if (confirm('Remove this stock from your watchlist?')) {
      removeFromWatchlist.mutate(companyId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Star className="h-8 w-8 text-yellow-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
        </div>
        <p className="text-gray-600">Track your favorite stocks in one place</p>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
          <p className="text-gray-600 mb-6">
            Start adding stocks to track their performance
          </p>
          <Link href="/dashboard" className="btn btn-primary inline-block">
            Explore Stocks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((company) => (
            <div key={company.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <Link href={`/stocks/${company.ticker}`} className="flex-1">
                  <h3 className="font-bold text-gray-900 hover:text-primary-600 transition-colors">
                    {company.ticker}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">{company.name}</p>
                </Link>
                <button
                  onClick={() => handleRemove(company.id)}
                  disabled={removeFromWatchlist.isPending}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sector</span>
                  <span className="font-medium text-gray-900">{company.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry</span>
                  <span className="font-medium text-gray-900">{company.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Cap</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(company.market_cap)}
                  </span>
                </div>
              </div>

              <Link
                href={`/stocks/${company.ticker}`}
                className="mt-4 block w-full btn btn-secondary text-center"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
