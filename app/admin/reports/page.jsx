"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Download, FileDown, Calendar, DollarSign, Users, Package, TrendingUp, FileText, Loader2 } from "lucide-react"
import { getAllBookings } from "@/lib/bookings"
import { getAllPackages } from "@/lib/packages"
import { generateRevenueAnalytics } from "@/lib/geminiAnalytics"

export default function AdminReports() {
  const searchParams = useSearchParams()
  const typeParam = searchParams?.get('type')
  
  const [selectedReport, setSelectedReport] = useState(typeParam || "sales")
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeCustomers: 0,
    avgBookingValue: 0
  })

  // Update selected report when URL parameter changes and auto-generate
  useEffect(() => {
    if (typeParam && typeParam !== selectedReport) {
      setSelectedReport(typeParam)
      // Reset report data when switching reports
      setReportData(null)
      setAnalytics(null)
    }
  }, [typeParam])

  // Auto-generate report when selectedReport changes
  useEffect(() => {
    if (selectedReport) {
      generateReport()
    }
  }, [selectedReport])

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const bookingsResult = await getAllBookings()

      if (bookingsResult.success) {
        const bookings = bookingsResult.bookings
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
        
        const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
        const uniqueCustomers = new Set(bookings.map(b => b.user_id)).size
        const avgValue = confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0

        setStats({
          totalRevenue,
          totalBookings: bookings.length,
          activeCustomers: uniqueCustomers,
          avgBookingValue: avgValue
        })
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  // Generate report based on selection
  const generateReport = async () => {
    setLoading(true)
    try {
      const bookingsResult = await getAllBookings()
      const packagesResult = await getAllPackages()

      if (bookingsResult.success) {
        switch (selectedReport) {
          case "sales":
            setReportData(generateSalesReport(bookingsResult.bookings))
            break
          case "bookings":
            setReportData(generateBookingsReport(bookingsResult.bookings))
            break
          case "customers":
            setReportData(generateCustomersReport(bookingsResult.bookings))
            break
          case "packages":
            setReportData(generatePackagesReport(packagesResult, bookingsResult.bookings))
            break
          case "revenue":
            try {
              const analyticsData = await generateRevenueAnalytics(bookingsResult.bookings)
              setAnalytics(analyticsData)
            } catch (error) {
              console.error('Error generating AI analytics:', error)
              setAnalytics(null)
            }
            setReportData(generateRevenueReport(bookingsResult.bookings))
            break
          case "custom":
            setReportData(generateCustomReport(bookingsResult.bookings))
            break
        }
      }
    } catch (err) {
      console.error('Error generating report:', err)
    } finally {
      setLoading(false)
    }
  }

  // Report generators
  const generateSalesReport = (bookings) => {
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
    return {
      title: "Sales Report",
      headers: ["Date", "Booking ID", "Customer", "Package", "Amount", "Payment Status"],
      rows: confirmedBookings.map(b => [
        new Date(b.created_at).toLocaleDateString(),
        b.booking_number,
        `${b.user?.first_name} ${b.user?.last_name}`,
        b.package?.title,
        `₱${b.total_amount?.toLocaleString()}`,
        b.payment_status
      ]),
      summary: {
        totalSales: confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        count: confirmedBookings.length
      }
    }
  }

  const generateBookingsReport = (bookings) => {
    return {
      title: "Booking Report",
      headers: ["Booking ID", "Date", "Customer", "Package", "Status", "Check-in", "Guests"],
      rows: bookings.map(b => [
        b.booking_number,
        new Date(b.created_at).toLocaleDateString(),
        `${b.user?.first_name} ${b.user?.last_name}`,
        b.package?.title,
        b.status,
        new Date(b.check_in_date).toLocaleDateString(),
        b.number_of_guests
      ]),
      summary: {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      }
    }
  }

  const generateCustomersReport = (bookings) => {
    const customerMap = new Map()
    
    bookings.forEach(b => {
      if (b.user_id) {
        if (!customerMap.has(b.user_id)) {
          customerMap.set(b.user_id, {
            name: `${b.user?.first_name} ${b.user?.last_name}`,
            email: b.user?.email,
            phone: b.user?.phone,
            bookings: 0,
            totalSpent: 0
          })
        }
        const customer = customerMap.get(b.user_id)
        customer.bookings++
        customer.totalSpent += b.total_amount || 0
      }
    })

    const customers = Array.from(customerMap.values())
    
    return {
      title: "Customer Report",
      headers: ["Customer Name", "Email", "Phone", "Total Bookings", "Total Spent"],
      rows: customers.map(c => [
        c.name,
        c.email,
        c.phone || 'N/A',
        c.bookings,
        `₱${c.totalSpent.toLocaleString()}`
      ]),
      summary: {
        totalCustomers: customers.length,
        avgBookingsPerCustomer: (customers.reduce((sum, c) => sum + c.bookings, 0) / customers.length).toFixed(1),
        avgSpendPerCustomer: Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length)
      }
    }
  }

  const generatePackagesReport = (packages, bookings) => {
    const packageStats = packages.map(pkg => {
      const pkgBookings = bookings.filter(b => b.package_id === pkg.id)
      const revenue = pkgBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      
      return {
        title: pkg.title,
        location: pkg.location,
        bookings: pkgBookings.length,
        revenue: revenue,
        avgRating: pkg.rating || 0
      }
    })

    return {
      title: "Package Performance Report",
      headers: ["Package Name", "Location", "Total Bookings", "Revenue", "Avg Rating"],
      rows: packageStats.map(p => [
        p.title,
        p.location,
        p.bookings,
        `₱${p.revenue.toLocaleString()}`,
        p.avgRating.toFixed(1)
      ]),
      summary: {
        totalPackages: packages.length,
        totalBookings: packageStats.reduce((sum, p) => sum + p.bookings, 0),
        totalRevenue: packageStats.reduce((sum, p) => sum + p.revenue, 0)
      }
    }
  }

  const generateRevenueReport = (bookings) => {
    const monthlyRevenue = {}
    
    bookings.forEach(b => {
      if (b.status === 'confirmed') {
        const month = new Date(b.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.total_amount || 0)
      }
    })

    return {
      title: "Revenue Analytics",
      headers: ["Month", "Revenue", "Bookings", "Avg Order Value"],
      rows: Object.entries(monthlyRevenue).map(([month, revenue]) => {
        const monthBookings = bookings.filter(b => 
          new Date(b.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) === month &&
          b.status === 'confirmed'
        )
        return [
          month,
          `₱${revenue.toLocaleString()}`,
          monthBookings.length,
          `₱${Math.round(revenue / monthBookings.length).toLocaleString()}`
        ]
      }),
      summary: {
        totalRevenue: Object.values(monthlyRevenue).reduce((sum, r) => sum + r, 0),
        months: Object.keys(monthlyRevenue).length
      }
    }
  }

  const generateCustomReport = (bookings) => {
    return {
      title: "Custom Report",
      headers: ["Metric", "Value"],
      rows: [
        ["Total Bookings", bookings.length],
        ["Confirmed Bookings", bookings.filter(b => b.status === 'confirmed').length],
        ["Pending Bookings", bookings.filter(b => b.status === 'pending').length],
        ["Cancelled Bookings", bookings.filter(b => b.status === 'cancelled').length],
        ["Total Revenue", `₱${bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.total_amount || 0), 0).toLocaleString()}`]
      ]
    }
  }

  // Download report as CSV
  const downloadCSV = () => {
    if (!reportData) return

    const csvContent = [
      reportData.headers.join(','),
      ...reportData.rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Download report as PDF
  const downloadPDF = async () => {
    if (!reportData) return

    // Dynamically import pdfMake
    const pdfMake = (await import('pdfmake/build/pdfmake')).default
    const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default
    
    // Set fonts
    if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
      pdfMake.vfs = pdfFonts.pdfMake.vfs
    }

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],
      header: function(currentPage, pageCount) {
        return {
          text: `${reportData.title} - Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          margin: [0, 20, 0, 0],
          fontSize: 10,
          color: '#666'
        }
      },
      footer: function(currentPage, pageCount) {
        return {
          text: `Generated on ${new Date().toLocaleString()} | Xplorex Reports`,
          alignment: 'center',
          margin: [0, 0, 0, 20],
          fontSize: 8,
          color: '#999'
        }
      },
      content: [
        {
          text: reportData.title,
          style: 'header',
          margin: [0, 0, 0, 20]
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#1f2937'
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
          color: '#4b5563'
        },
        aiInsights: {
          fontSize: 10,
          italics: true,
          color: '#6366f1',
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'black',
          fillColor: '#ffffff',
          alignment: 'center'
        }
      },
      defaultStyle: {
        fontSize: 9,
        alignment: 'center'
      }
    }

    // Add AI insights for Revenue Analytics
    if (selectedReport === "revenue" && analytics) {
      docDefinition.content.push({
        text: '🤖 AI-Powered Insights (Gemini)',
        style: 'subheader'
      })
      docDefinition.content.push({
        text: analytics,
        style: 'aiInsights'
      })
    }

    // Add table
    docDefinition.content.push({
      alignment: 'center',
      table: {
        headerRows: 1,
        widths: Array(reportData.headers.length).fill('auto'),
        body: [
          reportData.headers.map(h => ({ text: h, style: 'tableHeader' })),
          ...reportData.rows.map(row => row.map(cell => ({ text: cell.toString(), alignment: 'center' })))
        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex === 0) ? '#ffffff' : null
        },
        hLineWidth: function () { return 1 },
        vLineWidth: function () { return 1 },
        hLineColor: function () { return '#000000' },
        vLineColor: function () { return '#000000' }
      }
    })

    // Generate and download PDF
    pdfMake.createPdf(docDefinition).download(
      `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    )
  }

  const reportTypes = [
    { value: "sales", label: "Sales Report", icon: DollarSign, color: "green" },
    { value: "bookings", label: "Booking Report", icon: Calendar, color: "blue" },
    { value: "customers", label: "Customer Report", icon: Users, color: "purple" },
    { value: "packages", label: "Package Performance", icon: Package, color: "orange" },
    { value: "revenue", label: "Revenue Analytics", icon: TrendingUp, color: "indigo" },
    { value: "custom", label: "Custom Report", icon: FileText, color: "pink" }
  ]

  const selectedReportObj = reportTypes.find(r => r.value === selectedReport)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and download comprehensive business reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Total Revenue (2025)</p>
            <p className="text-3xl font-bold text-gray-900">₱{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-2">+12.5%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Total Bookings (2025)</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            <p className="text-sm text-green-600 mt-2">+8.2%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Active Customers</p>
            <p className="text-3xl font-bold text-gray-900">{stats.activeCustomers.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-2">+15.3%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Avg. Booking Value</p>
            <p className="text-3xl font-bold text-gray-900">₱{Math.round(stats.avgBookingValue).toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-2">+5.7%</p>
          </div>
        </div>

        {/* Report Header & Generate Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedReportObj && (
                <>
                  <div className={`w-12 h-12 bg-${selectedReportObj.color}-100 rounded-lg flex items-center justify-center`}>
                    <selectedReportObj.icon className={`text-${selectedReportObj.color}-600`} size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedReportObj.label}</h2>
                    <p className="text-sm text-gray-600">
                      {selectedReport === "sales" && "Detailed breakdown of all sales and revenue"}
                      {selectedReport === "bookings" && "Complete booking history and statistics"}
                      {selectedReport === "customers" && "Customer demographics and behavior analysis"}
                      {selectedReport === "packages" && "Performance metrics for each travel package"}
                      {selectedReport === "revenue" && "In-depth revenue analysis with AI insights"}
                      {selectedReport === "custom" && "Generate custom reports with specific parameters"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="animate-spin" size={20} />
                <span>Generating report...</span>
              </div>
            )}
          </div>
        </div>

        {/* Report Display */}
        {reportData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{reportData.title}</h3>
              <div className="flex gap-3">
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText size={18} />
                  Download CSV
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FileDown size={18} />
                  Download PDF
                </button>
              </div>
            </div>

            {/* AI Analytics (Revenue Report Only) */}
            {selectedReport === "revenue" && analytics && (
              <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-white" size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-indigo-900 mb-2">🤖 AI-Powered Insights (Gemini)</h4>
                    <p className="text-sm text-indigo-800 whitespace-pre-line">{analytics}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {reportData.headers.map((header, i) => (
                      <th key={i} className="text-left py-3 px-4 font-semibold text-gray-700">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      {row.map((cell, j) => (
                        <td key={j} className="py-3 px-4 text-gray-600">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {reportData.summary && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(reportData.summary).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-xl font-bold text-gray-900">
                        {typeof value === 'number' && (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('spent') || key.toLowerCase().includes('value') || key.toLowerCase().includes('sales'))
                          ? `₱${value.toLocaleString()}`
                          : value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!reportData && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Report Generated</h3>
            <p className="text-gray-600">Select a report type from the sidebar to view data</p>
          </div>
        )}
      </div>
    </div>
  )
}
