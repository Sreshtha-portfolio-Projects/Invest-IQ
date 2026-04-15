'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Search, LayoutDashboard, Star, Bot } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Screener', href: '/screener', icon: Search },
  { name: 'Watchlist', href: '/watchlist', icon: Star },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Invest IQ</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-primary-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-2 px-3 py-1 bg-primary-50 rounded-full">
              <Bot className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
