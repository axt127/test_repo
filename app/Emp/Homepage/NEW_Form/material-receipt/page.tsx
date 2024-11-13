'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Trash2, LogOut, Home, FileText, ShoppingCart, Package } from 'lucide-react'

function Navigation() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/login')
  }

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
              { href: "/Emp/Homepage", label: "Home", icon: Home },
              { href: "/Emp/Homepage/NEW_Form/warehouse-receipt", label: "Warehouse Receipt", icon: FileText },
              { href: "/Emp/Homepage/NEW_Form/purchase-order", label: "Purchase Order", icon: ShoppingCart },
              { href: "/Emp/Homepage/NEW_Form/material-receipt", label: "Material Receipt", icon: Package },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="flex flex-col items-center justify-center h-16 w-20">
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs text-center">{item.label}</span>
                </Button>
              </Link>
            ))}
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

export default function MaterialReceipt() {
  const router = useRouter()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTableInputChange = (index: number, field: string, value: string, isAdditional: boolean = false) => {
    if (isAdditional) {
      const newData = [...additionalTableData]
      newData[index] = { ...newData[index], [field]: value }
      setAdditionalTableData(newData)
    } else {
      const newData = [...tableData]
      newData[index] = { ...newData[index], [field]: value }
      setTableData(newData)
    }
  }

  const handleAddRow = (isAdditional: boolean = false) => {
    if (isAdditional) {
      setAdditionalTableData([...additionalTableData, { itemNumber: '', description: '', quantityOrder: '', quantityReceived: '', quantity: '' }])
    } else {
      setTableData([...tableData, { number: '', type: '', length: '', width: '', weight: '', location: '' }])
    }
  }

  const handleDeleteRow = (index: number, isAdditional: boolean = false) => {
    if (isAdditional) {
      setAdditionalTableData(additionalTableData.filter((_, i) => i !== index))
    } else {
      setTableData(tableData.filter((_, i) => i !== index))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: string, isAdditional: boolean = false) => {
    if (e.key === 'Tab' && !e.shiftKey && 
        index === (isAdditional ? additionalTableData.length : tableData.length) - 1 && 
        field === (isAdditional ? 'quantity' : 'location')) {
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Material Receipt Form</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-card shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="warehouseNumber">
                Warehouse Number
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="warehouseNumber"
                type="text"
                name="warehouseNumber"
                value={formData.warehouseNumber}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="client">
                Client
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="client"
                type="text"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="receiptDate">
                Receipt Date Received
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="receiptDate"
                type="date"
                name="receiptDate"
                value={formData.receiptDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="po">
                PO
              </label>
              <input
                className="w-full p-2 border rounded-md"
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
                <th className="text-left p-2">Number</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Length</th>
                <th className="text-left p-2">Width</th>
                <th className="text-left p-2">Weight</th>
                <th className="text-left p-2">Location</th>
                <th className="text-left p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).map((key) => (
                    <td key={key} className="p-2">
                      <input
                        type="text"
                        name={key}
                        className="w-full p-1 border rounded-md"
                        value={row[key as keyof TableRow]}
                        onChange={(e) => handleTableInputChange(index, key, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, key)}
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <Button
                      type="button"
                      onClick={() => handleDeleteRow(index)}
                      variant="destructive"
                      size="icon"
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
                <th className="text-left p-2">Item #</th>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Quantity Order</th>
                <th className="text-left p-2">Quantity Received</th>
                <th className="text-left p-2">Quantity</th>
                <th className="text-left p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {additionalTableData.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).map((key) => (
                    <td key={key} className="p-2">
                      <input
                        type="text"
                        name={`${key}Additional`}
                        className="w-full p-1 border rounded-md"
                        value={row[key as keyof AdditionalTableRow]}
                        onChange={(e) => handleTableInputChange(index, key, e.target.value, true)}
                        onKeyDown={(e) => handleKeyDown(e, index, key, true)}
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <Button
                      type="button"
                      onClick={() => handleDeleteRow(index, true)}
                      variant="destructive"
                      size="icon"
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