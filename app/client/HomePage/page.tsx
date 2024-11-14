'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Edit,
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

  // State variables for modal and images
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedWRNumber, setSelectedWRNumber] = useState<string | null>(null);

  // State variables for full-screen image
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState<number>(0);

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

  const openModalWithImages = async (wrNumber: string) => {
    setIsModalOpen(true);
    setSelectedWRNumber(wrNumber);
    setModalLoading(true);
    setModalError(null);
    try {
      const response = await axios.get(
        `https://zol0yn9wc2.execute-api.us-east-1.amazonaws.com/prod/getPhoto?wr_id=${wrNumber}`
      );
      const imageUrls = response.data;
      setModalImages(imageUrls);
    } catch (error) {
      console.error('Error fetching images:', error);
      setModalError('Failed to fetch images.');
      setModalImages([]);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImages([]);
    setModalError(null);
    setSelectedWRNumber(null);
  };

  const openFullScreenImage = (index: number) => {
    setFullScreenImageIndex(index);
    setIsFullScreenOpen(true);
    setIsModalOpen(false); // Close the first modal
  };

  const closeFullScreenImage = () => {
    setIsFullScreenOpen(false);
    setIsModalOpen(true); // Re-open the first modal if desired
  };

  const showPrevImage = () => {
    setFullScreenImageIndex((prevIndex) =>
      prevIndex === 0 ? modalImages.length - 1 : prevIndex - 1
    );
  };

  const showNextImage = () => {
    setFullScreenImageIndex((prevIndex) =>
      prevIndex === modalImages.length - 1 ? 0 : prevIndex + 1
    );
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
                <TableHead className="font-bold w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-red-500">
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
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModalWithImages(receipt[0])}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">View Images</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {searchTerm ? 'No results found' : 'No receipts available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal for displaying images */}
        {isModalOpen && !isFullScreenOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 max-w-3xl w-full relative">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Images for {selectedWRNumber}</h2>
              </div>
              {modalLoading ? (
                <p>Loading images...</p>
              ) : modalError ? (
                <p className="text-red-500">{modalError}</p>
              ) : modalImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {modalImages.map((url, index) => (
                    <div
                      key={index}
                      className="border rounded overflow-hidden cursor-pointer"
                      onClick={() => openFullScreenImage(index)}
                    >
                      <Image
                        src={url}
                        alt={`Image ${index + 1}`}
                        width={300}
                        height={200}
                        className="object-cover w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p>No images available for this warehouse receipt.</p>
              )}
            </div>
          </div>
        )}

        {/* Full-screen image modal */}
        {isFullScreenOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-80">
            <button
              onClick={closeFullScreenImage}
              className="absolute top-4 right-4 text-white text-3xl font-bold"
            >
              &times;
            </button>
            {modalImages.length > 1 && (
              <>
                <button
                  onClick={showPrevImage}
                  className="absolute left-4 text-white text-5xl font-bold"
                >
                  &#8249;
                </button>
                <button
                  onClick={showNextImage}
                  className="absolute right-4 text-white text-5xl font-bold"
                >
                  &#8250;
                </button>
              </>
            )}
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <Image
                src={modalImages[fullScreenImageIndex]}
                alt={`Image ${fullScreenImageIndex + 1}`}
                width={800}
                height={800}
                className="object-contain w-auto h-auto max-w-full max-h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}








