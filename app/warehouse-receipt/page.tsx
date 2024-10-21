'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

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
              <Button variant="outline">Home</Button>
            </Link>
            <Link href="/warehouse-receipt">
              <Button variant="outline">Warehouse Receipt</Button>
            </Link>
            <Link href="/purchase-order">
              <Button variant="outline">Purchase Order</Button>
            </Link>
            <Link href="/material-receipt">
              <Button variant="outline">Material Receipt</Button>
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
  const [formData, setFormData] = useState({
    client: '',
    po: '',
    carrier: '',
    trackingNumber: '',
    hazmat: false,
    hazmatCode: '',
    notes: '',
  })

  const [tableData, setTableData] = useState([
    { number: '', type: '', length: '', width: '', height: '', weight: '', location: '' }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, hazmat: e.target.checked }))
  }

  const handleTableInputChange = (index: number, field: string, value: string) => {
    const newData = [...tableData]
    newData[index] = { ...newData[index], [field]: value }
    setTableData(newData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form Data:', formData)
    console.log('Table Data:', tableData)
    // Here you would typically send the data to your backend
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulating API call
    alert('Form submitted successfully!')
    router.push('/homepage') // Redirect to homepage after submission
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Warehouse Receipt Form</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
                checked={formData.hazmat}
                onChange={handleCheckboxChange}
              />
              <span className="ml-2">Hazmat</span>
            </label>
          </div>
          {formData.hazmat && (
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
            <Button type="submit">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}