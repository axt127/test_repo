'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, LogOut, Home, FileText, ShoppingCart, Package, Edit, Search } from 'lucide-react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Define interfaces for type checking
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

// Navigation component
function Navigation() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <nav className="bg-primary text-primary-foreground shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and company name */}
          <div className="flex items-center space-x-2">
            <Image src="/wex.png" alt="Wex Logo" width={50} height={50} className="rounded-full" />
            <span className="text-xl font-bold">WMS Xpress</span>
          </div>
          {/* Navigation links */}
          <div className="flex justify-center space-x-1">
            {[
              { href: "/Emp/Homepage", label: "Home", icon: Home },
              { href: "/Emp/Homepage/NEW_Form/warehouse-receipt", label: "Warehouse Receipt", icon: FileText },
              { href: "/Emp/Homepage/NEW_Form/purchase-order", label: "Purchase Order", icon: ShoppingCart },
              { href: "/Emp/Homepage/NEW_Form/material-receipt", label: "Material Receipt", icon: Package },
              { href: "/Emp/Homepage/EDIT_FORM/edit-warehouse", label: "Edit Warehouse", icon: Edit },
              { href: "/Emp/Homepage/EDIT_FORM/edit-purchase-order", label: "Edit PO", icon: Edit },
              { href: "/Emp/Homepage/EDIT_FORM/view_po", label: "View PO", icon: Edit },
              { href: "/Emp/Homepage/EDIT_FORM/view_mr", label: "View MR", icon: Edit },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="flex flex-col items-center justify-center h-16 w-20">
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs text-center">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
          {/* Logout button */}
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

// Main EditPurchaseOrder component
export default function EditPurchaseOrder() {
  // State variables
  const [searchQuery, setSearchQuery] = useState('')
  const [allPoNumbers, setAllPoNumbers] = useState<string[]>([])
  const [filteredPoNumbers, setFilteredPoNumbers] = useState<string[]>([])
  const [poInfo, setPOInfo] = useState<POInfo>({
    poNumber: '',
    client: '',
    destination: '',
    vendor: '',
    shipVia: '',
    date: '',
    notes: '',
  })
  const [items, setItems] = useState<Item[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [destinations, setDestinations] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Fetch all PO numbers and clients on component mount
  useEffect(() => {
    fetchAllPoNumbers()
    fetchClients()
  }, [])

  // Filter PO numbers based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = allPoNumbers.filter(id => id.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredPoNumbers(filtered)
    } else {
      setFilteredPoNumbers([])
    }
  }, [searchQuery, allPoNumbers])

  // Fetch all PO numbers
  const fetchAllPoNumbers = async () => {
    try {
      const response = await axios.get('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/all-POs')
      if (response.data && Array.isArray(response.data)) {
        setAllPoNumbers(response.data)
      }
    } catch (error) {
      console.error('Error fetching PO numbers:', error)
      toast.error('Failed to fetch PO numbers. Please try again.')
    }
  }

  // Fetch all clients
  const fetchClients = async () => {
    try {
      const response = await axios.get('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/all-clients')
      setClients(response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to fetch clients. Please try again.')
    }
  }

  // Fetch destinations for a specific client
  const fetchDestinations = async (client: string) => {
    try {
      const response = await axios.get(`https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/getalldestinationsforclient?client=${client}`)
      setDestinations(response.data)
    } catch (error) {
      console.error('Error fetching destinations:', error)
      toast.error('Failed to fetch destinations. Please try again.')
    }
  }

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setFilteredPoNumbers([]) // Clear the dropdown
    if (!allPoNumbers.includes(searchQuery)) {
      toast.error('Invalid PO number. Please select from the list.')
      return
    }
    setIsSearching(true)
    try {
      const response = await axios.get(`https://kzxiymztu9.execute-api.us-east-1.amazonaws.com/prod/getPO?po=${searchQuery}`)
      if (response.status === 200 && response.data) {
        const [generalInfo, itemCount, ...itemsData] = response.data
        // Set PO information
        setPOInfo({
          poNumber: generalInfo[0],
          destination: generalInfo[1],
          vendor: generalInfo[2],
          shipVia: generalInfo[3],
          notes: generalInfo[4],
          client: generalInfo[5],
          date: new Date().toISOString().split('T')[0], // Set to current date as it's not provided in the API response
        })
        // Set items
        setItems(itemsData.map((item: any[], index: number) => ({
          itemNumber: (index + 1).toString(),
          partNumber: item[3],
          description: item[4],
          quantity: item[5],
          costPerUnit: item[6],
        })))
        fetchDestinations(generalInfo[5])
      }
    } catch (error) {
      console.error('Error fetching PO data:', error)
      toast.error('Failed to fetch PO data. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle changes in PO information
  const handlePOInfoChange = (name: string, value: string) => {
    setPOInfo({ ...poInfo, [name]: value })
    if (name === 'client') {
      fetchDestinations(value)
    }
  }

  // Handle changes in item details
  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [e.target.name]: e.target.value }
    setItems(newItems)
  }

  // Add a new item to the PO
  const addItem = () => {
    const newItemNumber = (items.length + 1).toString()
    setItems([...items, { itemNumber: newItemNumber, partNumber: '', description: '', quantity: 0, costPerUnit: 0 }])
    toast.info('New item added to the purchase order.')
  }

  // Remove an item from the PO
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      itemNumber: (i + 1).toString()
    }));
    setItems(newItems);
    toast.warn('Item removed from the purchase order.')
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Prepare data for API
    const poData = [
      [
        poInfo.poNumber,
        poInfo.destination,
        poInfo.vendor,
        poInfo.shipVia,
        poInfo.notes,
        poInfo.client
      ],
      ...items.map(item => [
        poInfo.client,
        poInfo.poNumber,
        parseInt(item.itemNumber),
        item.partNumber,
        item.description,
        parseInt(item.quantity.toString()),
        parseFloat(item.costPerUnit.toString())
      ])
    ]

    try {
      const response = await axios.put('https://kzxiymztu9.execute-api.us-east-1.amazonaws.com/prod/UpdatePO', poData)
      console.log('API Response:', response.data)
      toast.success('Purchase Order updated successfully')
    } catch (error) {
      console.error('Error updating Purchase Order:', error)
      toast.error('Failed to update Purchase Order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle key press events for adding new items
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Tab' && !e.shiftKey && index === items.length - 1) {
      e.preventDefault()
      addItem()
      setTimeout(() => {
        const newRowInputs = document.querySelectorAll(`input[name="partNumber"]`)
        const lastInput = newRowInputs[newRowInputs.length - 1] as HTMLInputElement
        lastInput?.focus()
      }, 0)
    }
  }

  // Calculate total cost of all items
  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Edit Purchase Order</h1>
        
        {/* Search form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Purchase Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Enter Purchase Order Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                {/* Dropdown for filtered PO numbers */}
                {filteredPoNumbers.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredPoNumbers.map((id) => (
                      <li
                        key={id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSearchQuery(id)
                          setFilteredPoNumbers([])
                        }}
                      >
                        {id}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Display PO form if a PO is selected */}
        {poInfo.poNumber && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Purchase Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Order Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="poNumber">PO Number</Label>
                    <Input id="poNumber" name="poNumber" value={poInfo.poNumber} onChange={(e) => handlePOInfoChange('poNumber', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select onValueChange={(value) => handlePOInfoChange('client', value)} value={poInfo.client}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-[400px]">
                          {clients.map((client) => (
                            <SelectItem key={client} value={client}>{client}</SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Select onValueChange={(value) => handlePOInfoChange('destination', value)} value={poInfo.destination}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-[400px]">
                          {destinations.map((destination) => (
                            <SelectItem key={destination} value={destination}>{destination}</SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input id="vendor" name="vendor" value={poInfo.vendor} onChange={(e) => handlePOInfoChange('vendor', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipVia">Ship Via</Label>
                    <Input id="shipVia" name="shipVia" value={poInfo.shipVia} onChange={(e) => handlePOInfoChange('shipVia', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" value={poInfo.date} onChange={(e) => handlePOInfoChange('date', e.target.value)} required />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" value={poInfo.notes} onChange={(e) => handlePOInfoChange('notes', e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
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
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            className="w-full"
                            name="itemNumber"
                            value={item.itemNumber}
                            onChange={(e) => handleItemChange(index, e)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-full"
                            name="partNumber"
                            value={item.partNumber}
                            onChange={(e) => handleItemChange(index, e)}
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            className="w-full min-h-[80px] text-sm"
                            name="description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, e)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-full text-sm"
                            name="quantity"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-full text-sm"
                            name="costPerUnit"
                            type="number"
                            value={item.costPerUnit}
                            onChange={(e) => handleItemChange(index, e)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                        </TableCell>
                        <TableCell className="text-sm">${(item.quantity * item.costPerUnit).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            tabIndex={-1}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-bold">Total:</TableCell>
                      <TableCell className="font-bold">${totalCost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" /> 
              {isSubmitting ? 'Updating...' : 'Update Purchase Order'}
            </Button>
          </form>
        )}
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}

