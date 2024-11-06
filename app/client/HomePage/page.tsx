'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Edit, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import axios from 'axios'

type ReceiptData = [string, string, boolean]

export default function Homepage() {
  const router = useRouter()
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentReceipts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await axios.get<ReceiptData[]>('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/getWR_PO_MR_forclient?client=Marcel')
        console.log('API Response:', response.data)
        setReceipts(response.data)
      } catch (err) {
        console.error('Error fetching receipts:', err)
        setError('Failed to load receipts. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentReceipts()
  }, [])

  const handleLogout = () => {
    router.push('/login')
  }

  const filteredReceipts = searchTerm
    ? receipts.filter(
        (receipt) =>
          receipt[0].toUpperCase().includes(searchTerm.toUpperCase()) ||
          receipt[1].toUpperCase().includes(searchTerm.toUpperCase())
      )
    : receipts

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      <div className="flex flex-col items-center mb-6">
        <Image src="/wex.png" alt="Wex Logo" width={100} height={100} className="mb-4" />
        <h1 className="text-3xl font-bold text-center">Welcome to WMS Xpress</h1>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Link href="/client/HomePage/WR">
            <Button variant="outline">Warehouse Receipt</Button>
          </Link>
          <Link href="/client/HomePage/PO">
            <Button variant="outline">Purchase Order</Button>
          </Link>
          <Link href="/client/HomePage/MR">
            <Button variant="outline">Material Receipt</Button>
          </Link>
        </div>
        
        <div className="mb-4 flex justify-center">
          <input
            type="text"
            placeholder="Search by number (e.g., WR-012, PO987654)..."
            className="border rounded-md p-2 w-full max-w-3xl" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 max-w-3xl mx-auto"> 
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Warehouse Receipt</TableHead>
              <TableHead className="font-bold">PO Number</TableHead>
              <TableHead className="font-bold">MR</TableHead>
              <TableHead className="font-bold w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredReceipts.length > 0 ? (
              filteredReceipts.map((receipt, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Link href={`/warehouse-receipt/${receipt[0]}`} className="text-primary hover:text-blue-600 hover:underline">
                      {receipt[0]}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/purchase-order/${receipt[1]}`} className="text-primary hover:text-blue-600 hover:underline">
                      {receipt[1]}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {receipt[2] ? (
                      <Link href={`/material-receipt/${receipt[0]}`} className="text-primary hover:text-blue-600 hover:underline">
                        View MR
                      </Link>
                    ) : (
                      "No MR"
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/edit-warehouse/${receipt[0]}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  {searchTerm ? "No results found" : "No receipts available"}
                </TableCell>
              </TableRow>
            )}
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





