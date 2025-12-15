import React, { useState, useEffect } from 'react';
import { getNegativeReviews, getExchangeRatesHistory, getOperatorPerformance, getRefundsAudit, getCustomerAgeDistribution, getCustomerAverageAge } from '../services/database';
import { FileText, Download, TrendingDown, DollarSign, Users, AlertCircle, Award } from 'lucide-react';

interface NegativeReview {
  hotelName: string;
  date: string;
  rating: number;
  comment: string;
}

interface ExchangeRate {
  p_fecha: string;
  p_moneda: string;
  p_tasa_bs: number;
}

interface OperatorPerformance {
  rank: number;
  operator: string;
  revenue: number;
  serviceCost: number;
}

interface RefundAudit {
  reservationId: number;
  totalAmount: number;
  penalty: number;
  refundAmount: number;
}

interface AgeDistribution {
  range: string;
  count: number;
}

export function Reports() {
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [loading, setLoading] = useState(false);

  // Data state
  const [negativeReviews, setNegativeReviews] = useState<NegativeReview[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [operatorPerformance, setOperatorPerformance] = useState<OperatorPerformance[]>([]);
  const [refundsAudit, setRefundsAudit] = useState<RefundAudit[]>([]);
  const [ageDistribution, setAgeDistribution] = useState<AgeDistribution[]>([]);
  const [averageAge, setAverageAge] = useState<number>(0);

  // Fetch data on mount or date change
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [neg, rates, ops, refunds, ageDist, avgAge] = await Promise.all([
          getNegativeReviews(dateRange.start, dateRange.end).catch(() => []),
          getExchangeRatesHistory(dateRange.start, dateRange.end).catch(() => []),
          getOperatorPerformance(dateRange.start, dateRange.end).catch(() => []),
          getRefundsAudit(dateRange.start, dateRange.end).catch(() => []),
          getCustomerAgeDistribution(dateRange.start, dateRange.end).catch(() => []),
          getCustomerAverageAge(dateRange.start, dateRange.end).catch(() => 0),
        ]);
        if (!mounted) return;
        setNegativeReviews(neg || []);
        setExchangeRates(rates || []);
        setOperatorPerformance(ops || []);
        setRefundsAudit(refunds || []);
        setAgeDistribution(ageDist || []);
        setAverageAge(Number(avgAge) || 0);
      } catch (err: any) {
        console.error('Failed to load reports', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [dateRange.start, dateRange.end]);

  const generatePDF = async (reportType: string) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();

      // Header Helper
      const addHeader = (title: string) => {
        doc.setFontSize(20);
        doc.text(title, 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
        doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 14, 32);
        return 40; // startY
      };

      if (reportType === 'negative_reviews') {
        const y = addHeader('Negative Reviews Report');
        doc.text('Reviews with rating <= 2 stars', 14, y - 5);
        autoTable(doc, {
          startY: y,
          head: [['Hotel', 'Date', 'Rating', 'Comment']],
          body: negativeReviews.map((r: NegativeReview) => [r.hotelName, r.date, r.rating, r.comment]),
        });
        if (negativeReviews.length === 0) {
          doc.text('No data available for this period.', 14, y + 10);
        }
        doc.save('negative_reviews.pdf');
      }
      else if (reportType === 'exchange_rates') {
        const y = addHeader('Exchange Rates History');
        autoTable(doc, {
          startY: y,
          head: [['Date', 'Currency', 'Rate (Bs)']],
          body: exchangeRates.map((r: ExchangeRate) => [new Date(r.p_fecha).toLocaleDateString(), r.p_moneda, Number(r.p_tasa_bs).toFixed(2)]),
        });
        if (exchangeRates.length === 0) {
          doc.text('No data available for this period.', 14, y + 10);
        }
        doc.save('exchange_rates.pdf');
      }
      else if (reportType === 'operator_performance') {
        const y = addHeader('Operator Performance Report');
        autoTable(doc, {
          startY: y,
          head: [['Rank', 'Operator', 'Revenue', 'Cost', 'Net Profit']],
          body: operatorPerformance.map((o: OperatorPerformance) => [
            o.rank,
            o.operator,
            `$${Number(o.revenue).toLocaleString()}`,
            `$${Number(o.serviceCost).toLocaleString()}`,
            `$${(Number(o.revenue) - Number(o.serviceCost)).toLocaleString()}`
          ]),
        });
        if (operatorPerformance.length === 0) {
          doc.text('No data available for this period.', 14, y + 10);
        }
        doc.save('operator_performance.pdf');
      }
      else if (reportType === 'refunds_audit') {
        const y = addHeader('Refunds Audit Report');
        autoTable(doc, {
          startY: y,
          head: [['ID', 'Total', 'Penalty', 'Refund', 'Date']],
          body: refundsAudit.map((r: RefundAudit) => [
            r.reservationId,
            `$${Number(r.totalAmount).toLocaleString()}`,
            `-$${Number(r.penalty).toLocaleString()}`,
            `$${Number(r.refundAmount).toLocaleString()}`,
            new Date().toLocaleDateString()
          ]),
        });
        if (refundsAudit.length === 0) {
          doc.text('No data available for this period.', 14, y + 10);
        }
        doc.save('refunds_audit.pdf');
      }
      else if (reportType === 'demographics') {
        const y = addHeader('Customer Demographics Report');
        doc.setFontSize(12);
        doc.text(`Average Customer Age: ${averageAge} years`, 14, y);

        autoTable(doc, {
          startY: y + 10,
          head: [['Age Range', 'Count']],
          body: ageDistribution.map((a: AgeDistribution) => [a.range, a.count]),
        });
        if (ageDistribution.length === 0) {
          doc.text('No data available for this period.', 14, y + 25);
        }
        doc.save('customer_demographics.pdf');
      }

    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      alert('Error generating PDF. Please check console.');
    }
  };

  const reportsList = [
    {
      id: 'negative_reviews',
      title: 'Negative Reviews',
      description: 'Detailed list of hotel reviews with 1 or 2 stars.',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      count: negativeReviews.length
    },
    {
      id: 'exchange_rates',
      title: 'Exchange Rates History',
      description: 'Historical fluctuation of USD, EUR, and USDT vs VES.',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      count: exchangeRates.length
    },
    {
      id: 'operator_performance',
      title: 'Operator Performance',
      description: 'Ranking of tour and transport operators by revenue.',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      count: operatorPerformance.length
    },
    {
      id: 'refunds_audit',
      title: 'Refunds Audit',
      description: 'Log of cancelled reservations and processed refunds.',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      count: refundsAudit.length
    },
    {
      id: 'demographics',
      title: 'Customer Demographics',
      description: 'Age distribution and average age of your user base.',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      count: `${averageAge} avg`
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Reports Center</h1>
        <p className="text-[var(--color-text-secondary)]">Generate and download official business reports.</p>
      </div>

      {/* Date Filter */}
      <div className="bg-[var(--color-card)] p-4 rounded-lg border border-[var(--color-border)] mb-8 flex items-center gap-4 max-w-2xl">
        <FileText className="text-[var(--color-text-secondary)]" />
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-secondary)] mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsList.map((report: { id: string; title: string; description: string; icon: any; color: string; bgColor: string; count: number | string }) => (
          <div key={report.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${report.bgColor} rounded-lg flex items-center justify-center`}>
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <span className="bg-[var(--color-background)] text-[var(--color-text-secondary)] text-xs px-2 py-1 rounded-full border border-[var(--color-border)]">
                {report.count} records
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{report.title}</h3>
            <p className="text-[var(--color-text-secondary)] text-sm mb-6 h-10">{report.description}</p>

            <button
              onClick={() => generatePDF(report.id)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary-blue)] hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}