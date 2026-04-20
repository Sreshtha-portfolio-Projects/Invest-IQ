'use client';

import { TrendingStock } from '../types/market';
import { formatCurrency, formatPercent, getChangeBgColor } from '../utils/formatters';
import Link from 'next/link';

interface StockCardProps {
  stock: TrendingStock;
}

export default function StockCard({ stock }: StockCardProps) {
  return (
    <Link
      href={`/stocks/${stock.ticker}`}
      className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{stock.ticker}</h3>
          <p className="text-sm text-gray-600 truncate">{stock.name}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${getChangeBgColor(stock.changePercent)}`}
        >
          {formatPercent(stock.changePercent)}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-lg font-bold text-gray-900">{formatCurrency(stock.price)}</p>
      </div>
    </Link>
  );
}
