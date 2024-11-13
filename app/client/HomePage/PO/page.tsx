'use client'

import { useState, useEffect, useCallback, KeyboardEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Save, Plus, Trash2, Search, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import Link from 'next/link'
import Image from 'next/image'

interface Item {
  client: string
  poNumber: string
  lineNumber: number
  partNumber: string
  description: string
  quantity: number
  weight: number
  costPerUnit: number
  quantityReceived: number
}

interface POInfo {
  poNumber: string
  destination: string
  vendor: string
  shipVia: string
  notes: string
  client: string
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
            <Link href="/client/HomePage/WR">
              <Button variant="outline">Warehouse Receipt</Button>
            </Link>
            <Button variant="outline" onClick={onReset}>Purchase Order</Button>
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [poInfo, setPOInfo] = useState<POInfo | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const fetchPurchaseOrder = useCallback(async (poNumber: string) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const response = await axios.get(`https://kzxiymztu9.execute-api.us-east-1.amazonaws.com/prod/getPO?po=${poNumber}`)
      const data = response.data

      if (Array.isArray(data) && data.length >= 2) {
        const [poDetails, itemCount, ...itemsData] = data

        if (itemsData.length === 0) {
          throw new Error('No items found for this Purchase Order')
        }

        setPOInfo({
          poNumber: poDetails[0] || '',
          destination: poDetails[1] || '',
          vendor: poDetails[2] || '',
          shipVia: poDetails[3] || '',
          notes: poDetails[4] || '',
          client: poDetails[5] || ''
        })

        const formattedItems = itemsData.map(item => ({
          client: item[0] || '',
          poNumber: item[1] || '',
          lineNumber: item[2] || 0,
          partNumber: item[3] || '',
          description: item[4] || '',
          quantity: item[5] || 0,
          weight: item[6] || 0,
          costPerUnit: item[7] || 0,
          quantityReceived: item[8] || 0
        }))

        setItems(formattedItems)
      } else {
        throw new Error('No data found for this Purchase Order')
      }
    } catch (error) {
      console.error('Error fetching purchase order:', error)
      setError('Failed to fetch purchase order. Please try again.')
      setPOInfo(null)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const poNumber = searchParams.get('poNumber')
    if (poNumber) {
      setSearchTerm(poNumber)
      fetchPurchaseOrder(poNumber)
    }
  }, [searchParams, fetchPurchaseOrder])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      fetchPurchaseOrder(searchTerm.trim())
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setPOInfo(null)
    setItems([])
    setError(null)
    setHasSearched(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && poInfo) {
      handleClear()
    }
  }

  const handleReset = () => {
    handleClear()
  }

  const inputClass = "w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 " + 
    (hasSearched ? "text-gray-700 bg-white border-gray-300" : "text-gray-400 bg-gray-100 border-gray-200")

  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation onReset={handleReset} />
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Purchase Order Viewer</h1>
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Enter PO Number"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="pr-10"
              aria-label="Purchase Order Number"
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
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!error && hasSearched && items.length === 0 && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">No items found for this Purchase Order.</span>
          </div>
        )}

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
                  <TableHead className="w-[60px]">Line #</TableHead>
                  <TableHead className="w-[120px]">Part Number</TableHead>
                  <TableHead className="w-[400px]">Description</TableHead>
                  <TableHead className="w-[80px]">Quantity</TableHead>
                  <TableHead className="w-[100px]">Weight</TableHead>
                  <TableHead className="w-[100px]">Cost per Unit</TableHead>
                  <TableHead className="w-[100px]">Quantity Received</TableHead> {/* Added Quantity Received */}
                  <TableHead className="w-[100px]">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasSearched ? (
                  items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input className={inputClass} value={item.lineNumber} readOnly />
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
                        <Input className={`${inputClass} text-sm`} type="number" value={item.weight} readOnly />
                      </TableCell>
                      <TableCell>
                        <Input className={`${inputClass} text-sm`} type="number" value={item.costPerUnit} readOnly />
                      </TableCell>
                      <TableCell> {/* Added Quantity Received Cell */}
                        <Input 
                          className={`${inputClass} text-sm`} 
                          type="number" 
                          value={item.quantityReceived ?? 0} 
                          readOnly 
                        />
                      </TableCell>
                      <TableCell className="text-sm">${(item.quantity * item.costPerUnit).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4"> {/* Increased colSpan */}
                      No items to display. Please search for a Purchase Order.
                    </TableCell>
                  </TableRow>
                )}
                {hasSearched && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-right font-bold">Total:</TableCell> {/* Increased colSpan */}
                    <TableCell className="font-bold">${totalCost.toFixed(2)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}