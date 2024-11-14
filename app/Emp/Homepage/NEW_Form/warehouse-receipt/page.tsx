'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, Home, FileText, ShoppingCart, Package, Edit } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { UserOptions } from 'jspdf-autotable'
import QRCode from 'qrcode'


declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

interface TableRow {
  number: string;
  type: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  location: string;
}

interface FormData {
  wrNumber: string;
  client: string;
  carrier: string;
  trackingNumber: string;
  receivedBy: string;
  hazmat: 'yes' | 'no';
  hazmatCode: string;
  notes: string;
  po: string;
}

const initialFormData: FormData = {
  wrNumber: '',
  client: '',
  carrier: '',
  trackingNumber: '',
  receivedBy: '',
  hazmat: 'no',
  hazmatCode: '',
  notes: '',
  po: '',
}

const initialTableData: TableRow[] = [
  { number: '', type: '', length: '', width: '', height: '', weight: '', location: '' }
]

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

export default function Component() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [tableData, setTableData] = useState<TableRow[]>(initialTableData)
  const [clients, setClients] = useState<string[]>([])

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const [wrResponse, clientsResponse] = await Promise.all([
          axios.get('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/getWRIndex', { signal }),
          axios.get('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/all-clients', { signal })
        ]);
        console.log('Last WR:', wrResponse.data);
        generateNewWRNumber(wrResponse.data);
        setClients(clientsResponse.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else {
          console.error('Error fetching data:', error);
          toast.error('Failed to fetch initial data. Please refresh the page.');
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  const generateNewWRNumber = (lastWR: string) => {
    const newWRNumber = lastWR
    setFormData(prev => ({ ...prev, wrNumber: newWRNumber }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, hazmat: e.target.checked ? 'yes' : 'no' }))
  }

  const handleTableInputChange = (index: number, field: string, value: string) => {
    const newData = [...tableData]
    newData[index] = { ...newData[index], [field]: value }
    setTableData(newData)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, fieldIndex: number) => {
    if (e.key === 'Tab' && !e.shiftKey && rowIndex === tableData.length - 1 && fieldIndex === 6) {
      e.preventDefault()
      const newRow = { number: '', type: '', length: '', width: '', height: '', weight: '', location: '' }
      setTableData(prevData => [...prevData, newRow])
      
      setTimeout(() => {
        const newRowFirstInput = document.querySelector(`tr:nth-child(${rowIndex + 2}) td:first-child input`) as HTMLInputElement
        if (newRowFirstInput) {
          newRowFirstInput.focus()
        }
      }, 0)
    }
  }

  const resetForm = () => {
    setFormData({ ...initialFormData, wrNumber: formData.wrNumber })
    setTableData(initialTableData)
  }

  const fetchNewWRNumber = async () => {
    try {
      const response = await axios.get('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/getWRIndex');
      console.log('New WR:', response.data);
      generateNewWRNumber(response.data);
    } catch (error) {
      console.error('Error fetching new WR:', error);
      toast.error('Failed to fetch new WR number. Please try again.');
    }
  }

  const generatePDF = async () => {
    const doc = new jsPDF()
    
    // Set document properties
    doc.setProperties({
      title: `Warehouse Receipt - ${formData.wrNumber}`,
      subject: 'Warehouse Receipt',
      author: 'WMS Express',
      keywords: 'warehouse, receipt, logistics',
      creator: 'WMS Express System'
    })

    // Generate QR code
    let qrCodeDataUrl;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(formData.wrNumber)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }

    // Add logo (with error handling)
    try {
      doc.addImage('/wex.png', 'PNG', 14, 10, 30, 30)
    } catch (error) {
      console.error('Error adding logo:', error)
      // Fallback: Add text instead of image
      doc.setFontSize(12)
      doc.text('WMS Express', 14, 20)
    }

    // Add QR code (with error handling)
    if (qrCodeDataUrl) {
      try {
        doc.addImage(qrCodeDataUrl, 'PNG', 170, 10, 30, 30)
      } catch (error) {
        console.error('Error adding QR code:', error)
        // Fallback: Add text instead of QR code
        doc.setFontSize(8)
        doc.text(`WR: ${formData.wrNumber}`, 170, 20)
      }
    }

    // Add title
    doc.setFontSize(24)
    doc.setTextColor(44, 62, 80) // Dark blue color
    doc.text('Warehouse Receipt', 50, 30)

    // Add horizontal line
    doc.setDrawColor(52, 152, 219) // Blue color
    doc.setLineWidth(0.5)
    doc.line(14, 45, 196, 45)

    // Add form data
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0) // Black color

    const leftColumnX = 14
    const rightColumnX = 110
    let yPosition = 55

    // Helper function to add a field
    const addField = (label: string, value: string, x: number) => {
      doc.setFont("helvetica", "bold")
      doc.text(label, x, yPosition)
      doc.setFont("helvetica", "normal")
      doc.text(value, x, yPosition + 7)
      yPosition += 15
    }

    // Left column
    addField("WR Number:", formData.wrNumber, leftColumnX)
    addField("Client:", formData.client, leftColumnX)
    addField("PO#:", formData.po, leftColumnX)
    addField("Carrier:", formData.carrier, leftColumnX)

    // Reset Y position for right column
    yPosition = 55

    // Right column
    addField("Tracking Number:", formData.trackingNumber, rightColumnX)
    addField("Received By:", formData.receivedBy, rightColumnX)
    addField("Hazmat:", formData.hazmat, rightColumnX)
    if (formData.hazmat === 'yes') {
      addField("Hazmat Code:", formData.hazmatCode, rightColumnX)
    }

    // Notes section
    yPosition += 10
    doc.setFont("helvetica", "bold")
    doc.text("Notes:", leftColumnX, yPosition)
    doc.setFont("helvetica", "normal")
    const splitNotes = doc.splitTextToSize(formData.notes, 180)
    doc.text(splitNotes, leftColumnX, yPosition + 7)

    // Add box details table
    yPosition += 20 + (splitNotes.length * 7)
    autoTable(doc, {
      startY: yPosition,
      head: [['Number', 'Type', 'Length', 'Width', 'Height', 'Weight', 'Location']],
      body: tableData.map(row => Object.values(row)),
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      styles: { 
        font: "helvetica", 
        fontSize: 10,
        cellPadding: 3,
      },
    })

    // Add footer
    const pageCount = doc.getNumberOfPages()
    doc.setFont("helvetica", "italic")
    doc.setFontSize(10)
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      )
    }
    
    // Save the PDF
    doc.save(`warehouse_receipt_${formData.wrNumber}.pdf`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formattedData = [
      [
        formData.wrNumber,
        formData.client,
        formData.carrier,
        formData.trackingNumber,
        formData.receivedBy,
        formData.hazmat,
        formData.hazmatCode,
        formData.notes,
        formData.po
      ],
      ...tableData.map(item => [
        item.number,
        item.type,
        Number(item.length),
        Number(item.width),
        Number(item.height),
        item.location,
        Number(item.weight)
      ])
    ]

    try {
      const response = await axios.post(
        'https://i86t4jbtki.execute-api.us-east-1.amazonaws.com/prod/putWR',
        formattedData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('API Response:', response.data)

      if (response.status === 200) {
        toast.success('Warehouse receipt submitted successfully!')
        generatePDF() // Generate and download PDF after successful submission
        resetForm()
        fetchNewWRNumber()
      } else {
        throw new Error('Unexpected response from server')
      }
    } catch (error) {
      console.error('Error submitting warehouse receipt:', error)
      let errorMessage = 'Failed to submit warehouse receipt. Please try again.'
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Server error: ${error.response.status}. ${error.response.data.message || ''}`
        } else if (error.request) {
          errorMessage = 'No response received from server. Please check your internet connection.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClientChange = (value: string) => {
    setFormData(prev => ({ ...prev, client: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Warehouse Receipt Form</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="wrNumber">
                WR Number
              </label>
              <input
                className="w-full p-2 border rounded-md bg-muted text-muted-foreground"
                id="wrNumber"
                type="text"
                name="wrNumber"
                value={formData.wrNumber}
                readOnly
                aria-readonly="true"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="client">
                Client
              </label>
              <Select onValueChange={handleClientChange} value={formData.client}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="po">
                PO#
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="po"
                type="text"
                name="po"
                value={formData.po}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="carrier">
                Carrier
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="carrier"
                type="text"
                name="carrier"
                value={formData.carrier}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="trackingNumber">
                Tracking Number
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="trackingNumber"
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="receivedBy">
                Received By
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="receivedBy"
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hazmat"
              className="rounded border-gray-300 text-primary focus:ring-primary"
              checked={formData.hazmat === 'yes'}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="hazmat" className="text-sm font-medium">
              Hazmat
            </label>
          </div>
          {formData.hazmat === 'yes' && (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="hazmatCode">
                Hazmat Code
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="hazmatCode"
                type="text"
                name="hazmatCode"
                value={formData.hazmatCode}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="notes">
              Notes
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Box Details</h2>
              <Button 
                onClick={() => {
                  setTableData(prevData => [...prevData, { number: '', type: '', length: '', width: '', height: '', weight: '', location: '' }])
                  toast.info('New row added to box details.')
                }} 
                type="button"
              >
                Add Row
              </Button>
            </div>
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
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.keys(row).map((key, fieldIndex) => (
                        <td key={key} className="p-2">
                          <input
                            type="text"
                            className="w-full p-2 border rounded-md"
                            value={row[key as keyof typeof row]}
                            onChange={(e) => handleTableInputChange(rowIndex, key, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, fieldIndex)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  )
}