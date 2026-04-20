'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useStockDetails, useStockHistory } from '../../../hooks/useStocks';
import { useAnalyzeEarnings } from '../../../hooks/useAI';
import { useAddToWatchlist } from '../../../hooks/useWatchlist';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import StockChart from '../../../components/StockChart';
import AIAssistant from '../../../components/AIAssistant';
import {
  formatCurrency,
  formatPercent,
  getChangeColor,
  formatNumber,
} from '../../../utils/formatters';
import { Star, TrendingUp, Activity } from 'lucide-react';

export default function StockDetailPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'earnings'>('overview');

  const { data: stockData, isLoading, error, refetch } = useStockDetails(ticker);
  const { data: history } = useStockHistory(ticker);
  const addToWatchlist = useAddToWatchlist();

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="Failed to load stock data" onRetry={() => refetch()} />;
  if (!stockData) return null;

  const { company, quote, financials, ratios } = stockData;

  const handleAddToWatchlist = () => {
    addToWatchlist.mutate({ ticker: company.ticker });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <button
                onClick={handleAddToWatchlist}
                disabled={addToWatchlist.isPending}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Star className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
              </button>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-lg font-medium text-gray-600">{company.ticker}</span>
              <span className="text-sm text-gray-500">{company.sector}</span>
              <span className="text-sm text-gray-500">{company.industry}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-900">{formatCurrency(quote.price)}</p>
            <div className="flex items-center justify-end space-x-2 mt-2">
              <span className={`text-lg font-semibold ${getChangeColor(quote.change)}`}>
                {formatCurrency(quote.change)}
              </span>
              <span className={`text-lg font-semibold ${getChangeColor(quote.changePercent)}`}>
                {formatPercent(quote.changePercent)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600">Open</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(quote.open)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">High</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(quote.high)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Low</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(quote.low)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Volume</p>
          <p className="text-xl font-bold text-gray-900">{formatNumber(quote.volume)}</p>
        </div>
      </div>

      {history && history.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Price Chart</h2>
          <StockChart data={history} />
        </div>
      )}

      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ai'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            AI Research
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'earnings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Earnings Analysis
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Ratios</h2>
            {ratios ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">P/E Ratio</span>
                  <span className="font-semibold">{ratios.pe_ratio?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROE</span>
                  <span className="font-semibold">{ratios.roe?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Debt/Equity</span>
                  <span className="font-semibold">{ratios.debt_to_equity?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue Growth</span>
                  <span className="font-semibold">{ratios.revenue_growth?.toFixed(2)}%</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No ratio data available</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Financials</h2>
            {financials.length > 0 ? (
              <div className="space-y-3">
                {financials.slice(0, 3).map((f) => (
                  <div key={f.year} className="border-b pb-3 last:border-b-0">
                    <p className="font-semibold text-gray-900">FY {f.year}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-600">Revenue: </span>
                        <span className="font-medium">{formatCurrency(f.revenue)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Net Income: </span>
                        <span className="font-medium">{formatCurrency(f.net_income)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">EPS: </span>
                        <span className="font-medium">{formatCurrency(f.eps)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No financial data available</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <AIAssistant ticker={ticker} company={company} financials={financials} ratios={ratios} />
      )}

      {activeTab === 'earnings' && <EarningsAnalysis ticker={ticker} />}
    </div>
  );
}

function EarningsAnalysis({ ticker }: { ticker: string }) {
  const analyzeEarnings = useAnalyzeEarnings();

  const handleAnalyze = () => {
    analyzeEarnings.mutate({ ticker });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">AI Earnings Call Analysis</h2>
      {!analyzeEarnings.data && !analyzeEarnings.isPending && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Get AI-powered insights from the latest earnings call
          </p>
          <button onClick={handleAnalyze} className="btn btn-primary">
            <Activity className="h-4 w-4 mr-2 inline" />
            Analyze Earnings Call
          </button>
        </div>
      )}

      {analyzeEarnings.isPending && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing earnings call transcript...</p>
        </div>
      )}

      {analyzeEarnings.error && (
        <ErrorMessage
          message="Failed to analyze earnings call. The company may not have earnings data available."
          onRetry={handleAnalyze}
        />
      )}

      {analyzeEarnings.data && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Quarter: {analyzeEarnings.data.quarter}
            </h3>
            <p className="text-gray-700">{analyzeEarnings.data.summary}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 text-success mr-2" />
              Growth Signals
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {analyzeEarnings.data.growth_signals.map((signal, i) => (
                <li key={i} className="text-gray-700">
                  {signal}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Activity className="h-5 w-5 text-danger mr-2" />
              Risk Signals
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {analyzeEarnings.data.risk_signals.map((signal, i) => (
                <li key={i} className="text-gray-700">
                  {signal}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Strategic Initiatives</h3>
            <ul className="list-disc list-inside space-y-1">
              {analyzeEarnings.data.strategic_initiatives.map((initiative, i) => (
                <li key={i} className="text-gray-700">
                  {initiative}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Management Sentiment</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                analyzeEarnings.data.management_sentiment === 'positive'
                  ? 'bg-success/10 text-success'
                  : analyzeEarnings.data.management_sentiment === 'cautious'
                    ? 'bg-danger/10 text-danger'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {analyzeEarnings.data.management_sentiment.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
