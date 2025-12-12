import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, TrendingDown, DollarSign, Users, AlertCircle } from 'lucide-react';

export function Reports() {
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });

  // Mock data for Negative Reviews
  const negativeReviews = [
    { id: 1, date: '2024-12-08', hotelName: 'Grand Hotel Paris', rating: 1, comment: 'Poor service, room was not clean upon arrival. Very disappointing experience.' },
    { id: 2, date: '2024-12-07', hotelName: 'Dubai Marina Resort', rating: 2, comment: 'Overpriced for the quality. Staff was unhelpful with our requests.' },
    { id: 3, date: '2024-12-05', hotelName: 'Sydney Harbour View', rating: 1, comment: 'Noise from construction nearby. Could not sleep well during entire stay.' },
    { id: 4, date: '2024-12-03', hotelName: 'Grand Hotel Paris', rating: 2, comment: 'Wifi did not work properly. Breakfast options were limited.' },
    { id: 5, date: '2024-12-01', hotelName: 'Tokyo Central Inn', rating: 1, comment: 'Room amenities were broken. Management did not respond to complaints.' },
  ];

  // Mock data for Exchange Rates History
  const exchangeRatesChart = [
    { date: 'Jan', USD: 35.5, EUR: 38.2, USDT: 35.8 },
    { date: 'Feb', USD: 36.1, EUR: 39.0, USDT: 36.3 },
    { date: 'Mar', USD: 37.2, EUR: 40.1, USDT: 37.5 },
    { date: 'Apr', USD: 38.8, EUR: 41.5, USDT: 39.0 },
    { date: 'May', USD: 40.2, EUR: 43.0, USDT: 40.5 },
    { date: 'Jun', USD: 41.5, EUR: 44.2, USDT: 41.8 },
  ];

  const exchangeRatesTable = [
    { currency: 'USD', current: 41.50, previous: 40.20, change: '+3.2%' },
    { currency: 'EUR', current: 44.20, previous: 43.00, change: '+2.8%' },
    { currency: 'USDT', current: 41.80, previous: 40.50, change: '+3.2%' },
  ];

  // Mock data for Operator Performance
  const operatorPerformance = [
    { rank: 1, operator: 'Premium Tours International', revenue: 245000, serviceCost: 180000, duration: '12 months' },
    { rank: 2, operator: 'Global Adventure Partners', revenue: 198000, serviceCost: 145000, duration: '12 months' },
    { rank: 3, operator: 'Luxury Travel Co.', revenue: 175000, serviceCost: 130000, duration: '10 months' },
    { rank: 4, operator: 'Express Tours Ltd.', revenue: 142000, serviceCost: 105000, duration: '12 months' },
    { rank: 5, operator: 'Budget Travel Agency', revenue: 98000, serviceCost: 75000, duration: '8 months' },
  ];

  // Mock data for Refunds Audit
  const refundsAudit = [
    { reservationId: 'RES-2024-1245', totalAmount: 5000, penalty: 500, refundAmount: 4500, processDate: '2024-12-10' },
    { reservationId: 'RES-2024-1198', totalAmount: 3200, penalty: 320, refundAmount: 2880, processDate: '2024-12-09' },
    { reservationId: 'RES-2024-1157', totalAmount: 7500, penalty: 750, refundAmount: 6750, processDate: '2024-12-08' },
    { reservationId: 'RES-2024-1089', totalAmount: 4300, penalty: 430, refundAmount: 3870, processDate: '2024-12-07' },
    { reservationId: 'RES-2024-1034', totalAmount: 6100, penalty: 610, refundAmount: 5490, processDate: '2024-12-06' },
    { reservationId: 'RES-2024-0987', totalAmount: 2800, penalty: 280, refundAmount: 2520, processDate: '2024-12-05' },
  ];

  // Mock data for Customer Demographics
  const averageAge = 42.5;
  const ageDistribution = [
    { range: '18-25', count: 120 },
    { range: '26-35', count: 280 },
    { range: '36-45', count: 340 },
    { range: '46-55', count: 260 },
    { range: '56-65', count: 180 },
    { range: '65+', count: 95 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[var(--color-text-primary)] mb-2">
          Reports Dashboard
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          View analytics and generate business reports
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="space-y-6">
        {/* Row 1: Negative Reviews + Customer Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Widget 1: Negative Reviews */}
          <div className="lg:col-span-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-[var(--color-text-primary)]">
                    Negative Reviews
                  </h2>
                  <p className="text-[var(--color-text-secondary)] text-sm">Recent 1-2 star feedback</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {negativeReviews.map(review => (
                  <div key={review.id} className="p-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[var(--color-text-primary)]">{review.hotelName}</p>
                        <p className="text-[var(--color-text-secondary)] text-sm">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-500">★</span>
                        ))}
                        {[...Array(5 - review.rating)].map((_, i) => (
                          <span key={i} className="text-gray-300">★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 5: Customer Demographics */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-[var(--color-text-primary)]">
                    Customer Demographics
                  </h2>
                  <p className="text-[var(--color-text-secondary)] text-sm">Age distribution analysis</p>
                </div>
              </div>
              
              {/* Date Range Picker */}
              <div className="space-y-2">
                <label className="block text-[var(--color-text-primary)] text-sm">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] text-sm"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Average Age Metric */}
              <div className="text-center mb-6 p-6 bg-purple-50 rounded-lg">
                <p className="text-[var(--color-text-secondary)] text-sm mb-2">Average Customer Age</p>
                <p className="text-purple-600 text-4xl mb-1">{averageAge}</p>
                <p className="text-[var(--color-text-secondary)] text-xs">years old</p>
              </div>

              {/* Age Distribution Bar Chart */}
              <div style={{ width: '300px', height: '192px' }}>
                <ResponsiveContainer width={300} height={192}>
                  <BarChart data={ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#9333ea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Exchange Rates History */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-[var(--color-text-primary)]">
                  Exchange Rates History
                </h2>
                <p className="text-[var(--color-text-secondary)] text-sm">USD, EUR, USDT vs VES (Venezuelan Bolívar)</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Line Chart */}
            <div style={{ width: '1000px', height: '256px', maxWidth: '100%' }}>
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={exchangeRatesChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="USD" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="EUR" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="USDT" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Exchange Rates Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[var(--color-text-primary)] text-sm">Currency</th>
                    <th className="px-4 py-3 text-left text-[var(--color-text-primary)] text-sm">Current Rate (VES)</th>
                    <th className="px-4 py-3 text-left text-[var(--color-text-primary)] text-sm">Previous Rate (VES)</th>
                    <th className="px-4 py-3 text-left text-[var(--color-text-primary)] text-sm">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {exchangeRatesTable.map(rate => (
                    <tr key={rate.currency} className="hover:bg-[var(--color-background)]">
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">{rate.currency}</td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">{rate.current.toFixed(2)}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{rate.previous.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="text-green-600">{rate.change}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Row 3: Operator Performance */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-blue-600 transform rotate-180" />
              </div>
              <div>
                <h2 className="text-[var(--color-text-primary)]">
                  Operator Performance
                </h2>
                <p className="text-[var(--color-text-secondary)] text-sm">Ranked by revenue generated</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Rank</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Tour Operator</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Revenue Generated</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Service Cost</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Net Profit</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {operatorPerformance.map(operator => {
                  const netProfit = operator.revenue - operator.serviceCost;
                  return (
                    <tr key={operator.rank} className="hover:bg-[var(--color-background)]">
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 bg-[var(--color-primary-blue)] text-white rounded-full flex items-center justify-center">
                          {operator.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-primary)]">{operator.operator}</td>
                      <td className="px-6 py-4 text-[var(--color-text-primary)]">${operator.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">${operator.serviceCost.toLocaleString()}</td>
                      <td className="px-6 py-4 text-green-600">${netProfit.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">{operator.duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 4: Refunds Audit */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-[var(--color-text-primary)]">
                  Refunds Audit
                </h2>
                <p className="text-[var(--color-text-secondary)] text-sm">Cancelled reservations and refund details</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Reservation ID</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Total Amount</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Penalty (10%)</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Refund Amount (90%)</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Process Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {refundsAudit.map(refund => (
                  <tr key={refund.reservationId} className="hover:bg-[var(--color-background)]">
                    <td className="px-6 py-4">
                      <span className="text-[var(--color-primary-blue)] font-mono text-sm">
                        {refund.reservationId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">
                      ${refund.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      -${refund.penalty.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      ${refund.refundAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                      {refund.processDate}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[var(--color-background)] border-t-2 border-[var(--color-border)]">
                <tr>
                  <td className="px-6 py-4 text-[var(--color-text-primary)]">Total</td>
                  <td className="px-6 py-4 text-[var(--color-text-primary)]">
                    ${refundsAudit.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-red-600">
                    -${refundsAudit.reduce((sum, r) => sum + r.penalty, 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-green-600">
                    ${refundsAudit.reduce((sum, r) => sum + r.refundAmount, 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}