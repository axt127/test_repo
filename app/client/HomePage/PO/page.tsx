'use client'

import { useState } from 'react'
import { Save, Plus, Trash2, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import Link from 'next/link'
import Image from 'next/image'

interface Item {
  itemNumber: string
  partNumber: string
  description: string
  quantity: number
  costPerUnit: number
}

interface POInfo {
  poNumber: string
  client: string
  destination: string
  vendor: string
  shipVia: string
  date: string
  notes: string
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

export default function PurchaseOrderViewer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [poInfo, setPOInfo] = useState<POInfo | null>(null)
  const [items, setItems] = useState<Item[]>([
    { itemNumber: '1', partNumber: '', description: '', quantity: 0, costPerUnit: 0 }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      // Simulating API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockPOInfo: POInfo = {
        poNumber: searchTerm,
        client: 'Acme Corp',
        destination: 'Warehouse A',
        vendor: 'Supplier XYZ',
        shipVia: 'FedEx',
        date: '2023-07-01',
        notes: 'Urgent delivery required',
      }

      const mockItems: Item[] = [
        { itemNumber: '1', partNumber: 'ABC123', description: 'Widget A', quantity: 100, costPerUnit: 10 },
        { itemNumber: '2', partNumber: 'DEF456', description: 'Gadget B', quantity: 50, costPerUnit: 20 },
      ]

      setPOInfo(mockPOInfo)
      setItems(mockItems)
    } catch (error) {
      console.error('Error fetching purchase order:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false)
    }
  }

  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0)

  const inputClass = "w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 " + 
    (poInfo ? "text-gray-700 bg-white border-gray-300" : "text-gray-400 bg-gray-100 border-gray-200")

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Purchase Order Viewer</h1>
        <div className="flex gap-4 mb-6">
          <Input
            type="text"
            placeholder="Enter PO Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poNumber">PO Number</Label>
                <Input id="poNumber" name="poNumber" value={poInfo?.poNumber || ''} className={inputClass} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input id="client" name="client" value={poInfo?.client || ''} className={inputClass} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" name="destination" value={poInfo?.destination || ''} className={inputClass} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input id="vendor" name="vendor" value={poInfo?.vendor || ''} className={inputClass} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipVia">Ship Via</Label>
                <Input id="shipVia" name="shipVia" value={poInfo?.shipVia || ''} className={inputClass} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" value={poInfo?.date || ''} className={inputClass} readOnly />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={poInfo?.notes || ''} className={inputClass} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Item #</TableHead>
                  <TableHead className="w-[120px]">Part Number</TableHead>
                  <TableHead className="w-[400px]">Description</TableHead>
                  <TableHead className="w-[80px]">Quantity</TableHead>
                  <TableHead className="w-[100px]">Cost per Unit</TableHead>
                  <TableHead className="w-[100px]">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input className={inputClass} value={item.itemNumber} readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className={inputClass} value={item.partNumber} readOnly />
                    </TableCell>
                    <TableCell>
                      <Textarea className={`${inputClass} min-h-[80px] text-sm`} value={item.description} readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className={`${inputClass} text-sm`} type="number" value={item.quantity} readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className={`${inputClass} text-sm`} type="number" value={item.costPerUnit} readOnly />
                    </TableCell>
                    <TableCell className="text-sm">${(item.quantity * item.costPerUnit).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-bold">Total:</TableCell>
                  <TableCell className="font-bold">${totalCost.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}