'use client'

import { useState, useEffect, useCallback, KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Home, FileText, ShoppingCart, Package, LogOut } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useClient } from '@/app/ClientContext'

interface WarehouseReceipt {
  wrNumber: string;
  client: string;
  carrier: string;
  trackingNumber: string;
  receivedBy: string;
  hazmat: 'yes' | 'no';
  hazmatCode: string;
  notes: string;
  po: string;
  boxes: {
    number: string;
    type: string;
    length: string;
    width: string;
    height: string;
    weight: string;
    location: string;
  }[];
  images: string[];
}

function Navigation({ handleLogout, clientName }: { handleLogout: () => void; clientName: string }) {
  return (
    <nav className="bg-primary text-primary-foreground shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Image src="/wex.png" alt="Wex Logo" width={50} height={50} className="rounded-full" />
            <span className="text-xl font-bold">WMS Express</span>
          </div>
          <div className="flex justify-center space-x-1">
            {[
              { href: "/client/HomePage", label: "Home", icon: Home },
              { href: "/client/HomePage/WR", label: "Warehouse Receipt", icon: FileText },
              { href: "/client/HomePage/PO", label: "Purchase Order", icon: ShoppingCart },
              { href: "/client/HomePage/MR", label: "Material Receipt", icon: Package },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="flex flex-col items-center justify-center h-16 w-20">
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs text-center">{item.label}</span>
                </Button>
              </Link>
            ))}
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
  )
}

export default function WarehouseReceiptViewer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [warehouseReceipt, setWarehouseReceipt] = useState<WarehouseReceipt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const { clientName } = useClient()

  const fetchWarehouseReceipt = useCallback(async (wrNumber: string) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const response = await axios.get(`https://qwlotlnq36.execute-api.us-east-1.amazonaws.com/prod/GetWR?wr_id=${wrNumber}`)
      const data = response.data

      if (Array.isArray(data) && data.length >= 2) {
        const [wrDetails, , ...boxesData] = data

        const imagesResponse = await axios.get(`https://zol0yn9wc2.execute-api.us-east-1.amazonaws.com/prod/getPhoto?wr_id=${wrNumber}`)
        const imagesData = imagesResponse.data

        setWarehouseReceipt({
          wrNumber: wrDetails[0] || '',
          client: wrDetails[1] || '',
          carrier: wrDetails[2] || '',
          trackingNumber: wrDetails[3] || '',
          receivedBy: wrDetails[5] || '',
          hazmat: wrDetails[6] === 'yes' ? 'yes' : 'no',
          hazmatCode: wrDetails[7] || '',
          notes: wrDetails[8] || '',
          po: wrDetails[9] || '',
          boxes: boxesData.map(box => ({
            number: box[0] || '',
            type: box[1] || '',
            length: box[2] || '',
            width: box[3] || '',
            height: box[4] || '',
            weight: box[6] || '', 
            location: box[5] || '' 
          })),
          images: imagesData || []
        })
      } else {
        setError('No data found for this WR number')
        setWarehouseReceipt(null)
      }
    } catch (error) {
      console.error("Error fetching warehouse receipt:", error)
      setError('Failed to fetch warehouse receipt. Please try again.')
      setWarehouseReceipt(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const wrNumber = searchParams.get('wrNumber')
    if (wrNumber) {
      fetchWarehouseReceipt(wrNumber)
    }
  }, [searchParams, fetchWarehouseReceipt])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      fetchWarehouseReceipt(searchTerm.trim())
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setWarehouseReceipt(null)
    setError(null)
    setHasSearched(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && warehouseReceipt) {
      handleClear()
    }
  }

  const handleLogout = () => {
    router.push('/login')
  }

  const renderInput = (label: string, value: string, id: string) => (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
        {label}
      </label>
      <input
        className={`shadow appearance-none border rounded w-full py-2 px-3 ${hasSearched ? 'text-gray-700 bg-white' : 'text-gray-400 bg-gray-100'} leading-tight focus:outline-none focus:shadow-outline`}
        id={id}
        type="text"
        value={hasSearched ? value : ''}
        readOnly
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation handleLogout={handleLogout} clientName={clientName} />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Warehouse Receipt Viewer</h1>
        </div>
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Enter WR Number"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="pr-10"
              aria-label="Warehouse Receipt Number"
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {renderInput('WR Number', warehouseReceipt?.wrNumber || '', 'wrNumber')}
            {renderInput('Client', warehouseReceipt?.client || '', 'client')}
            {renderInput('PO#', warehouseReceipt?.po || '', 'po')}
            {renderInput('Carrier', warehouseReceipt?.carrier || '', 'carrier')}
            {renderInput('Tracking Number', warehouseReceipt?.trackingNumber || '', 'trackingNumber')}
            {renderInput('Received By', warehouseReceipt?.receivedBy || '', 'receivedBy')}
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={hasSearched && warehouseReceipt?.hazmat === 'yes'}
                readOnly
              />
              <span className="ml-2">Hazmat</span>
            </label>
          </div>
          {hasSearched && warehouseReceipt?.hazmat === 'yes' && (
            <div className="mb-4">
              {renderInput('Hazmat Code', warehouseReceipt.hazmatCode, 'hazmatCode')}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notes
            </label>
            <textarea
              className={`shadow appearance-none border rounded w-full py-2 px-3 ${hasSearched ? 'text-gray-700 bg-white' : 'text-gray-400 bg-gray-100'} leading-tight focus:outline-none focus:shadow-outline`}
              id="notes"
              value={hasSearched ? warehouseReceipt?.notes || '' : ''}
              readOnly
            />
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Box Details</h2>
            <table className="w-full border-separate border-spacing-4">
              <thead>
                <tr>
                  <th className="text-left pb-3 px-3 border-b">Number Of Items</th>
                  <th className="text-left pb-3 px-3 border-b">Type</th>
                  <th className="text-left pb-3 px-3 border-b">Length</th>
                  <th className="text-left pb-3 px-3 border-b">Width</th>
                  <th className="text-left pb-3 px-3 border-b">Height</th>
                  <th className="text-left pb-3 px-3 border-b">Weight</th>
                  <th className="text-left pb-3 px-3 border-b">Location</th>
                </tr>
              </thead>
              <tbody>
                {hasSearched && warehouseReceipt?.boxes ? (
                  warehouseReceipt.boxes.map((box, index) => (
                    <tr key={index}>
                      {Object.values(box).map((value, fieldIndex) => (
                        <td key={fieldIndex}>
                          <input
                            type="text"
                            className="w-full p-2 border-2 rounded focus:border-blue-500 focus:outline-none text-gray-700 bg-white"
                            value={value}
                            readOnly
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    {Array(7).fill(0).map((_, index) => (
                      <td key={index}>
                        <input
                          type="text"
                          className="w-full p-2 border-2 rounded focus:border-blue-500 focus:outline-none text-gray-400 bg-gray-100"
                          value=""
                          readOnly
                        />
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Order Images</h2>
            {hasSearched && warehouseReceipt?.images && warehouseReceipt.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {warehouseReceipt.images.map((imageUrl, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <button className="relative w-full pt-[100%] overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        <Image
                          src={imageUrl}
                          alt={`Warehouse Receipt Image ${index + 1}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-md transition-transform hover:scale-105"
                        />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={imageUrl}
                          alt={`Enlarged Warehouse Receipt Image ${index + 1}`}
                          width={1200}
                          height={1200}
                          style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                        />
                        <button
                          className="absolute top-2 right-2 bg-background/80 rounded-full p-2"
                          onClick={() => document.body.click()}
                          aria-label="Close enlarged image"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No images available for this warehouse receipt.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}