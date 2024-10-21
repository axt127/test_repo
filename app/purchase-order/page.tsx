'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Trash2, Upload } from 'lucide-react'

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

export default function PurchaseOrder() {
  const router = useRouter()
  const [savedData, setSavedData] = useState<any>(null)
  const [formData, setFormData] = useState({
    POnumber: '',
    po: '',
    orderDate: '',
    carrier: '',
    destination: '',
    shipmentType: '',
    notes: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [tableData, setTableData] = useState([
    { itemNumber: '', partNumber: '', description: '', quantity: '', costPerUnit: '', totalCost: '' }
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTableInputChange = (index: number, field: string, value: string) => {
    const newData = [...tableData]
    newData[index] = { ...newData[index], [field]: value }
    
    if (field === 'costPerUnit') {
      const costPerUnit = parseFloat(value) || 0
      newData[index].totalCost = costPerUnit.toFixed(2)
    }
    
    setTableData([...newData])
  }

  const handleAddRow = () => {
    setTableData([...tableData, { itemNumber: '', partNumber: '', description: '', quantity: '', costPerUnit: '', totalCost: '' }])
  }

  const handleDeleteRow = (index: number) => {
    const newData = tableData.filter((_, i) => i !== index)
    setTableData(newData)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: string) => {
    if (e.key === 'Tab' && !e.shiftKey && index === tableData.length - 1 && field === 'costPerUnit') {
      e.preventDefault()
      handleAddRow()
      setTimeout(() => {
        const inputs = document.querySelectorAll('input[name="itemNumber"]')
        const lastInput = inputs[inputs.length - 1] as HTMLInputElement
        lastInput?.focus()
      }, 0)
    }
  }

  const calculateTotalCost = () => {
    return tableData.reduce((total, row) => {
      const costPerUnit = parseFloat(row.costPerUnit) || 0
      return total + costPerUnit
    }, 0).toFixed(2)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form Data:', formData)
    console.log('Table Data:', tableData)
    console.log('Photo:', photo)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Form submitted successfully!')
    router.push('/homepage')
  }

  useEffect(() => {
    console.log('Table Data Updated:', tableData)
  }, [tableData])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Purchase Order Form</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="POnumber">
                PO Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="POnumber"
                type="text"
                name="POnumber"
                value={formData.POnumber}
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orderDate">
                Order Date
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="orderDate"
                type="date"
                name="orderDate"
                value={formData.orderDate}
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destination">
                Destination
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="destination"
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shipmentType">
                Shipment Type
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="shipmentType"
                type="text"
                name="shipmentType"
                value={formData.shipmentType}
                onChange={handleInputChange}
              />
            </div>
          </div>
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
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Add Photo
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              {photoPreview && (
                <Button
                  type="button"
                  onClick={handleRemovePhoto}
                  variant="destructive"
                  className="flex items-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Photo
                </Button>
              )}
            </div>
            {photoPreview && (
              <div className="mt-2">
                <Image src={photoPreview} alt="Uploaded photo" width={200} height={200} className="object-cover" />
              </div>
            )}
          </div>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th>Item #</th>
                <th>Part #</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Cost Per Unit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).filter(key => key !== 'totalCost').map((key) => (
                    <td key={key}>
                      <input
                        type="text"
                        name={key}
                        className="w-full p-1 border"
                        value={row[key as keyof typeof row]}
                        onChange={(e) => handleTableInputChange(index, key, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, key)}
                      />
                    </td>
                  ))}
                  <td>
                    <Button
                      type="button"
                      onClick={() => handleDeleteRow(index)}
                      className="p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mb-4">
            <Button type="button" onClick={handleAddRow}>
              Add Row
            </Button>
            <div className="font-bold">
              Total Cost: ${calculateTotalCost()}
            </div>
          </div>
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