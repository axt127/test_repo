'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import Image from 'next/image'

type ReceiptData = {
  warehouseNumber: string
  poNumber: string
  mrNumber: string
}

export default function EmployeeHomepage() {
  const router = useRouter()
  const [receipts, setReceipts] = useState<ReceiptData[]>([
    { warehouseNumber: "1", poNumber: "2", mrNumber: "3" },
    { warehouseNumber: "4", poNumber: "5", mrNumber: "6" },
    { warehouseNumber: "7", poNumber: "8", mrNumber: "9" },
  ])

  const handleLogout = () => {
    router.push('/login')
  }
  function Navigation() {
    return (
      <nav className="bg-white shadow-sm mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Image src="/wex.png" alt="Wex Logo" width={50} height={50} />
              <span className="text-lg font-semibold">WMS Express</span>
            </div>
            <div className="flex justify-center space-x-4">
              <Link href="/Emp/Homepage">
                <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Home</span>
              </Link>
              <Link href="/Emp/Homepage/NEW_Form/warehouse-receipt">
                <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Warehouse Receipt</span>
              </Link>
              <Link href="/Emp/Homepage/NEW_Form/purchase-order">
                <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Purchase Order</span>
              </Link>
              <Link href="/Emp/Homepage/NEW_Form/material-receipt">
                <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Material Receipt</span>
              </Link>
              <Link href="/Emp/Homepage/EDIT_FORM/edit-warehouse">
                <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Edit Warehouse Receipt</span>
              </Link>
              <Link href="/Emp/Homepage/EDIT_FORM/edit-purchase-order">
                <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Edit Purchase Order</span>
              </Link>
              <Link href="/Emp/Homepage/EDIT_FORM/edit-material">
                <span className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Edit Material Receipt</span>
              </Link>
            </div>
            <div className="w-[50px]"></div>
          </div>
        </div>
      </nav>
    )
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Employee Homepage</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Warehouse Number</TableHead>
              <TableHead className="font-bold">PO Number</TableHead>
              <TableHead className="font-bold">MR Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt, index) => (
              <TableRow key={index}>
                <TableCell>{receipt.warehouseNumber}</TableCell>
                <TableCell>{receipt.poNumber}</TableCell>
                <TableCell>{receipt.mrNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Button 
          onClick={handleLogout}
          className="flex items-center"
          variant="outline"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
    </div>
  )
}