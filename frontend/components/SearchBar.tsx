'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useStockSearch } from '../hooks/useStocks';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: results, isLoading } = useStockSearch(query);
  const router = useRouter();

  const handleSelect = (ticker: string) => {
    setQuery('');
    setIsOpen(false);
    router.push(`/stocks/${ticker}`);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search stocks... (e.g., RELIANCE, TCS, INFY)"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {isOpen && query && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results && results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li
                  key={result.ticker}
                  onClick={() => handleSelect(result.ticker)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{result.ticker}</p>
                      <p className="text-sm text-gray-600">{result.name}</p>
                    </div>
                    <span className="text-xs text-gray-500">{result.exchange}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">No results found</div>
          )}
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
