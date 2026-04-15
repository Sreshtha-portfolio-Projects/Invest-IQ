'use client';

import { useState } from 'react';
import { useScreenStocks } from '../../hooks/useAI';
import { Search, Filter, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function ScreenerPage() {
  const [query, setQuery] = useState('');
  const screenStocks = useScreenStocks();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    screenStocks.mutate({ query });
  };

  const examples = [
    'Technology companies with P/E under 20',
    'Large cap stocks with ROE above 15%',
    'Banking sector with low debt to equity',
    'High growth companies in consumer goods',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Stock Screener</h1>
        <p className="text-gray-600">Use natural language to find stocks that match your criteria</p>
      </div>

      <div className="card mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Technology companies with P/E under 20 and ROE above 15%"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={screenStocks.isPending || !query.trim()}
            className="btn btn-primary w-full"
          >
            {screenStocks.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Filter className="h-4 w-4 mr-2" />
                Screen Stocks
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, i) => (
              <button
                key={i}
                onClick={() => setQuery(example)}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {screenStocks.error && (
        <div className="card bg-danger/10 border-danger/20">
          <p className="text-danger">Failed to screen stocks. Please try again.</p>
        </div>
      )}

      {screenStocks.data && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Applied Filters</h2>
            <div className="flex flex-wrap gap-2">
              {screenStocks.data.filters.map((filter, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                >
                  {filter.field} {filter.operator} {filter.value}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Results ({screenStocks.data.stocks.length} stocks found)
            </h2>

            {screenStocks.data.stocks.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No stocks match your criteria. Try adjusting your filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sector
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Market Cap
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P/E Ratio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ROE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {screenStocks.data.stocks.map((stock) => (
                      <tr key={stock.ticker} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/stocks/${stock.ticker}`}
                            className="text-primary-600 hover:text-primary-800 font-medium"
                          >
                            {stock.ticker}
                          </Link>
                          <div className="text-sm text-gray-500">{stock.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.sector}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(stock.market_cap)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.pe_ratio?.toFixed(2) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.roe?.toFixed(2) || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
