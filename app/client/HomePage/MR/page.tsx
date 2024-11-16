'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Home, FileText, ShoppingCart, Package, LogOut } from 'lucide-react'
import { useClient } from '@/app/ClientContext'

interface MaterialReceipt {
  mrId: string;
  enteredBy: string;
  notes: string;
  items: {
    wrId: string;
    qtyReceived: string;
    boxId: string;
    poItemId: string;
  }[];
}

function Navigation({ handleLogout, clientName }: { handleLogout: () => void; clientName: string }) {
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
              { href: "/client/HomePage", label: "Home", icon: Home },
              { href: "/client/HomePage/WR", label: "Warehouse Receipt", icon: FileText },
              { href: "/client/HomePage/PO", label: "Purchase Order", icon: ShoppingCart },
              { href: "/client/HomePage/MR", label: "Material Receipt", icon: Package },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="flex flex-col items-center justify-center h-16 w-20">
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs text-center">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Client: {clientName}</span>
            <Button onClick={handleLogout} className="flex items-center" variant="secondary">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function MaterialReceiptViewerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [materialReceipt, setMaterialReceipt] = useState<MaterialReceipt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const { clientName } = useClient()

  const fetchMaterialReceipt = useCallback(async (mrNumber: string) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const response = await axios.get(`https://4n2oiwjde1.execute-api.us-east-1.amazonaws.com/prod/getMR?wr_id=${mrNumber}`)
      const data = response.data

      if (Array.isArray(data) && data.length >= 2) {
        const [headerData, ...itemsData] = data

        setMaterialReceipt({
          mrId: headerData[0] || '',
          enteredBy: headerData[1] || '',
          notes: headerData[2] || '',
          items: itemsData.map(item => ({
            wrId: item[0] || '',
            qtyReceived: item[1] || '',
            boxId: item[2] || '',
            poItemId: item[3] || ''
          }))
        })
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching material receipt:', error)
      setError('Failed to fetch material receipt. Please try again.')
      setMaterialReceipt(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const mrNumber = searchParams.get('mrNumber')
    if (mrNumber) {
      setSearchTerm(mrNumber)
      fetchMaterialReceipt(mrNumber)
    }
  }, [searchParams, fetchMaterialReceipt])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      fetchMaterialReceipt(searchTerm.trim())
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setMaterialReceipt(null)
    setError(null)
    setHasSearched(false)
  }

  const handleLogout = () => {
    router.push('/login')
  }

  const inputClass = "shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline " + 
    (hasSearched ? "text-gray-700 bg-white" : "text-gray-400 bg-gray-100")

  return (
    <div className="min-h-screen bg-background">
      <Navigation handleLogout={handleLogout} clientName={clientName} />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Material Receipt Viewer</h1>
        </div>
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Enter MR Number"
              value={searchTerm}
              onChange={handleInputChange}
              className="pr-10"
              aria-label="Material Receipt Number"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mrId">
                MR ID
              </label>
              <input
                className={inputClass}
                id="mrId"
                type="text"
                name="mrId"
                value={materialReceipt?.mrId || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="enteredBy">
                Entered By
              </label>
              <input
                className={inputClass}
                id="enteredBy"
                type="text"
                name="enteredBy"
                value={materialReceipt?.enteredBy || ''}
                readOnly
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notes
            </label>
            <textarea
              className={`${inputClass} h-24`}
              id="notes"
              name="notes"
              value={materialReceipt?.notes || ''}
              readOnly
            />
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Item Details</h2>
            <table className="w-full border-separate border-spacing-4">
              <thead>
                <tr>
                  <th className="text-left pb-3 px-3 border-b">WR ID</th>
                  <th className="text-left pb-3 px-3 border-b">Quantity Received</th>
                  <th className="text-left pb-3 px-3 border-b">Box ID</th>
                  <th className="text-left pb-3 px-3 border-b">PO Item ID</th>
                </tr>
              </thead>
              <tbody>
                {hasSearched && materialReceipt?.items ? (
                  materialReceipt.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="w-full p-2 border-2 rounded focus:border-blue-500 focus:outline-none text-gray-700 bg-white"
                          value={item.wrId}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="w-full p-2 border-2 rounded focus:border-blue-500 focus:outline-none text-gray-700 bg-white"
                          value={item.qtyReceived}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="w-full p-2 border-2 rounded focus:border-blue-500 focus:outline-none text-gray-700 bg-white"
                          value={item.boxId}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="w-full p-2 border-2 rounded focus:border-blue-500 focus:outline-none text-gray-700 bg-white"
                          value={item.poItemId}
                          readOnly
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {Array(4).fill(0).map((_, index) => (
                      <td key={index}>
                        <input
                          type="text"
                          className="w-full p-2 border-2 rounded focus:border-blue-500 focus:outline-none text-gray-400 bg-gray-100"
                          value=""
                          readOnly
                        />
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function MaterialReceiptViewer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MaterialReceiptViewerContent />
    </Suspense>
  )
}