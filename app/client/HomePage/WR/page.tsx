'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

function Navigation() {
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
            <Link href="/client/HomePage/WR">
              <Button variant="outline">Warehouse Receipt</Button>
            </Link>
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
  const [searchTerm, setSearchTerm] = useState('')
  const [warehouseReceipt, setWarehouseReceipt] = useState<WarehouseReceipt | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      // In a real application, you would make an API call here
      // For this example, we'll use mock data
      const mockData: WarehouseReceipt = {
        wrNumber: searchTerm,
        client: 'Acme Corp',
        carrier: 'FedEx',
        trackingNumber: '1234567890',
        receivedBy: 'John Doe',
        hazmat: 'no',
        hazmatCode: '',
        notes: 'Handle with care',
        po: 'PO12345',
        boxes: [
          { number: '1', type: 'Box', length: '10', width: '10', height: '10', weight: '5', location: 'A1' },
          { number: '2', type: 'Pallet', length: '48', width: '40', height: '48', weight: '500', location: 'B2' },
        ],
      }
      setWarehouseReceipt(mockData)
    } catch (error) {
      console.error('Error fetching warehouse receipt:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline " + 
    (warehouseReceipt ? "text-gray-700 bg-white" : "text-gray-400 bg-gray-100")

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Warehouse Receipt Viewer</h1>
        </div>
        <div className="flex gap-4 mb-6">
          <Input
            type="text"
            placeholder="Enter WR Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="wrNumber">
                  WR Number
                </label>
                <input
                  className={inputClass}
                  id="wrNumber"
                  type="text"
                  value={warehouseReceipt?.wrNumber || ''}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="client">
                  Client
                </label>
                <input
                  className={inputClass}
                  id="client"
                  type="text"
                  value={warehouseReceipt?.client || ''}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="po">
                  PO#
                </label>
                <input
                  className={inputClass}
                  id="po"
                  type="text"
                  value={warehouseReceipt?.po || ''}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="carrier">
                  Carrier
                </label>
                <input
                  className={inputClass}
                  id="carrier"
                  type="text"
                  value={warehouseReceipt?.carrier || ''}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="trackingNumber">
                  Tracking Number
                </label>
                <input
                  className={inputClass}
                  id="trackingNumber"
                  type="text"
                  value={warehouseReceipt?.trackingNumber || ''}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="receivedBy">
                  Received By
                </label>
                <input
                  className={inputClass}
                  id="receivedBy"
                  type="text"
                  value={warehouseReceipt?.receivedBy || ''}
                  readOnly
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={warehouseReceipt?.hazmat === 'yes'}
                  readOnly
                />
                <span className="ml-2">Hazmat</span>
              </label>
            </div>
            {warehouseReceipt?.hazmat === 'yes' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hazmatCode">
                  Hazmat Code
                </label>
                <input
                  className={inputClass}
                  id="hazmatCode"
                  type="text"
                  value={warehouseReceipt?.hazmatCode || ''}
                  readOnly
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                Notes
              </label>
              <textarea
                className={inputClass}
                id="notes"
                value={warehouseReceipt?.notes || ''}
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
                  {warehouseReceipt?.boxes.map((box, index) => (
                    <tr key={index}>
                      {Object.values(box).map((value, fieldIndex) => (
                        <td key={fieldIndex}>
                          <input
                            type="text"
                            className={`w-full p-2 border-2 rounded focus:border-blue-500 focus:outline-none ${
                              warehouseReceipt ? "text-gray-700 bg-white" : "text-gray-400 bg-gray-100"
                            }`}
                            value={value}
                            readOnly
                          />
                        </td>
                      ))}
                    </tr>
                  )) || (
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