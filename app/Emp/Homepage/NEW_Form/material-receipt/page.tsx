'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Trash2, LogOut, Home, FileText, ShoppingCart, Package, Edit } from 'lucide-react'
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

interface TableRow {
  number: string;
  type: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  location: string;
}

interface AdditionalTableRow {
  itemNumber: string;
  partId: string;
  description: string;
  quantityOrder: string;
  quantityReceived: string;
  quantity: string;
  boxId: string;
}

export default function MaterialReceipt() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    warehouseNumber: '',
    client: '',
    receiptDate: '',
    po: '',
    carrier: '',
    tracking: ''
  })

  const [tableData, setTableData] = useState<TableRow[]>([
    { number: '', type: '', length: '', width: '', height: '', weight: '', location: '' }
  ])

  const [additionalTableData, setAdditionalTableData] = useState<AdditionalTableRow[]>([
    { itemNumber: '', partId: '', description: '', quantityOrder: '', quantityReceived: '', quantity: '', boxId: '' }
  ])

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'warehouseNumber' && value.trim() !== '') {
      fetchWarehouseData(value)
    }
  }

  const fetchWarehouseData = async (wrId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`https://qwlotlnq36.execute-api.us-east-1.amazonaws.com/prod/GetWR?wr_id=${wrId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch warehouse data')
      }
      const data = await response.json()
      
      if (data && data.length >= 3) {
        const [wrInfo, itemCount, ...items] = data
        
        setFormData(prev => ({
          ...prev,
          client: wrInfo[1] || '',
          receiptDate: new Date(wrInfo[4]).toISOString().split('T')[0] || '',
          po: wrInfo[9] || '',
          carrier: wrInfo[2] || '',
          tracking: wrInfo[3] || ''
        }))

        setTableData(items.map((item: any) => ({
          number: item[0] || '',
          type: item[1] || '',
          length: item[2]?.toString() || '',
          width: item[3]?.toString() || '',
          height: item[4]?.toString() || '',
          weight: item[6]?.toString() || '',
          location: item[5] || ''
        })))

        // Fetch PO data after setting the PO number
        if (wrInfo[9]) {
          fetchPOData(wrInfo[9])
        }
      }
    } catch (error) {
      console.error('Error fetching warehouse data:', error)
      toast.error('Failed to fetch warehouse data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPOData = async (poNumber: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`https://kzxiymztu9.execute-api.us-east-1.amazonaws.com/prod/getPO?po=${poNumber}`)
      if (!response.ok) {
        throw new Error('Failed to fetch PO data')
      }
      const data = await response.json()
      
      if (data && data.length >= 3) {
        const [poInfo, itemCount, ...items] = data
        
        setAdditionalTableData(items.map((item: any) => ({
          itemNumber: item[2]?.toString() || '',
          partId: item[3] || '',
          description: item[4] || '',
          quantityOrder: item[5]?.toString() || '',
          quantityReceived: item[7]?.toString() || '',
          quantity: '',
          boxId: ''
        })))
      }
    } catch (error) {
      console.error('Error fetching PO data:', error)
      toast.error('Failed to fetch PO data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTableInputChange = (index: number, field: string, value: string, isAdditional: boolean = false) => {
    if (isAdditional) {
      const newData = [...additionalTableData]
      newData[index] = { ...newData[index], [field]: value }
      setAdditionalTableData(newData)
    } else {
      const newData = [...tableData]
      newData[index] = { ...newData[index], [field]: value }
      setTableData(newData)
    }
  }

  const handleAddRow = (isAdditional: boolean = false) => {
    if (isAdditional) {
      setAdditionalTableData([...additionalTableData, { itemNumber: '', partId: '', description: '', quantityOrder: '', quantityReceived: '', quantity: '', boxId: '' }])
    } else {
      setTableData([...tableData, { number: '', type: '', length: '', width: '', height: '', weight: '', location: '' }])
    }
  }

  const handleDeleteRow = (index: number, isAdditional: boolean = false) => {
    if (isAdditional) {
      setAdditionalTableData(additionalTableData.filter((_, i) => i !== index))
    } else {
      setTableData(tableData.filter((_, i) => i !== index))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: string, isAdditional: boolean = false) => {
    if (e.key === 'Tab' && !e.shiftKey && 
        index === (isAdditional ? additionalTableData.length : tableData.length) - 1 && 
        field === (isAdditional ? 'boxId' : 'location')) {
      e.preventDefault()
      handleAddRow(isAdditional)
      setTimeout(() => {
        const inputs = document.querySelectorAll(`input[name="${isAdditional ? 'itemNumber' : 'number'}"]`)
        const lastInput = inputs[inputs.length - 1] as HTMLInputElement
        lastInput?.focus()
      }, 0)
    }
  }

  const generatePDF = async () => {
    console.log('Generating PDF...');
    try {
      const doc = new jsPDF()
    
      // Set document properties
      doc.setProperties({
        title: `Material Receipt - ${formData.warehouseNumber}`,
        subject: 'Material Receipt',
        author: 'WMS Express',
        keywords: 'material, receipt, logistics',
        creator: 'WMS Express System'
      })

      // Generate QR code with error handling
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(formData.warehouseNumber)
        // Add QR code
        doc.addImage(qrCodeDataUrl, 'PNG', 170, 10, 30, 30)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
        // Fallback: Add text instead of QR code
        doc.setFontSize(10)
        doc.text(`WR: ${formData.warehouseNumber}`, 170, 20)
      }

      // Add title
      doc.setFontSize(24)
      doc.setTextColor(44, 62, 80) // Dark blue color
      doc.text('Material Receipt', 50, 30)

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
      addField("Warehouse Number:", formData.warehouseNumber, leftColumnX)
      addField("Client:", formData.client, leftColumnX)
      addField("PO#:", formData.po, leftColumnX)

      // Reset Y position for right column
      yPosition = 55

      // Right column
      addField("Receipt Date:", formData.receiptDate, rightColumnX)
      addField("Carrier:", formData.carrier, rightColumnX)
      addField("Tracking Number:", formData.tracking, rightColumnX)

      // Add box details table
      yPosition += 20
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

      // Add item details table
      const lastAutoTable = (doc as any).lastAutoTable;
      yPosition = lastAutoTable ? lastAutoTable.finalY + 20 : yPosition + 20;
      autoTable(doc, {
        startY: yPosition,
        head: [['Item #', 'Part ID', 'Description', 'Quantity Order', 'Quantity Received', 'Total Quantity', 'Box ID']],
        body: additionalTableData.map(row => Object.values(row)),
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
      doc.save(`material_receipt_${formData.warehouseNumber}.pdf`)
      console.log('PDF generated and saved successfully');
      toast.success('PDF generated and downloaded successfully.')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again or contact support.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log('Form submission started');
    
    // Format the data as required by the API
    const formattedData = [
      [formData.warehouseNumber, formData.client, ""], // wr_id, entered_by, notes
      ...additionalTableData.map(row => [
        formData.warehouseNumber,
        row.quantity,
        row.boxId,
        row.itemNumber
      ])
    ]

    try {
      console.log('Sending data to API...');
      const response = await fetch('https://4n2oiwjde1.execute-api.us-east-1.amazonaws.com/prod/putMR', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (response.ok) {
        console.log('API response successful');
        toast.success('Material Receipt submitted successfully!')
        console.log('Initiating PDF generation...');
        await generatePDF() // Generate and download PDF immediately after successful submission
        console.log('PDF generation completed');
      } else {
        console.log('API response not OK:', response.status);
        throw new Error('Failed to submit Material Receipt')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to submit Material Receipt. Please try again.')
    } finally {
      setIsLoading(false)
      console.log('Form submission process completed');
    }
  }

  useEffect(() => {
    console.log('Table Data Updated:', tableData)
    console.log('Additional Table Data Updated:', additionalTableData)
  }, [tableData, additionalTableData])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Material Receipt Form</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-card shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="warehouseNumber">
                Warehouse Number
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="warehouseNumber"
                type="text"
                name="warehouseNumber"
                value={formData.warehouseNumber}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="client">
                Client
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="client"
                type="text"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="receiptDate">
                Receipt Date Received
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="receiptDate"
                type="date"
                name="receiptDate"
                value={formData.receiptDate}
                onChange={handleInputChange}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="po">
                PO
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="po"
                type="text"
                name="po"
                value={formData.po}
                onChange={handleInputChange}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="carrier">
                Carrier
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="carrier"
                type="text"
                name="carrier"
                value={formData.carrier}
                onChange={handleInputChange}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="tracking">
                Tracking #
              </label>
              <input
                className="w-full p-2 border rounded-md"
                id="tracking"
                type="text"
                name="tracking"
                value={formData.tracking}
                onChange={handleInputChange}
                readOnly
              />
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <>
              <table className="w-full mb-4">
                <thead>
                  <tr>
                    <th className="text-left p-2">Number</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Length</th>
                    <th className="text-left p-2">Width</th>
                    <th className="text-left p-2">Height</th>
                    <th className="text-left p-2">Weight</th>
                    <th className="text-left p-2">Location</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      {Object.keys(row).map((key) => (
                        <td key={key} className="p-2">
                          <input
                            type="text"
                            name={key}
                            className="w-full p-1 border rounded-md"
                            value={row[key as keyof TableRow]}
                            onChange={(e) => handleTableInputChange(index, key, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, key)}
                          />
                        </td>
                      ))}
                      <td className="p-2">
                        <Button
                          type="button"
                          onClick={() => handleDeleteRow(index)}
                          variant="destructive"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mb-4">
                <Button type="button" onClick={() => handleAddRow()}>
                  Add Row
                </Button>
              </div>
              
              <table className="w-full mb-4">
                <thead>
                  <tr>
                    <th className="text-left p-2">Item #</th>
                    <th className="text-left p-2">Part ID</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Quantity Order</th>
                    <th className="text-left p-2">Quantity Received</th>
                    <th className="text-left p-2">Total Quantity</th>
                    <th className="text-left p-2">Box ID</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {additionalTableData.map((row, index) => (
                    <tr key={index}>
                      {Object.keys(row).map((key) => (
                        <td key={key} className="p-2">
                          <input
                            type="text"
                            name={`${key}Additional`}
                            className="w-full p-1 border rounded-md"
                            value={row[key as keyof AdditionalTableRow]}
                            onChange={(e) => handleTableInputChange(index, key, e.target.value, true)}
                            onKeyDown={(e) => handleKeyDown(e, index, key, true)}
                            readOnly={['itemNumber', 'partId', 'description', 'quantityOrder', 'quantityReceived'].includes(key)}
                          />
                        </td>
                      ))}
                      <td className="p-2">
                        <Button
                          type="button"
                          onClick={() => handleDeleteRow(index, true)}
                          variant="destructive"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mb-4">
                <Button type="button" onClick={() => handleAddRow(true)}>
                  Add Row
                </Button>
              </div>
              
              <div className="flex items-center justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  )
}