"use client"

import { Download, TrendingUp, DollarSign, Users, Package, Calendar, FileText } from "lucide-react"

export default function AdminReports() {
  const reportTypes = [
    {
      title: "Sales Report",
      description: "Detailed breakdown of all sales and revenue",
      icon: DollarSign,
      color: "bg-green-500",
      period: "Monthly, Quarterly, Yearly",
    },
    {
      title: "Booking Report",
      description: "Complete booking history and statistics",
      icon: Calendar,
      color: "bg-blue-500",
      period: "Daily, Weekly, Monthly",
    },
    {
      title: "Customer Report",
      description: "Customer demographics and behavior analysis",
      icon: Users,
      color: "bg-purple-500",
      period: "Monthly, Yearly",
    },
    {
      title: "Package Performance",
      description: "Performance metrics for each travel package",
      icon: Package,
      color: "bg-orange-500",
      period: "Monthly, Quarterly",
    },
    {
      title: "Revenue Analytics",
      description: "In-depth revenue analysis and trends",
      icon: TrendingUp,
      color: "bg-indigo-500",
      period: "Monthly, Quarterly, Yearly",
    },
    {
      title: "Custom Report",
      description: "Generate custom reports with specific parameters",
      icon: FileText,
      color: "bg-pink-500",
      period: "Custom Date Range",
    },
  ]

  const quickStats = [
    { label: "Total Revenue (2025)", value: "$124,500", change: "+12.5%" },
    { label: "Total Bookings (2025)", value: "48", change: "+8.2%" },
    { label: "Active Customers", value: "1,234", change: "+15.3%" },
    { label: "Avg. Booking Value", value: "$2,594", change: "+5.7%" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and download comprehensive business reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm font-semibold text-green-600">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Types */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Reports</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report, index) => {
            const Icon = report.icon
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 transition group">
                <div className={`${report.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                <div className="text-xs text-gray-500 mb-6">Available: {report.period}</div>
                <button className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-semibold group-hover:scale-105">
                  <Download size={18} />
                  Generate Report
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Reports</h2>
        <div className="space-y-4">
          {[
            { name: "Sales Report - January 2025", date: "2025-02-01", size: "2.4 MB", format: "PDF" },
            { name: "Booking Report - Q4 2024", date: "2025-01-15", size: "1.8 MB", format: "Excel" },
            { name: "Customer Report - 2024", date: "2025-01-05", size: "3.2 MB", format: "PDF" },
          ].map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-500">
                    Generated on {report.date} • {report.size} • {report.format}
                  </p>
                </div>
              </div>
              <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition flex items-center gap-2 font-semibold">
                <Download size={16} />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
