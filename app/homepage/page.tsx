'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ReceiptData = {
  warehouseNumber: string
  poNumber: string
  mrNumber: string
}

export default function Homepage() {
  const router = useRouter()
  const [receipts, setReceipts] = useState<ReceiptData[]>([
    { warehouseNumber: "1", poNumber: "2", mrNumber: "3" },
    { warehouseNumber: "4", poNumber: "5", mrNumber: "6" },
    { warehouseNumber: "7", poNumber: "8", mrNumber: "9" },
  ])

  const handleLogout = () => {
    // Here you would typically clear any authentication tokens or user data
    // For this example, we'll just redirect to the login page
    router.push('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Client Homepage</h1>
      
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Link href="/warehouse-receipt">
            <Button variant="outline">Warehouse Receipt</Button>
          </Link>
          <Link href="/purchase-order">
            <Button variant="outline">Purchase Order</Button>
          </Link>
          <Link href="/material-receipt">
            <Button variant="outline">Material Receipt</Button>
          </Link>
          <Link href="/edit-warehouse">
            <Button variant="outline">Edit Warehouse Receipt</Button>
          </Link>
          <Link href="/edit-purchase-order">
            <Button variant="outline">Edit Purchase Order</Button>
          </Link>
          <Link href="/edit-material">
            <Button variant="outline">Edit Material Receipt</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Warehouse Number</TableHead>
              <TableHead className="font-bold">PO Number</TableHead>
              <TableHead className="font-bold">MR Number</TableHead>
              <TableHead className="font-bold w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt, index) => (
              <TableRow key={index}>
                <TableCell>{receipt.warehouseNumber}</TableCell>
                <TableCell>{receipt.poNumber}</TableCell>
                <TableCell>{receipt.mrNumber}</TableCell>
                <TableCell>
                  <Link href={`/edit-warehouse/${receipt.warehouseNumber}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </Link>
                </TableCell>
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
  )
}