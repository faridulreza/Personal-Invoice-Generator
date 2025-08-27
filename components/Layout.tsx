'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Plus, Users, Settings, BarChart3 } from 'lucide-react';


interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Create Invoice', href: '/invoices/create', icon: Plus },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-purple-700 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <BarChart3 className="h-6 w-6 text-white mr-2" />
            <h1 className="text-xl font-bold text-white">Invoice Maker</h1>
          </div>
          <nav className="mt-5 flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive 
                      ? 'bg-purple-800 text-white' 
                      : 'text-purple-100 hover:bg-purple-600 hover:text-white'
                    }
                  `}
                >
                  <IconComponent className="mr-3 flex-shrink-0 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
