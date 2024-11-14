'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LogOut, Home, FileText, ShoppingCart, Package, Search, ArrowLeft, Save } from 'lucide-react'

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface WarehouseReceipt {
  wrNumber: string;
  client: string;
  carrier: string;
  trackingNumber: string;
  receivedDate: string;
  receivedBy: string;
  hazmat: 'yes' | 'no';
  hazmatCode: string;
  notes: string;
  po: string;
  itemCount: number;
  items: {
    number: string;
    type: string;
    length: number;
    width: number;
    height: number;
    location: string;
    weight: number;
  }[];
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

export default function WarehouseReceiptSearch() {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<WarehouseReceipt | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [allWrIds, setAllWrIds] = useState<string[]>([])
  const [filteredWrIds, setFilteredWrIds] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedReceipt, setEditedReceipt] = useState<WarehouseReceipt | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAllWrIds()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = allWrIds.filter(id => id.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredWrIds(filtered)
    } else {
      setFilteredWrIds([])
    }
  }, [searchQuery, allWrIds])

  const fetchAllWrIds = async () => {
    try {
      const response = await axios.get('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/all-wr-ids')
      if (response.data && Array.isArray(response.data)) {
        setAllWrIds(response.data)
      }
    } catch (error) {
      console.error('Error fetching all WR IDs:', error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setNotification(null)
    setSearchResult(null)
    setIsEditing(false)

    try {
      const response = await axios.get(`https://qwlotlnq36.execute-api.us-east-1.amazonaws.com/prod/GetWR?wr_id=${searchQuery}`)
      console.log('API Response:', response.data)

      if (response.status === 200 && response.data && Array.isArray(response.data)) {
        const [mainInfo, itemCount, ...items] = response.data
        const parsedResult: WarehouseReceipt = {
          wrNumber: mainInfo[0],
          client: mainInfo[1],
          carrier: mainInfo[2],
          trackingNumber: mainInfo[3],
          receivedDate: mainInfo[4],
          receivedBy: mainInfo[5],
          hazmat: mainInfo[6],
          hazmatCode: mainInfo[7],
          notes: mainInfo[8],
          po: mainInfo[9],
          itemCount: itemCount[0],
          items: items.map(item => ({
            number: item[0],
            type: item[1],
            length: item[2],
            width: item[3],
            height: item[4],
            location: item[5],
            weight: item[6]
          }))
        }
        setSearchResult(parsedResult)
        setEditedReceipt(parsedResult)
      } else {
        setNotification({ type: 'error', message: 'No warehouse receipt found with the given number.' })
      }
    } catch (error) {
      console.error('Error searching warehouse receipt:', error)
      let errorMessage = 'Failed to search warehouse receipt. Please try again.'
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Server error: ${error.response.status}. ${error.response.data.message || ''}`
        } else if (error.request) {
          errorMessage = 'No response received from server. Please check your internet connection.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      setNotification({ type: 'error', message: errorMessage })
    } finally {
      setIsEditing(true);
      setIsSearching(false)
    }
  }

  const handleSave = async () => {
    if (!editedReceipt) return
  
    setIsUpdating(true)
    setNotification(null)
  
    try {
      const formattedData = [
        [
          editedReceipt.wrNumber,
          editedReceipt.client,
          editedReceipt.carrier,
          editedReceipt.trackingNumber,
          editedReceipt.receivedBy,
          editedReceipt.hazmat,
          editedReceipt.hazmatCode,
          editedReceipt.notes,
          editedReceipt.po
        ],
        [editedReceipt.itemCount.toString(), "Item Count", 0, 0, 0, "", 0],
        ...editedReceipt.items.map(item => [
          item.number,
          item.type,
          item.length,
          item.width,
          item.height,
          item.location,
          item.weight
        ])
      ];
  
      console.log('Sending data:', JSON.stringify(formattedData, null, 2));
  
      const response = await axios.post(
        'https://i86t4jbtki.execute-api.us-east-1.amazonaws.com/prod/updateWR',
        { wr_id: editedReceipt.wrNumber, data: formattedData },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Response:', response);
  
      if (response.status === 200) {
        setNotification({ type: 'success', message: 'Warehouse receipt updated successfully.' })
        setSearchResult(editedReceipt)
        setIsEditing(false)
      } else {
        setNotification({ type: 'error', message: 'Failed to update warehouse receipt. Please try again.' })
      }
    } catch (error) {
      console.error('Error updating warehouse receipt:', error)
      if (axios.isAxiosError(error)) {
        console.error('Error config:', error.config)
        if (error.response) {
          console.error('Error response data:', error.response.data)
          console.error('Error response status:', error.response.status)
          console.error('Error response headers:', error.response.headers)
          setNotification({ 
            type: 'error', 
            message: `Failed to update warehouse receipt. Server responded with status ${error.response.status}. ${error.response.data.message || ''}` 
          })
        } else if (error.request) {
          console.error('Error request:', error.request)
          setNotification({ 
            type: 'error', 
            message: 'Failed to update warehouse receipt. No response received from server.' 
          })
        } else {
          console.error('Error message:', error.message)
          setNotification({ 
            type: 'error', 
            message: `Failed to update warehouse receipt. Error: ${error.message}` 
          })
        }
      } else {
        setNotification({ 
          type: 'error', 
          message: 'Failed to update warehouse receipt. An unexpected error occurred.' 
        })
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof WarehouseReceipt) => {
    if (editedReceipt) {
      setEditedReceipt({ ...editedReceipt, [field]: e.target.value })
    }
  }

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: keyof WarehouseReceipt['items'][0]) => {
    if (editedReceipt) {
      const updatedItems = [...editedReceipt.items]
      updatedItems[index] = { ...updatedItems[index], [field]: e.target.value }
      setEditedReceipt({ ...editedReceipt, items: updatedItems })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Warehouse Receipt Search</h1>
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
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Enter Warehouse Receipt Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              {filteredWrIds.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredWrIds.map((id) => (
                    <li
                      key={id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSearchQuery(id)
                        setFilteredWrIds([])
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

        {searchResult && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Warehouse Receipt Details</h2>
              {editedReceipt && (
                <Button onClick={handleSave} disabled={isUpdating} className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editedReceipt ? (
                <>
                  <div>
                    <label className="block mb-1">WR Number</label>
                    <Input value={editedReceipt.wrNumber} onChange={(e) => handleInputChange(e, 'wrNumber')} className="mb-2" />
                    <label className="block mb-1">Client</label>
                    <Input value={editedReceipt.client} onChange={(e) => handleInputChange(e, 'client')} className="mb-2" />
                    <label className="block mb-1">Carrier</label>
                    <Input value={editedReceipt.carrier} onChange={(e) => handleInputChange(e, 'carrier')} className="mb-2" />
                    <label className="block mb-1">Tracking Number</label>
                    <Input value={editedReceipt.trackingNumber} onChange={(e) => handleInputChange(e, 'trackingNumber')} className="mb-2" />
                    <label className="block mb-1">Received Date</label>
                    <Input value={editedReceipt.receivedDate} onChange={(e) => handleInputChange(e, 'receivedDate')} className="mb-2" />
                  </div>
                  <div>
                    <label className="block mb-1">Received By</label>
                    <Input value={editedReceipt.receivedBy} onChange={(e) => handleInputChange(e, 'receivedBy')} className="mb-2" />
                    <label className="block mb-1">Hazmat</label>
                    <Input value={editedReceipt.hazmat} onChange={(e) => handleInputChange(e, 'hazmat')} className="mb-2" />
                    <label className="block mb-1">Hazmat Code</label>
                    <Input value={editedReceipt.hazmatCode} onChange={(e) => handleInputChange(e, 'hazmatCode')} className="mb-2" />
                    <label className="block mb-1">PO</label>
                    <Input value={editedReceipt.po} onChange={(e) => handleInputChange(e, 'po')} className="mb-2" />
                    <label className="block mb-1">Item Count</label>
                    <Input value={editedReceipt.itemCount.toString()} onChange={(e) => handleInputChange(e, 'itemCount')} className="mb-2" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p><strong>WR Number:</strong> {searchResult.wrNumber}</p>
                    <p><strong>Client:</strong> {searchResult.client}</p>
                    <p><strong>Carrier:</strong> {searchResult.carrier}</p>
                    <p><strong>Tracking Number:</strong> {searchResult.trackingNumber}</p>
                    <p><strong>Received Date:</strong> {new Date(searchResult.receivedDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p><strong>Received By:</strong> {searchResult.receivedBy}</p>
                    <p><strong>Hazmat:</strong> {searchResult.hazmat}</p>
                    <p><strong>Hazmat Code:</strong> {searchResult.hazmatCode || 'N/A'}</p>
                    <p><strong>PO:</strong> {searchResult.po}</p>
                    <p><strong>Item Count:</strong> {searchResult.itemCount}</p>
                  </div>
                </>
              )}
            </div>
            <div>
              <label className="block mb-1">Notes</label>
              {editedReceipt ? (
                <Textarea
                  value={editedReceipt.notes}
                  onChange={(e) => handleInputChange(e, 'notes')}
                  className="w-full"
                  rows={4}
                />
              ) : (
                <p><strong>Notes:</strong> {searchResult.notes}</p>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Item Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b">Number</th>
                      <th className="text-left p-2 border-b">Type</th>
                      <th className="text-left p-2 border-b">Length</th>
                      <th className="text-left p-2 border-b">Width</th>
                      <th className="text-left p-2 border-b">Height</th>
                      <th className="text-left p-2 border-b">Weight</th>
                      <th className="text-left p-2 border-b">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(editedReceipt ? editedReceipt.items : searchResult.items).map((item, index) => (
                      <tr key={index}>
                        {editedReceipt ? (
                          <>
                            <td className="p-2 border-b"><Input value={item.number} onChange={(e) => handleItemChange(e, index, 'number')} /></td>
                            <td className="p-2 border-b"><Input value={item.type} onChange={(e) => handleItemChange(e, index, 'type')} /></td>
                            <td className="p-2 border-b"><Input type="number" value={item.length} onChange={(e) => handleItemChange(e, index, 'length')} /></td>
                            <td className="p-2 border-b"><Input type="number" value={item.width} onChange={(e) => handleItemChange(e, index, 'width')} /></td>
                            <td className="p-2 border-b"><Input type="number" value={item.height} onChange={(e) => handleItemChange(e, index, 'height')} /></td>
                            <td className="p-2 border-b"><Input type="number" value={item.weight} onChange={(e) => handleItemChange(e, index, 'weight')} /></td>
                            <td className="p-2 border-b"><Input value={item.location} onChange={(e) => handleItemChange(e, index, 'location')} /></td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 border-b">{item.number}</td>
                            <td className="p-2 border-b">{item.type}</td>
                            <td className="p-2 border-b">{item.length}</td>
                            <td className="p-2 border-b">{item.width}</td>
                            <td className="p-2 border-b">{item.height}</td>
                            <td className="p-2 border-b">{item.weight}</td>
                            <td className="p-2 border-b">{item.location}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}