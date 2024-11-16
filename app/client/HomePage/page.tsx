'use client';

import React, { useState, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Home, FileText, ShoppingCart, Package, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axios from 'axios';
import { useClient } from '../../ClientContext';

type ReceiptData = [string, string, boolean];

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { href: '/client/HomePage', label: 'Home', icon: Home },
  { href: '/client/HomePage/WR', label: 'Warehouse Receipt', icon: FileText },
  { href: '/client/HomePage/PO', label: 'Purchase Order', icon: ShoppingCart },
  { href: '/client/HomePage/MR', label: 'Material Receipt', icon: Package },
];

function Navigation({ handleLogout, clientName }: { handleLogout: () => void; clientName: string }): JSX.Element {
  return (
    <nav className="bg-primary text-primary-foreground shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Image src="/wex.png" alt="Wex Logo" width={50} height={50} className="rounded-full" />
            <span className="text-xl font-bold">WMS Xpress</span>
          </div>
          <div className="flex justify-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center justify-center h-16 w-20"
                  >
                    <IconComponent className="h-5 w-5 mb-1" />
                    <span className="text-xs text-center">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Client: {clientName}</span>
            <Button onClick={handleLogout} className="flex items-center" variant="secondary">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function Homepage() {
  const router = useRouter();
  const { clientName } = useClient();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false); // Added searching state

  useEffect(() => {
    const fetchRecentReceipts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ReceiptData[]>(
          `https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/getWR_PO_MR_forclient?client=${encodeURIComponent(clientName)}`
        );
        setReceipts(response.data);
        setFilteredReceipts(response.data);
      } catch (err) {
        console.error('Error fetching receipts:', err);
        setError('Failed to load receipts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (clientName) {
      fetchRecentReceipts();
    }
  }, [clientName]);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleSearch = () => {
    setIsSearching(true); // Set isSearching to true before search
    if (searchTerm === '') {
      setFilteredReceipts(receipts);
    } else {
      const filtered = receipts.filter(
        (receipt) =>
          receipt[0].toUpperCase().includes(searchTerm.toUpperCase()) ||
          receipt[1].toUpperCase().includes(searchTerm.toUpperCase())
      );
      setFilteredReceipts(filtered);
    }
    setTimeout(() => setIsSearching(false), 500); // Reset after 500ms for visual feedback
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === '') {
      setFilteredReceipts(receipts);
    } else {
      const filtered = receipts.filter(
        (receipt) =>
          receipt[0].toUpperCase().includes(value.toUpperCase()) ||
          receipt[1].toUpperCase().includes(value.toUpperCase())
      );
      setFilteredReceipts(filtered);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Backspace' && searchTerm === '') {
      setFilteredReceipts(receipts);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredReceipts(receipts);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation handleLogout={handleLogout} clientName={clientName} />
      <div className="container mx-auto px-4 py-8 relative">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Welcome to WMS Xpress, {clientName}!
        </h1>
        <div className="flex gap-4 mb-6 max-w-3xl mx-auto">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search by number (e.g., WR-012, PO987654)..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="pr-10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} className="flex-shrink-0" disabled={isSearching}> {/* Updated Button */}
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? 'Searching...' : 'Search'} {/* Conditional rendering */}
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 max-w-3xl mx-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Warehouse Receipt</TableHead>
                <TableHead className="font-bold">PO Number</TableHead>
                <TableHead className="font-bold">MR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Link
                        href={`/client/HomePage/WR?wrNumber=${receipt[0]}`}
                        className="text-primary hover:text-blue-600 hover:underline"
                      >
                        {receipt[0]}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/client/HomePage/PO?poNumber=${receipt[1]}`}
                        className="text-primary hover:text-blue-600 hover:underline"
                      >
                        {receipt[1]}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {receipt[2] ? (
                        <Link
                          href={`/client/HomePage/MR?mrNumber=${receipt[0]}`}
                          className="text-primary hover:text-blue-600 hover:underline"
                        >
                          View MR
                        </Link>
                      ) : (
                        'No MR'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
