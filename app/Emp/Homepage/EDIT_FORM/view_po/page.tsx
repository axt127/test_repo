'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Home, FileText, ShoppingCart, Package, Search, ArrowLeft, Edit } from 'lucide-react'

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface PurchaseOrder {
  poNumber: string;
  client: string;
  destination: string;
  vendor: string;
  shipVia: string;
  notes: string;
  items: POItem[];
  receipts: MaterialReceipt[];
  shipments: Shipment[];
}

interface POItem {
  client: string;
  poNumber: string;
  line: number;
  partID: string;
  description: string;
  quantity: number;
  costPerUnit: number;
  quantityReceived: number;
}

interface MaterialReceipt {
  line: string;
  partID: string;
  description: string;
  qtyReceived: string;
  dateReceived: string;
  mrNumber: string;
  boxid: string;
}

interface Shipment {
  itemNumber: string;
  description: string;
  packingList: string;
  crate: string;
  qtyCrated: number;
  dateShipped: string;
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

export default function PurchaseOrderStatus() {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<PurchaseOrder | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [allPoNumbers, setAllPoNumbers] = useState<string[]>([])
  const [filteredPoNumbers, setFilteredPoNumbers] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('general')
  const router = useRouter()

  useEffect(() => {
    fetchAllPoNumbers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = allPoNumbers.filter(id => id.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredPoNumbers(filtered)
    } else {
      setFilteredPoNumbers([])
    }
  }, [searchQuery, allPoNumbers])

  const fetchAllPoNumbers = async () => {
    try {
      const response = await axios.get('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/all-POs')
      if (response.data && Array.isArray(response.data)) {
        setAllPoNumbers(response.data)
      }
    } catch (error) {
      console.error('Error fetching PO numbers:', error)
      setNotification({ type: 'error', message: 'Failed to fetch PO numbers. Please try again.' })
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setNotification(null)
    setSearchResult(null)

    try {
      const poResponse = await axios.get(`https://kzxiymztu9.execute-api.us-east-1.amazonaws.com/prod/getPO?po=${searchQuery}`)
      if (poResponse.status === 200 && poResponse.data) {
        const [generalInfo, itemCount, ...items] = poResponse.data
        
        try {
          // Fetch receipts data using the PO number
          const receiptsResponse = await axios.get(`https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/ViewPo?wr_po=${searchQuery}`)
          const receiptsData = JSON.parse(receiptsResponse.data.body)

          const parsedItems = items.map((item: any[]) => ({
            client: item[0],
            poNumber: item[1],
            line: item[2],
            partID: item[3],
            description: item[4],
            quantity: item[5],
            costPerUnit: item[6],
            quantityReceived: item[7]
          }))

          const parsedReceipts = receiptsData.map((receipt: any) => {
            const matchingItem = parsedItems.find((item: POItem) => item.line === parseInt(receipt.line, 10))
            return {
              ...receipt,
              partID: matchingItem ? matchingItem.partID : receipt.partID,
              description: matchingItem ? matchingItem.description : receipt.description
            }
          })

          console.log('Parsed Items:', parsedItems);
          console.log('Parsed Receipts:', parsedReceipts);

          const parsedResult: PurchaseOrder = {
            poNumber: generalInfo[0],
            destination: generalInfo[1],
            vendor: generalInfo[2],
            shipVia: generalInfo[3],
            notes: generalInfo[4],
            client: generalInfo[5],
            items: parsedItems,
            receipts: parsedReceipts,
            shipments: [] // Placeholder for now
          }
          setSearchResult(parsedResult)
        } catch (receiptsError) {
          console.error('Error fetching receipts:', receiptsError)
          setNotification({ type: 'error', message: 'Failed to fetch receipt data. Please try again later.' })
          // Still set the search result, but without receipts
          setSearchResult({
            poNumber: generalInfo[0],
            destination: generalInfo[1],
            vendor: generalInfo[2],
            shipVia: generalInfo[3],
            notes: generalInfo[4],
            client: generalInfo[5],
            items: items.map((item: any[]) => ({
              client: item[0],
              poNumber: item[1],
              line: item[2],
              partID: item[3],
              description: item[4],
              quantity: item[5],
              costPerUnit: item[6],
              quantityReceived: item[7]
            })),
            receipts: [],
            shipments: []
          })
        }
      } else {
        setNotification({ type: 'error', message: 'No purchase order found with the given number.' })
      }
    } catch (error) {
      console.error('Error searching purchase order:', error)
      setNotification({ type: 'error', message: 'Failed to search purchase order. Please try again.' })
    } finally {
      setIsSearching(false)
    }
  }

  const renderTabContent = () => {
    if (!searchResult) return null;

    switch (activeTab) {
      case 'general':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>PO Number:</strong> {searchResult.poNumber}</p>
                  <p><strong>Client:</strong> {searchResult.client}</p>
                  <p><strong>Destination:</strong> {searchResult.destination}</p>
                </div>
                <div>
                  <p><strong>Vendor:</strong> {searchResult.vendor}</p>
                  <p><strong>Ship Via:</strong> {searchResult.shipVia}</p>
                </div>
              </div>
              <div className="mt-4">
                <p><strong>Notes:</strong></p>
                <p className="mt-1">{searchResult.notes}</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'items':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line</TableHead>
                    <TableHead>Part ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost per Unit</TableHead>
                    <TableHead>Quantity Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResult.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.line}</TableCell>
                      <TableCell>{item.partID}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.costPerUnit.toFixed(2)}</TableCell>
                      <TableCell>{item.quantityReceived}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case 'receipts':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Material Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line</TableHead>
                    <TableHead>Part ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty Received</TableHead>
                    <TableHead>Date Received</TableHead>
                    <TableHead>MR #</TableHead>
                    <TableHead>Box ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResult.receipts.map((receipt, index) => (
                    <TableRow key={index}>
                      <TableCell>{receipt.line}</TableCell>
                      <TableCell>{receipt.partID || 'N/A'}</TableCell>
                      <TableCell>{receipt.description || 'N/A'}</TableCell>
                      <TableCell>{receipt.qtyReceived}</TableCell>
                      <TableCell>{new Date(receipt.dateReceived).toLocaleDateString()}</TableCell>
                      <TableCell>{receipt.mrNumber}</TableCell>
                      <TableCell>{receipt.boxid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case 'shipments':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Packing List</TableHead>
                    <TableHead>Crate</TableHead>
                    <TableHead>Qty Crated</TableHead>
                    <TableHead>Date Shipped</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResult.shipments.map((shipment, index) => (
                    <TableRow key={index}>
                      <TableCell>{shipment.itemNumber}</TableCell>
                      <TableCell>{shipment.description}</TableCell>
                      <TableCell>{shipment.packingList}</TableCell>
                      <TableCell>{shipment.crate}</TableCell>
                      <TableCell>{shipment.qtyCrated}</TableCell>
                      <TableCell>{shipment.dateShipped}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Purchase Order Status</h1>
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {notification && (
          <div className={`mb-4 p-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
            {notification.message}
          </div>
        )}

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

        {searchResult && (
          <div className="space-y-4">
            <div className="flex space-x-2 mb-4">
              {['general', 'items', 'receipts', 'shipments'].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
            {renderTabContent()}
          </div>
        )}
      </main>
    </div>
  )
}