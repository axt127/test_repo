'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, LogOut, Home, FileText, ShoppingCart, Package } from 'lucide-react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
// import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Item {
  itemNumber: string
  partNumber: string
  description: string
  quantity: number
  costPerUnit: number
}

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

export default function PurchaseOrder() {
  const [poInfo, setPOInfo] = useState({
    poNumber: '',
    client: '',
    destination: '',
    vendor: '',
    shipVia: '',
    date: '',
    notes: '',
  })

  const [items, setItems] = useState<Item[]>([
    { itemNumber: '1', partNumber: '', description: '', quantity: 0, costPerUnit: 0 }
  ])

  const [clients, setClients] = useState<string[]>([])
  const [destinations, setDestinations] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await axios.get('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/all-clients')
      setClients(response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to fetch clients. Please try again.')
    }
  }

  const fetchDestinations = async (client: string) => {
    try {
      const response = await axios.get(`https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/getalldestinationsforclient?client=${client}`)
      setDestinations(response.data)
    } catch (error) {
      console.error('Error fetching destinations:', error)
      toast.error('Failed to fetch destinations. Please try again.')
    }
  }

  const handlePOInfoChange = (name: string, value: string) => {
    setPOInfo({ ...poInfo, [name]: value })
    if (name === 'client') {
      fetchDestinations(value)
    }
  }

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [e.target.name]: e.target.value }
    setItems(newItems)
  }

  const addItem = () => {
    const newItemNumber = (items.length + 1).toString()
    setItems([...items, { itemNumber: newItemNumber, partNumber: '', description: '', quantity: 0, costPerUnit: 0 }])
    toast.info('New item added to the purchase order.')
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      itemNumber: (i + 1).toString()
    }));
    setItems(newItems);
    toast.warn('Item removed from the purchase order.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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
      const response = await axios.post('https://kzxiymztu9.execute-api.us-east-1.amazonaws.com/prod/PutNewPO', poData)
      console.log('API Response:', response.data)
      toast.success('Purchase Order submitted successfully')

      // Reset form after successful submission
      setPOInfo({
        poNumber: '',
        client: '',
        destination: '',
        vendor: '',
        shipVia: '',
        date: '',
        notes: '',
      })
      setItems([{ itemNumber: '1', partNumber: '', description: '', quantity: 0, costPerUnit: 0 }])
    } catch (error) {
      console.error('Error submitting Purchase Order:', error)
      toast.error('Failed to submit Purchase Order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Purchase Order Form</h1>
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
                <Select onValueChange={(value) => handlePOInfoChange('client', value)}>
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
                <Select onValueChange={(value) => handlePOInfoChange('destination', value)} disabled={!poInfo.client}>
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
          {isSubmitting ? 'Submitting...' : 'Save Purchase Order'}
        </Button>
      </form>
      <ToastContainer position="bottom-right" />
    </div>
  )
}