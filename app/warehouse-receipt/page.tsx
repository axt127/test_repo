'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Image src="/wex.png" alt="Wex Logo" width={50} height={50} />
            <span className="text-lg font-semibold">WMS Express</span>
          </div>
          <div className="flex justify-center space-x-4">
            <Link href="/homepage">
              <button className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Home</button>
            </Link>
            <Link href="/warehouse-receipt">
              <button className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Warehouse Receipt</button>
            </Link>
            <Link href="/purchase-order">
              <button className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Purchase Order</button>
            </Link>
            <Link href="/material-receipt">
              <button className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Material Receipt</button>
            </Link>
          </div>
          <div className="w-[50px]"></div>
        </div>
      </div>
    </nav>
  )
}

export default function WarehouseReceipt() {
  const router = useRouter()
  const [notification, setNotification] = useState<Notification | null>(null)
  const [formData, setFormData] = useState({
    wrNumber: 'WR-011',
    client: 'Marcel',
    carrier: 'FedEx',
    trackingNumber: '123456789ABC',
    receivedBy: 'John Doe',
    hazmat: 'yes',
    hazmatCode: 'HZ123',
    notes: 'Fragile package, handle with care.',
    po: 'PO987654',
  })

  const [tableData, setTableData] = useState([
    { number: '1', type: 'Pallet', length: '5', width: '5', height: '5', weight: '25', location: 'B1' },
    { number: '2', type: 'Crate', length: '10', width: '20', height: '15', weight: '200', location: 'B2' }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, hazmat: e.target.checked ? 'yes' : 'no' }))
  }

  const handleTableInputChange = (index: number, field: string, value: string) => {
    const newData = [...tableData]
    newData[index] = { ...newData[index], [field]: value }
    setTableData(newData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formattedData = [
      [
        formData.wrNumber,
        formData.client,
        formData.carrier,
        formData.trackingNumber,
        formData.receivedBy,
        formData.hazmat,
        formData.hazmatCode,
        formData.notes,
        formData.po
      ],
      ...tableData.map(item => [
        item.number,
        item.type,
        Number(item.length),
        Number(item.width),
        Number(item.height),
        item.location,
        Number(item.weight)
      ])
    ]
  
    try {
      console.log('Sending data:', JSON.stringify(formattedData, null, 2))
      const response = await axios.post(
        'https://i86t4jbtki.execute-api.us-east-1.amazonaws.com/prod/putWR',
        formattedData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      )
      console.log('Response:', response.data)
      if (response.status === 200 && response.data.success) {
        setNotification({ type: 'success', message: 'Warehouse receipt submitted successfully!' })
        setTimeout(() => {
          router.push('/homepage')
        }, 2000)
      } else {
        throw new Error('Unexpected response from server')
      }
    } catch (error) {
      console.error('Error submitting warehouse receipt:', error)
      let errorMessage = 'Failed to submit warehouse receipt. Please try again.'
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data)
        console.error('Response status:', error.response?.status)
        console.error('Response headers:', error.response?.headers)
        if (error.response) {
          errorMessage = `Server error: ${error.response.status}. ${error.response.data.message || ''}`
        } else if (error.request) {
          errorMessage = 'No response received from server. Please check your internet connection.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto p-4">
        {notification && (
          <div className={`mb-4 p-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {notification.message}
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Warehouse Receipt Form</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {/* Form fields remain unchanged */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="client">
                Client
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="client"
                type="text"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="po">
                PO#
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="po"
                type="text"
                name="po"
                value={formData.po}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="carrier">
                Carrier
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="carrier"
                type="text"
                name="carrier"
                value={formData.carrier}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="trackingNumber">
                Tracking Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="trackingNumber"
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.hazmat === 'yes'}
                onChange={handleCheckboxChange}
              />
              <span className="ml-2">Hazmat</span>
            </label>
          </div>
          {formData.hazmat === 'yes' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hazmatCode">
                Hazmat Code
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="hazmatCode"
                type="text"
                name="hazmatCode"
                value={formData.hazmatCode}
                onChange={handleInputChange}
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notes
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th>Number</th>
                <th>Type</th>
                <th>Length</th>
                <th>Width</th>
                <th>Height</th>
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
                        className="w-full p-1 border"
                        value={row[key as keyof typeof row]}
                        onChange={(e) => handleTableInputChange(index, key, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}