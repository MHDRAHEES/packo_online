import type { Order, Product } from '@/lib/types'
import { formatCurrency } from '@/lib/format'

/**
 * Clean helper to sanitize values for CSV string formatting
 */
function sanitizeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

/**
 * Export Admin Orders data to Excel (.csv format with UTF-8 BOM)
 */
export function exportOrdersToExcel(orders: Order[], filename = 'Packo_Admin_Orders_Report.csv') {
  const headers = [
    'Order ID',
    'Date',
    'Customer Name',
    'Customer Email',
    'Phone',
    'Address',
    'City',
    'State',
    'Postal Code',
    'Payment Method',
    'Is Paid',
    'Total Amount (INR)',
    'Order Status',
    'Item Count',
    'Items Summary',
  ]

  const rows = orders.map((order) => {
    const itemsSummary = Array.isArray(order.items)
      ? order.items.map((i) => `${i.product?.name || 'Product'} (x${i.quantity})`).join('; ')
      : ''

    return [
      order.id || order._id || '',
      new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      order.customer?.name || order.user?.name || 'Customer',
      order.customer?.email || order.user?.email || '',
      order.customer?.phone || '',
      order.customer?.address || '',
      order.customer?.city || '',
      order.customer?.state || '',
      order.customer?.zip || '',
      (order.paymentMethod || 'razorpay').toUpperCase(),
      order.isPaid ? 'YES' : 'NO',
      order.total || order.totalPrice || 0,
      order.orderStatus || 'Processing',
      Array.isArray(order.items) ? order.items.length : 0,
      itemsSummary,
    ].map(sanitizeCsvValue)
  })

  // Add UTF-8 BOM for Microsoft Excel compatibility
  const csvContent = '\uFEFF' + [headers.map(sanitizeCsvValue).join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export Admin Products Catalog to Excel (.csv)
 */
export function exportProductsToExcel(products: Product[], filename = 'Packo_Product_Catalog.csv') {
  const headers = [
    'Product ID',
    'Product Name',
    'Category',
    'Price (INR)',
    'Discount Price (INR)',
    'In Stock',
    'Stock Count',
    'Rating',
    'Image URL',
  ]

  const rows = products.map((p) =>
    [
      p.id || p._id || '',
      p.name || '',
      p.category || '',
      p.price || 0,
      p.discountPrice || 0,
      p.inStock ? 'YES' : 'NO',
      p.stockCount ?? p.stock ?? 0,
      p.rating || 0,
      p.image || '',
    ].map(sanitizeCsvValue)
  )

  const csvContent = '\uFEFF' + [headers.map(sanitizeCsvValue).join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generate Printable PDF Report Window for Admin Dashboard Data
 */
export function exportOrdersToPDF(
  orders: Order[],
  metrics: {
    totalRevenue: number
    totalOrders: number
    deliveredCount: number
    shippedCount: number
    processingCount: number
    cancelledCount: number
  }
) {
  const printWindow = window.open('', '_blank', 'width=1100,height=850')
  if (!printWindow) {
    alert('Please allow popups to generate and view the PDF report.')
    return
  }

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const rowsHtml = orders
    .map(
      (o, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; font-size: 11px;">
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #0f172a;">#${o.id || o._id}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #475569;">${new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #0f172a;">${o.customer?.name || o.user?.name || 'Customer'}</strong><br/>
          <span style="color: #64748b; font-size: 10px;">${o.customer?.email || o.user?.email || ''}</span>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 10px; font-weight: 600;">${o.paymentMethod || 'Razorpay'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${formatCurrency(o.total || o.totalPrice || 0)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">
          <span style="
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            color: ${
              o.orderStatus === 'Delivered'
                ? '#166534'
                : o.orderStatus === 'Shipped'
                ? '#1e40af'
                : o.orderStatus === 'Cancelled'
                ? '#991b1b'
                : '#92400e'
            };
            background-color: ${
              o.orderStatus === 'Delivered'
                ? '#dcfce7'
                : o.orderStatus === 'Shipped'
                ? '#dbeafe'
                : o.orderStatus === 'Cancelled'
                ? '#ffe4e6'
                : '#fef3c7'
            };
          ">${o.orderStatus || 'Processing'}</span>
        </td>
      </tr>
    `
    )
    .join('')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Packo.ofc Admin Executive Sales Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 30px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f5132; padding-bottom: 15px; margin-bottom: 25px; }
          .logo { font-size: 24px; font-weight: 900; color: #0f5132; letter-spacing: -0.5px; }
          .sub { font-size: 11px; color: #64748b; margin-top: 4px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; text-align: center; }
          .card-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
          .card-val { font-size: 18px; font-weight: 800; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #0f5132; color: #ffffff; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background-color: #0f5132; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="logo">Packo.ofc — Store Admin Report</div>
            <div class="sub">Generated on: ${dateStr}</div>
          </div>
          <div style="text-align: right;">
            <span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold;">Official Business Report</span>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="card">
            <div class="card-title">Total Revenue</div>
            <div class="card-val" style="color: #0f5132;">${formatCurrency(metrics.totalRevenue)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Orders</div>
            <div class="card-val">${metrics.totalOrders}</div>
          </div>
          <div class="card">
            <div class="card-title">Delivered</div>
            <div class="card-val" style="color: #166534;">${metrics.deliveredCount}</div>
          </div>
          <div class="card">
            <div class="card-title">Processing</div>
            <div class="card-val" style="color: #d97706;">${metrics.processingCount}</div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 10px;">Itemized Orders History</h3>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Confidential Store Management Report • Generated automatically by Packo.ofc Admin Portal
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          }
        </script>
      </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
