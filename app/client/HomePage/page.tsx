'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Home,
  FileText,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axios from 'axios';

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

function Navigation({
  handleLogout,
}: {
  handleLogout: () => void;
}): JSX.Element {
  return (
    <nav className="bg-primary text-primary-foreground shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Image
              src="/wex.png"
              alt="Wex Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <span className="text-xl font-bold">WMS Express</span>
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
          <Button
            onClick={handleLogout}
            className="flex items-center"
            variant="secondary"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default function Homepage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentReceipts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ReceiptData[]>(
          'https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/getWR_PO_MR_forclient?client=David Burris'
        );
        console.log('API Response:', response.data);
        setReceipts(response.data);
      } catch (err) {
        console.error('Error fetching receipts:', err);
        setError('Failed to load receipts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentReceipts();
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  const filteredReceipts = searchTerm
    ? receipts.filter(
        (receipt) =>
          receipt[0].toUpperCase().includes(searchTerm.toUpperCase()) ||
          receipt[1].toUpperCase().includes(searchTerm.toUpperCase())
      )
    : receipts;

  return (
    <div className="min-h-screen bg-background">
      <Navigation handleLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8 relative">
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            <input
              type="text"
              placeholder="Search by number (e.g., WR-012, PO987654)..."
              className="border rounded-md p-2 w-full max-w-3xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                    {searchTerm ? 'No results found' : 'No receipts available'}
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








