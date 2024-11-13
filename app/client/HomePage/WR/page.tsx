'use client'

import { useState, useEffect, useCallback, KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'

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
}

function Navigation({ onReset }: { onReset: () => void }) {
  return (
    <nav className="bg-white shadow-sm mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Image src="/wex.png" alt="Wex Logo" width={50} height={50} />
            <span className="text-lg font-semibold">WMS Xpress</span>
          </div>
          <div className="flex justify-center space-x-4">
            <Link href="/client/HomePage">
              <Button variant="outline">Home</Button>
            </Link>
            <Button variant="outline" onClick={onReset}>Warehouse Receipt</Button>
            <Link href="/client/HomePage/PO">
              <Button variant="outline">Purchase Order</Button>
            </Link>
            <Link href="/client/HomePage/MR">
              <Button variant="outline">Material Receipt</Button>
            </Link>
          </div>
          <div className="w-[50px]"></div>
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

  const fetchWarehouseReceipt = useCallback(async (wrNumber: string) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const response = await axios.get(`https://qwlotlnq36.execute-api.us-east-1.amazonaws.com/prod/GetWR?wr_id=${wrNumber}`)
      const data = response.data

      if (Array.isArray(data) && data.length >= 2) {
        const [wrDetails, , ...boxesData] = data

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
            weight: box[6] || '',  // Changed from box[5] to box[6]
            location: box[5] || '' // Changed from box[6] to box[5]
          }))
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

  const handleReset = () => {
    setSearchTerm('')
    setWarehouseReceipt(null)
    setError(null)
    setHasSearched(false)
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
    <div className="min-h-screen bg-gray-100">
      <Navigation onReset={handleReset} />
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
                  <th className="text-left pb-3 px-3 border-b">Number</th>
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
        </div>
      </div>
    </div>
  )
}