'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface TableRow {
  number: string;
  type: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  location: string;
}

interface FormData {
  wrNumber: string;
  client: string;
  carrier: string;
  trackingNumber: string;
  receivedBy: string;
  hazmat: 'yes' | 'no';
  hazmatCode: string;
  notes: string;
  po: string;
}

const initialFormData: FormData = {
  wrNumber: '',
  client: '',
  carrier: '',
  trackingNumber: '',
  receivedBy: '',
  hazmat: 'no',
  hazmatCode: '',
  notes: '',
  po: '',
}

const initialTableData: TableRow[] = [
  { number: '', type: '', length: '', width: '', height: '', weight: '', location: '' }
]

function Navigation() {
  return (
    <nav className="bg-white shadow-sm mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Image src="/wex.png" alt="Wex Logo" width={50} height={50} />
            <span className="text-lg font-semibold">WMS Express</span>
          </div>
          <div className="flex justify-center space-x-4">
            <Link href="/client/HomePage">
              <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Home</span>
            </Link>
            <Link href="/client/HomePage/WR">
              <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Warehouse Receipt</span>
            </Link>
            <Link href="/client/HomePage/PO">
              <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Purchase Order</span>
            </Link>
            <Link href="/client/HomePage/MR">
              <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Material Receipt</span>
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [tableData, setTableData] = useState<TableRow[]>(initialTableData)
  const [lastSubmittedWR, setLastSubmittedWR] = useState<string>('')

  useEffect(() => {
    const storedLastWR = localStorage.getItem('lastSubmittedWR')
    if (storedLastWR) {
      setLastSubmittedWR(storedLastWR)
    }
    generateNewWRNumber(storedLastWR)
  }, [])

  const generateNewWRNumber = (lastWR: string | null) => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    
    let sequence = 1
    if (lastWR) {
      const [lastDate, lastSequence] = lastWR.split('-')
      if (lastDate === `${year}${month}${day}`) {
        sequence = parseInt(lastSequence, 10) + 1
      }
    }
    
    const newWRNumber = `${year}${month}${day}-${sequence.toString().padStart(3, '0')}`
    setFormData(prev => ({ ...prev, wrNumber: newWRNumber }))
  }

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, fieldIndex: number) => {
    if (e.key === 'Tab' && !e.shiftKey && rowIndex === tableData.length - 1 && fieldIndex === 6) {
      e.preventDefault()
      const newRow = { number: '', type: '', length: '', width: '', height: '', weight: '', location: '' }
      setTableData(prevData => [...prevData, newRow])
      
      // Use setTimeout to ensure the new row is rendered before focusing
      setTimeout(() => {
        const newRowFirstInput = document.querySelector(`tr:nth-child(${rowIndex + 2}) td:first-child input`) as HTMLInputElement
        if (newRowFirstInput) {
          newRowFirstInput.focus()
        }
      }, 0)
    }
  }


  const resetForm = () => {
    setFormData({ ...initialFormData, wrNumber: formData.wrNumber })
    setTableData(initialTableData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setNotification(null)
    
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
      const response = await axios.post(
        'https://i86t4jbtki.execute-api.us-east-1.amazonaws.com/prod/putWR',
        formattedData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('API Response:', response.data)

      if (response.status === 200) {
        setNotification({ type: 'success', message: 'Warehouse receipt submitted successfully!' })
        setLastSubmittedWR(formData.wrNumber)
        localStorage.setItem('lastSubmittedWR', formData.wrNumber)
        generateNewWRNumber(formData.wrNumber)
        resetForm()
        } else {
        throw new Error('Unexpected response from server')
      }
    } catch (error) {
      console.error('Error submitting warehouse receipt:', error)
      let errorMessage = 'Failed to submit warehouse receipt. Please try again.'
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Server error: ${error.response.status}. ${error.response.data.message || ''}`
        } else if (error.request) {
          errorMessage = 'No response received from server. Please check your internet connection.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      setNotification({ type: 'error', message: errorMessage })
    } finally {
      setIsSubmitting(false)
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
          {lastSubmittedWR && (
            <p className="text-sm text-gray-600">Last submitted WR: {lastSubmittedWR}</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="wrNumber">
                WR Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="wrNumber"
                type="text"
                name="wrNumber"
                value={formData.wrNumber}
                readOnly
              />
            </div>
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
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="receivedBy">
                Received By
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="receivedBy"
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
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
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Box Details</h2>
              <Button 
                onClick={() => setTableData(prevData => [...prevData, { number: '', type: '', length: '', width: '', height: '', weight: '', location: '' }])} 
                type="button"
              >
                Add Row
              </Button>
            </div>
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
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.keys(row).map((key, fieldIndex) => (
                      <td key={key}>
                        <input
                          type="text"
                          className="w-full p-2 border-2 rounded focus:border-blue-500 focus:outline-none"
                          value={row[key as keyof typeof row]}
                          onChange={(e) => handleTableInputChange(rowIndex, key, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, fieldIndex)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 
 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}