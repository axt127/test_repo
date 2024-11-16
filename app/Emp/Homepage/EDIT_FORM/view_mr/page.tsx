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
import { LogOut, Home, FileText, ShoppingCart, Package, Edit, Search, Trash2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

interface BoxDetail {
  number: string;
  type: string;
  length: number;
  width: number;
  height: number;
  location: string;
  weight: number;
}

interface ItemDetail {
  itemNumber: string;
  partId: string;
  description: string;
  quantityOrder: string;
  quantityReceived: string;
  boxId: string;
}

interface ViewPoItem {
  line: number;
  qtyReceived: string;
  boxid?: string | number;
}

interface ViewPoItemAccumulator {
  [key: number]: {
    quantityReceived: number;
    boxIds: Set<string | number>;
  }
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
  const [boxDetails, setBoxDetails] = useState<BoxDetail[]>([])
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
    setFilteredMRNumbers([])
    if (!allMRNumbers.includes(searchQuery)) {
      toast.error('Invalid MR number. Please select from the list.')
      return
    }
    setIsSearching(true)
    try {
      const wrResponse = await axios.get(`https://qwlotlnq36.execute-api.us-east-1.amazonaws.com/prod/GetWR?wr_id=${searchQuery}`)
      console.log('WR Response:', wrResponse.data)
      if (wrResponse.status === 200 && Array.isArray(wrResponse.data) && wrResponse.data.length > 1) {
        const [wrInfo, boxCount, ...boxes] = wrResponse.data
        
        setMRInfo({
          warehouseNumber: wrInfo[0] || '',
          client: wrInfo[1] || '',
          receiptDate: wrInfo[4] ? new Date(wrInfo[4]).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
          po: wrInfo[9] || '',
          carrier: wrInfo[2] || '',
          tracking: wrInfo[3] || ''
        })

        const parsedBoxDetails: BoxDetail[] = boxes.map((box: any) => ({
          number: box[0],
          type: box[1],
          length: box[2],
          width: box[3],
          height: box[4],
          location: box[5],
          weight: box[6]
        }))
        setBoxDetails(parsedBoxDetails)

        if (wrInfo[9]) {
          try {
            const poResponse = await axios.get(`https://kzxiymztu9.execute-api.us-east-1.amazonaws.com/prod/getPO?po=${wrInfo[9]}`)
            console.log('PO Response:', poResponse.data)
            
            if (poResponse.status === 200 && Array.isArray(poResponse.data) && poResponse.data.length > 2) {
              const [poHeader, itemCount, ...poItems] = poResponse.data
              
              const viewPoResponse = await axios.get(`https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/ViewPo?wr_po=${wrInfo[9]}`)
              console.log('ViewPo Response:', viewPoResponse.data)
              
              if (viewPoResponse.status === 200 && viewPoResponse.data.body) {
                const viewPoItems: ViewPoItem[] = JSON.parse(viewPoResponse.data.body)
                
                const viewPoItemMap = viewPoItems.reduce<ViewPoItemAccumulator>((acc, item) => {
                  if (!acc[item.line]) {
                    acc[item.line] = { quantityReceived: 0, boxIds: new Set() }
                  }
                  acc[item.line].quantityReceived += parseInt(item.qtyReceived, 10) || 0
                  if (item.boxid) acc[item.line].boxIds.add(item.boxid)
                  return acc
                }, {})
                
                const formattedItemDetails = poItems.map((poItem: any) => {
                  const lineNumber = poItem[2]
                  const viewPoItem = viewPoItemMap[lineNumber] || { quantityReceived: 0, boxIds: new Set() }
                  return {
                    itemNumber: lineNumber?.toString() || '',
                    partId: poItem[3] || '',
                    description: poItem[4] || '',
                    quantityOrder: poItem[5]?.toString() || '',
                    quantityReceived: viewPoItem.quantityReceived.toString(),
                    boxId: Array.from(viewPoItem.boxIds).join(', ')
                  }
                })

                console.log('Formatted Item Details:', formattedItemDetails)
                setItemDetails(formattedItemDetails)
              } else {
                console.error('Invalid response from ViewPo API:', viewPoResponse)
                toast.error('Invalid response from ViewPo API')
                setItemDetails([])
              }
            } else {
              console.error('Invalid response from PO API:', poResponse)
              toast.error('Invalid response from PO API')
              setItemDetails([])
            }
          } catch (error) {
            console.error('Error fetching PO or ViewPo details:', error)
            toast.error('Failed to fetch PO or ViewPo details. Please try again.')
            setItemDetails([])
          }
        } else {
          console.warn('No PO number found in WR data')
          toast.warn('No Purchase Order number found for this Material Receipt.')
          setItemDetails([])
        }
      } else {
        console.error('Invalid response from Warehouse Receipt API:', wrResponse)
        toast.error('Invalid response from Warehouse Receipt API')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async () => {
    if (!searchQuery) {
      toast.error('Please search for a Material Receipt before deleting.')
      return
    }

    setIsDeleting(true)
    try {
      const response = await axios.delete(`https://4n2oiwjde1.execute-api.us-east-1.amazonaws.com/prod/DeleteMR?wr_id=${searchQuery}`)
      if (response.status === 200) {
        toast.success('Material Receipt deleted successfully')
        setSearchQuery('')
        setMRInfo({
          warehouseNumber: '',
          client: '',
          receiptDate: '',
          po: '',
          carrier: '',
          tracking: ''
        })
        setBoxDetails([])
        setItemDetails([])
      } else {
        toast.error('Failed to delete Material Receipt')
      }
    } catch (error) {
      console.error('Error deleting Material Receipt:', error)
      toast.error('An error occurred while deleting the Material Receipt')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-primary mb-4">View Material Receipt</h1>
          <form onSubmit={handleSearch} className="flex w-full max-w-3xl gap-2">
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
        </div>

        {mrInfo.warehouseNumber && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Receipt Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="warehouseNumber">Warehouse Number</Label>
                    <Input id="warehouseNumber" value={mrInfo.warehouseNumber} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Input id="client" value={mrInfo.client} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="receiptDate">Receipt Date</Label>
                    <Input id="receiptDate" value={mrInfo.receiptDate} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="po">PO</Label>
                    <Input id="po" value={mrInfo.po} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="carrier">Carrier</Label>
                    <Input id="carrier" value={mrInfo.carrier} readOnly />
                  </div>
                  <div>
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
                      <TableHead>Location</TableHead>
                      <TableHead>Weight</TableHead>
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
                        <TableCell>{box.location}</TableCell>
                        <TableCell>{box.weight}</TableCell>
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
                        <TableCell>{item.boxId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="flex items-center"
              >
                {isDeleting ? 'Deleting...' : 'Delete Material Receipt'}
                <Trash2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}