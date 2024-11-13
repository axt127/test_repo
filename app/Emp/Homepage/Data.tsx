'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft, Info, LogOut, Home, FileText, ShoppingCart, Package, Edit } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import Link from 'next/link'
import Image from 'next/image'

type WarehouseReceipt = string

type WRDetails = {
  id: string
  client: string
  carrier: string
  trackingNumber: string
  date: string
  receivedBy: string
  damaged: string
  hazmat: string
  notes: string
  poNumber: string
  items: {
    id: string
    type: string
    length: number
    width: number
    height: number
    location: string
    weight: number
  }[]
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
              { href: "/Emp/Homepage/EDIT_FORM/edit-material", label: "Edit Material", icon: Edit },
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

export default function ClientData() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clientName = searchParams.get('clientName')
  const [clientWRs, setClientWRs] = useState<WarehouseReceipt[]>([])
  const [selectedWR, setSelectedWR] = useState<WRDetails | null>(null)

  useEffect(() => {
    if (clientName) {
      fetchClientWRs()
    }
  }, [clientName])

  const fetchClientWRs = async () => {
    try {
      const response = await fetch(`https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/GetWRforclient?client=${encodeURIComponent(clientName || '')}`)
      const data = await response.json()
      setClientWRs(data)
    } catch (error) {
      console.error('Error fetching client WRs:', error)
    }
  }

  const fetchWRDetails = async (wrId: string) => {
    try {
      const response = await fetch(`https://qwlotlnq36.execute-api.us-east-1.amazonaws.com/prod/GetWR?wr_id=${encodeURIComponent(wrId)}`)
      const data = await response.json()
      const [details, itemCount, ...items] = data
      setSelectedWR({
        id: details[0],
        client: details[1],
        carrier: details[2],
        trackingNumber: details[3],
        date: details[4],
        receivedBy: details[5],
        damaged: details[6],
        hazmat: details[7],
        notes: details[8],
        poNumber: details[9],
        items: items.map((item: any) => ({
          id: item[0],
          type: item[1],
          length: item[2],
          width: item[3],
          height: item[4],
          location: item[5],
          weight: item[6]
        }))
      })
    } catch (error) {
      console.error('Error fetching WR details:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 relative"
      >
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-primary">{clientName}</h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Warehouse Receipt Number</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientWRs.map((wr, index) => (
                    <TableRow key={index}>
                      <TableCell>{wr}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchWRDetails(wr)}
                          aria-label={`View details for ${wr}`}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{selectedWR ? `Details for ${selectedWR.id}` : 'Select a Warehouse Receipt'}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedWR ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">General Information</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Client</TableCell>
                          <TableCell>{selectedWR.client}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Carrier</TableCell>
                          <TableCell>{selectedWR.carrier}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Tracking Number</TableCell>
                          <TableCell>{selectedWR.trackingNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Date</TableCell>
                          <TableCell>{new Date(selectedWR.date).toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Received By</TableCell>
                          <TableCell>{selectedWR.receivedBy}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Damaged</TableCell>
                          <TableCell>{selectedWR.damaged}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Hazmat</TableCell>
                          <TableCell>{selectedWR.hazmat}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">PO Number</TableCell>
                          <TableCell>{selectedWR.poNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Notes</TableCell>
                          <TableCell>{selectedWR.notes}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <h3 className="font-semibold">Items</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Dimensions (L x W x H)</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Weight</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedWR.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>{`${item.length} x ${item.width} x ${item.height}`}</TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>{item.weight}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Click on a Warehouse Receipt to view its details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}