'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from 'lucide-react'

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

interface TableRow {
  number: string;
  type: string;
  length: string;
  width: string;
  weight: string;
  location: string;
}

interface AdditionalTableRow {
  itemNumber: string;
  description: string;
  quantityOrder: string;
  quantityReceived: string;
  quantity: string;
}

export default function MaterialReceiptViewer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    warehouseNumber: '',
    client: '',
    receiptDate: '',
    po: ''
  })

  const [tableData, setTableData] = useState<TableRow[]>([
    { number: '', type: '', length: '', width: '', weight: '', location: '' }
  ])

  const [additionalTableData, setAdditionalTableData] = useState<AdditionalTableRow[]>([
    { itemNumber: '', description: '', quantityOrder: '', quantityReceived: '', quantity: '' }
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      // Simulating API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockData = {
        formData: {
          warehouseNumber: 'WH001',
          client: 'Acme Corp',
          receiptDate: '2023-06-30',
          po: 'PO12345'
        },
        tableData: [
          { number: '1', type: 'Box', length: '10', width: '10', weight: '5', location: 'A1' },
          { number: '2', type: 'Pallet', length: '48', width: '40', weight: '500', location: 'B2' }
        ],
        additionalTableData: [
          { itemNumber: 'ITEM001', description: 'Widget A', quantityOrder: '100', quantityReceived: '95', quantity: '95' },
          { itemNumber: 'ITEM002', description: 'Gadget B', quantityOrder: '50', quantityReceived: '50', quantity: '50' }
        ]
      }

      setFormData(mockData.formData)
      setTableData(mockData.tableData)
      setAdditionalTableData(mockData.additionalTableData)
      setDataLoaded(true)
    } catch (error) {
      console.error('Error fetching material receipt:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline " + 
    (dataLoaded ? "text-gray-700 bg-white" : "text-gray-400 bg-gray-100")

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Material Receipt Viewer</h1>
        </div>
        <div className="flex gap-4 mb-6">
          <Input
            type="text"
            placeholder="Enter Material Receipt Number"
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="warehouseNumber">
                Warehouse Number
              </label>
              <input
                className={inputClass}
                id="warehouseNumber"
                type="text"
                name="warehouseNumber"
                value={formData.warehouseNumber}
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
                name="client"
                value={formData.client}
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="receiptDate">
                Receipt Date Received
              </label>
              <input
                className={inputClass}
                id="receiptDate"
                type="date"
                name="receiptDate"
                value={formData.receiptDate}
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="po">
                PO
              </label>
              <input
                className={inputClass}
                id="po"
                type="text"
                name="po"
                value={formData.po}
                readOnly
              />
            </div>
          </div>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th>Number</th>
                <th>Type</th>
                <th>Length</th>
                <th>Width</th>
                <th>Weight</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).map((key) => (
                    <td key={key}>
                      <input
                        type="text"
                        name={key}
                        className={`w-full p-1 border ${inputClass}`}
                        value={row[key as keyof TableRow]}
                        readOnly
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th>Item #</th>
                <th>Description</th>
                <th>Quantity Order</th>
                <th>Quantity Received</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {additionalTableData.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).map((key) => (
                    <td key={key}>
                      <input
                        type="text"
                        name={`${key}Additional`}
                        className={`w-full p-1 border ${inputClass}`}
                        value={row[key as keyof AdditionalTableRow]}
                        readOnly
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}