'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Home, FileText, ShoppingCart, Package, Edit, Search } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

interface BoxDetails {
  number: string;
  type: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  location: string;
}

interface ItemDetails {
  itemNumber: string;
  partId: string;
  description: string;
  quantityOrder: string;
  quantityReceived: string;
  quantity: string;
  boxId: string;
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
              { href: "/Emp/Homepage/EDIT_FORM/edit-warehouse", label: "Edit Warehouse", icon: Edit },
              { href: "/Emp/Homepage/EDIT_FORM/edit-purchase-order", label: "Edit PO", icon: Edit },
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

export default function ViewMaterialReceipt() {
  const [searchQuery, setSearchQuery] = useState('')
  const [allMRNumbers, setAllMRNumbers] = useState<string[]>([])
  const [filteredMRNumbers, setFilteredMRNumbers] = useState<string[]>([])
  const [mrInfo, setMRInfo] = useState({
    warehouseNumber: '',
    client: '',
    receiptDate: '',
    po: '',
    carrier: '',
    tracking: ''
  })
  const [boxDetails, setBoxDetails] = useState<BoxDetails[]>([])
  const [itemDetails, setItemDetails] = useState<ItemDetails[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchAllMRNumbers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = allMRNumbers.filter(id => id.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredMRNumbers(filtered)
    } else {
      setFilteredMRNumbers([])
    }
  }, [searchQuery, allMRNumbers])

  const fetchAllMRNumbers = async () => {
    try {
      const response = await axios.get('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/getallMR')
      if (response.data && Array.isArray(response.data)) {
        setAllMRNumbers(response.data)
      }
    } catch (error) {
      console.error('Error fetching MR numbers:', error)
      toast.error('Failed to fetch MR numbers. Please try again.')
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setFilteredMRNumbers([]) // Clear the dropdown
    if (!allMRNumbers.includes(searchQuery)) {
      toast.error('Invalid MR number. Please select from the list.')
      return
    }
    setIsSearching(true)
    try {
      // Fetch MR data
      const mrResponse = await axios.get(`https://4n2oiwjde1.execute-api.us-east-1.amazonaws.com/prod/getMR?wr_id=${searchQuery}`)
      if (mrResponse.status === 200 && mrResponse.data && Array.isArray(mrResponse.data) && mrResponse.data.length > 1) {
        const [mrInfo, itemCount, ...mrItems] = mrResponse.data
        
        // Fetch WR data
        const wrResponse = await axios.get(`https://qwlotlnq36.execute-api.us-east-1.amazonaws.com/prod/GetWR?wr_id=${searchQuery}`)
        if (wrResponse.status === 200 && wrResponse.data && Array.isArray(wrResponse.data) && wrResponse.data.length > 1) {
          const [wrInfo, boxCountArray, ...wrItems] = wrResponse.data
          
          if (Array.isArray(wrInfo) && wrInfo.length >= 10 && Array.isArray(boxCountArray) && boxCountArray.length > 0) {
            setMRInfo({
              warehouseNumber: wrInfo[0] || '',
              client: wrInfo[1] || '',
              receiptDate: wrInfo[4] ? new Date(wrInfo[4]).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
              po: wrInfo[9] || '',
              carrier: wrInfo[2] || '',
              tracking: wrInfo[3] || ''
            })

            // Update box details using WR data
            const numBoxes = parseInt(boxCountArray[0]) || 0
            setBoxDetails(wrItems.slice(0, numBoxes).map((box: any) => ({
              number: Array.isArray(box) && box[0] ? box[0] : '',
              type: Array.isArray(box) && box[1] ? box[1] : '',
              length: Array.isArray(box) && box[2] ? box[2].toString() : '',
              width: Array.isArray(box) && box[3] ? box[3].toString() : '',
              height: Array.isArray(box) && box[4] ? box[4].toString() : '',
              weight: Array.isArray(box) && box[6] ? box[6].toString() : '',
              location: Array.isArray(box) && box[5] ? box[5] : ''
            })))

            // Fetch PO data
            if (wrInfo[9]) {
              const poResponse = await axios.get(`https://kzxiymztu9.execute-api.us-east-1.amazonaws.com/prod/getPO?po=${wrInfo[9]}`)
              if (poResponse.status === 200 && poResponse.data && Array.isArray(poResponse.data) && poResponse.data.length > 2) {
                const [poInfo, poItemCount, ...poItems] = poResponse.data
                
                setItemDetails(poItems.map((poItem: any, index: number) => {
                  const mrItem = mrItems[index] || []
                  return {
                    itemNumber: Array.isArray(poItem) && poItem[2] ? poItem[2].toString() : '',
                    partId: Array.isArray(poItem) && poItem[3] ? poItem[3] : '',
                    description: Array.isArray(poItem) && poItem[4] ? poItem[4] : '',
                    quantityOrder: Array.isArray(poItem) && poItem[5] ? poItem[5].toString() : '',
                    quantityReceived: Array.isArray(mrItem) && mrItem[4] ? mrItem[4].toString() : '',
                    quantity: Array.isArray(mrItem) && mrItem[5] ? mrItem[5].toString() : '',
                    boxId: Array.isArray(mrItem) && mrItem[6] ? mrItem[6] : ''
                  }
                }))
              }
            }
          } else {
            throw new Error('Invalid WR data structure')
          }
        } else {
          throw new Error('Invalid WR response')
        }
      } else {
        throw new Error('Invalid MR response')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data. Please try again.')
      setBoxDetails([])
      setItemDetails([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-primary mb-6">View Material Receipt</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Material Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Enter Material Receipt Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                {filteredMRNumbers.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredMRNumbers.map((id) => (
                      <li
                        key={id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSearchQuery(id)
                          setFilteredMRNumbers([])
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

        {mrInfo.warehouseNumber && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Receipt Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouseNumber">Warehouse Number</Label>
                    <Input id="warehouseNumber" value={mrInfo.warehouseNumber} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Input id="client" value={mrInfo.client} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiptDate">Receipt Date</Label>
                    <Input id="receiptDate" value={mrInfo.receiptDate} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="po">PO</Label>
                    <Input id="po" value={mrInfo.po} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carrier">Carrier</Label>
                    <Input id="carrier" value={mrInfo.carrier} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tracking">Tracking #</Label>
                    <Input id="tracking" value={mrInfo.tracking} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Box Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Length</TableHead>
                      <TableHead>Width</TableHead>
                      <TableHead>Height</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boxDetails.map((box, index) => (
                      <TableRow key={index}>
                        <TableCell>{box.number}</TableCell>
                        <TableCell>{box.type}</TableCell>
                        <TableCell>{box.length}</TableCell>
                        <TableCell>{box.width}</TableCell>
                        <TableCell>{box.height}</TableCell>
                        <TableCell>{box.weight}</TableCell>
                        <TableCell>{box.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item #</TableHead>
                      <TableHead>Part ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity Order</TableHead>
                      <TableHead>Quantity Received</TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead>Box ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemDetails.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.itemNumber}</TableCell>
                        <TableCell>{item.partId}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantityOrder}</TableCell>
                        <TableCell>{item.quantityReceived}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.boxId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}