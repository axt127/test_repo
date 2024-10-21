'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'

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

export default function MaterialReceipt() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    warehouseNumber: '',
    client: '',
    receiptDate: '',
    po: ''
  })

  const [tableData, setTableData] = useState([
    { number: '', type: '', length: '', width: '', weight: '', location: '' }
  ])

  const [additionalTableData, setAdditionalTableData] = useState([
    { itemNumber: '', description: '', quantityOrder: '', quantityReceived: '', quantity: '' }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTableInputChange = (index: number, field: string, value: string, isAdditional: boolean = false) => {
    const newData = isAdditional ? [...additionalTableData] : [...tableData]
    newData[index] = { ...newData[index], [field]: value }
    isAdditional ? setAdditionalTableData(newData) : setTableData(newData)
  }

  const handleAddRow = (isAdditional: boolean = false) => {
    const newRow = isAdditional
      ? { itemNumber: '', description: '', quantityOrder: '', quantityReceived: '', quantity: '' }
      : { number: '', type: '', length: '', width: '', weight: '', location: '' }
    isAdditional ? setAdditionalTableData([...additionalTableData, newRow]) : setTableData([...tableData, newRow])
  }

  const handleDeleteRow = (index: number, isAdditional: boolean = false) => {
    const newData = isAdditional ? additionalTableData.filter((_, i) => i !== index) : tableData.filter((_, i) => i !== index)
    isAdditional ? setAdditionalTableData(newData) : setTableData(newData)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: string, isAdditional: boolean = false) => {
    if (e.key === 'Tab' && !e.shiftKey && index === (isAdditional ? additionalTableData.length : tableData.length) - 1 && field === (isAdditional ? 'quantity' : 'location')) {
      e.preventDefault()
      handleAddRow(isAdditional)
      setTimeout(() => {
        const inputs = document.querySelectorAll(`input[name="${isAdditional ? 'itemNumber' : 'number'}"]`)
        const lastInput = inputs[inputs.length - 1] as HTMLInputElement
        lastInput?.focus()
      }, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form Data:', formData)
    console.log('Table Data:', tableData)
    console.log('Additional Table Data:', additionalTableData)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Material Receipt submitted successfully!')
    router.push('/homepage')
  }

  useEffect(() => {
    console.log('Table Data Updated:', tableData)
    console.log('Additional Table Data Updated:', additionalTableData)
  }, [tableData, additionalTableData])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Material Receipt Form</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="warehouseNumber">
                Warehouse Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="warehouseNumber"
                type="text"
                name="warehouseNumber"
                value={formData.warehouseNumber}
                onChange={handleInputChange}
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="receiptDate">
                Receipt Date Received
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="receiptDate"
                type="date"
                name="receiptDate"
                value={formData.receiptDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="po">
                PO
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
                <th>Action</th>
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
            <Button type="button" onClick={() => handleAddRow()}>
              Add Row
            </Button>
          </div>
          
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th>Item #</th>
                <th>Description</th>
                <th>Quantity Order</th>
                <th>Quantity Received</th>
                <th>Quantity</th>
                <th>Action</th>
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
                        className="w-full p-1 border"
                        value={row[key as keyof typeof row]}
                        onChange={(e) => handleTableInputChange(index, key, e.target.value, true)}
                        onKeyDown={(e) => handleKeyDown(e, index, key, true)}
                      />
                    </td>
                  ))}
                  <td>
                    <Button
                      type="button"
                      onClick={() => handleDeleteRow(index, true)}
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
            <Button type="button" onClick={() => handleAddRow(true)}>
              Add Row
            </Button>
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