import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import StatCard from '../../components/ui/StatCard';
import FormField from '../../components/forms/FormField';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useData } from '../../contexts/DataContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { feeStructure } from '../../data/fees';

const statusFilters = ['all', 'paid', 'pending', 'overdue', 'partial'];

function getStatusBadge(status) {
  return { paid: 'green', pending: 'gray', overdue: 'red', partial: 'yellow' }[status] || 'gray';
}

function getFeeSummary(fees, students) {
  let totalCollected = 0, totalPending = 0, totalOverdue = 0;
  students.forEach(s => {
    const sf = fees[s.id];
    if (!sf) return;
    sf.terms.forEach(t => {
      totalCollected += t.paid;
      if (t.status === 'pending' || t.status === 'partial') totalPending += t.balance;
      if (t.status === 'overdue') totalOverdue += t.balance;
    });
  });
  const totalExpected = students.length * feeStructure.total * 3;
  return {
    totalCollected,
    totalPending,
    totalOverdue,
    collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 1000) / 10 : 0,
  };
}

export default function FeesPage() {
  const { students, fees, updateFee } = useData();

  const [filter, setFilter]             = useState('all');
  const [receiptOpen, setReceiptOpen]   = useState(false);
  const [paymentOpen, setPaymentOpen]   = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paymentForm, setPaymentForm]   = useState({ amountPaid: '', paymentMode: 'Cash', paidDate: new Date().toISOString().slice(0,10) });
  const [payErr, setPayErr]             = useState('');
  const [saving, setSaving]             = useState(false);

  const summary = getFeeSummary(fees, students);

  const allRecords = students.flatMap(student => {
    const sf = fees[student.id];
    if (!sf) return [];
    return sf.terms.map((t, termIndex) => ({ ...t, student, termIndex }));
  });

  const filtered = filter === 'all' ? allRecords : allRecords.filter(r => r.status === filter);

  function openReceipt(record) {
    setSelectedRecord(record);
    setReceiptOpen(true);
  }

  function openPayment(record) {
    const remaining = record.balance;
    setSelectedRecord(record);
    setPaymentForm({ amountPaid: remaining, paymentMode: 'Cash', paidDate: new Date().toISOString().slice(0,10) });
    setPayErr('');
    setPaymentOpen(true);
  }

  function sendReminder(record) {
    toast.success(`Reminder sent to ${record.student.parentName} for ${record.term}`);
  }

  function handlePaymentChange(e) {
    setPaymentForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPayErr('');
  }

  function handleRecordPayment() {
    const amt = Number(paymentForm.amountPaid);
    if (!amt || amt <= 0) { setPayErr('Please enter a valid amount'); return; }
    if (amt > selectedRecord.balance) { setPayErr(`Amount exceeds balance of ${formatCurrency(selectedRecord.balance)}`); return; }
    setSaving(true);
    setTimeout(() => {
      updateFee(selectedRecord.student.id, selectedRecord.termIndex, paymentForm);
      toast.success(`Payment of ${formatCurrency(amt)} recorded for ${selectedRecord.student.name}`);
      setSaving(false);
      setPaymentOpen(false);
    }, 300);
  }

  return (
    <div>
      <PageHeader title="Fee Management" subtitle="Track collections, dues, and generate receipts" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Collected" value={formatCurrency(summary.totalCollected)} icon={CurrencyDollarIcon} iconColor="green" />
        <StatCard title="Pending" value={formatCurrency(summary.totalPending)} icon={CurrencyDollarIcon} iconColor="amber" />
        <StatCard title="Overdue" value={formatCurrency(summary.totalOverdue)} icon={CurrencyDollarIcon} iconColor="red" />
        <StatCard title="Collection Rate" value={`${summary.collectionRate}%`} icon={CurrencyDollarIcon} iconColor="blue">
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${summary.collectionRate}%` }} />
            </div>
          </div>
        </StatCard>
      </div>

      {/* Filter + Table */}
      <div className="page-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-wrap">
          {statusFilters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} records</span>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Student</th>
                <th className="table-th">Class</th>
                <th className="table-th">Term</th>
                <th className="table-th text-right">Amount</th>
                <th className="table-th text-right">Paid</th>
                <th className="table-th text-right">Balance</th>
                <th className="table-th">Due Date</th>
                <th className="table-th">Status</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.student.name} size="sm" />
                      <span className="font-medium text-sm">{r.student.name}</span>
                    </div>
                  </td>
                  <td className="table-td">{r.student.class}{r.student.section}</td>
                  <td className="table-td">{r.term}</td>
                  <td className="table-td text-right">{formatCurrency(r.amount)}</td>
                  <td className="table-td text-right text-emerald-600 font-medium">{formatCurrency(r.paid)}</td>
                  <td className="table-td text-right text-red-500 font-medium">{r.balance > 0 ? formatCurrency(r.balance) : '—'}</td>
                  <td className="table-td">{formatDate(r.dueDate)}</td>
                  <td className="table-td">
                    <Badge color={getStatusBadge(r.status)}>{r.status}</Badge>
                  </td>
                  <td className="table-td">
                    <div className="flex gap-1">
                      {r.status === 'paid' ? (
                        <button onClick={() => openReceipt(r)} className="btn-ghost text-xs">Receipt</button>
                      ) : (
                        <>
                          <button onClick={() => openPayment(r)} className="btn-ghost text-xs text-primary-600">Record Payment</button>
                          <button onClick={() => sendReminder(r)} className="btn-ghost text-xs text-amber-600">Remind</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {filtered.map((r, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar name={r.student.name} size="sm" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{r.student.name}</p>
                    <p className="text-xs text-gray-500">Class {r.student.class}{r.student.section} · {r.term}</p>
                  </div>
                </div>
                <Badge color={getStatusBadge(r.status)}>{r.status}</Badge>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Total: <strong>{formatCurrency(r.amount)}</strong></span>
                <span>Paid: <strong className="text-emerald-600">{formatCurrency(r.paid)}</strong></span>
                {r.balance > 0 && <span>Due: <strong className="text-red-500">{formatCurrency(r.balance)}</strong></span>}
              </div>
              <div className="flex gap-2">
                {r.status === 'paid'
                  ? <button onClick={() => openReceipt(r)} className="btn-secondary text-xs py-1 px-2">Receipt</button>
                  : <>
                      <button onClick={() => openPayment(r)} className="btn-primary text-xs py-1 px-2">Record Payment</button>
                      <button onClick={() => sendReminder(r)} className="btn-secondary text-xs py-1 px-2 text-amber-600">Remind</button>
                    </>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Fee Receipt" size="md">
        {selectedRecord && (
          <div>
            <div className="print-area">
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <div className="text-center border-b border-dashed border-gray-200 pb-4 mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">SA</span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg">Springfield Academy</h2>
                  <p className="text-xs text-gray-500">123 Academy Road, Springfield · +1-555-9999</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1 uppercase tracking-wider">Official Fee Receipt</p>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Receipt #: <strong className="text-gray-800">{selectedRecord.receiptNumber}</strong></span>
                  <span>Date: <strong className="text-gray-800">{formatDate(selectedRecord.paidDate)}</strong></span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                  <p><span className="text-gray-500">Student:</span> <strong>{selectedRecord.student.name}</strong></p>
                  <p className="mt-0.5"><span className="text-gray-500">Class:</span> {selectedRecord.student.class}{selectedRecord.student.section} · Roll #{selectedRecord.student.rollNumber}</p>
                  <p className="mt-0.5"><span className="text-gray-500">Term:</span> {selectedRecord.term} · Academic Year 2025–26</p>
                </div>
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-1.5 text-xs text-gray-500 font-medium">Description</th>
                      <th className="text-right py-1.5 text-xs text-gray-500 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(feeStructure).filter(([k]) => k !== 'total').map(([key, val]) => (
                      <tr key={key} className="border-b border-gray-50">
                        <td className="py-1.5 capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</td>
                        <td className="py-1.5 text-right text-gray-700">{formatCurrency(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td className="pt-2 font-bold text-gray-900">Total</td>
                      <td className="pt-2 text-right font-bold text-gray-900">{formatCurrency(feeStructure.total)}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Payment via: <strong>{selectedRecord.paymentMode}</strong></p>
                  <div className="bg-emerald-100 border-2 border-emerald-500 rounded-lg px-4 py-1.5 rotate-[-8deg]">
                    <p className="text-emerald-700 font-black text-lg tracking-widest">PAID</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4 no-print">
              <button onClick={() => window.print()} className="btn-primary flex-1 justify-center">Print Receipt</button>
              <button onClick={() => setReceiptOpen(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record Payment" size="sm">
        {selectedRecord && (
          <div>
            <div className="p-3 bg-gray-50 rounded-xl mb-4">
              <p className="text-sm font-medium text-gray-900">{selectedRecord.student.name} — {selectedRecord.term}</p>
              <p className="text-xs text-gray-500 mt-0.5">Balance due: <strong className="text-red-600">{formatCurrency(selectedRecord.balance)}</strong></p>
            </div>

            <div className="space-y-3">
              <FormField label="Amount Paid" required error={payErr}>
                <input
                  name="amountPaid"
                  type="number"
                  min="1"
                  max={selectedRecord.balance}
                  className="input"
                  value={paymentForm.amountPaid}
                  onChange={handlePaymentChange}
                  placeholder="0"
                />
              </FormField>
              <FormField label="Payment Method">
                <select name="paymentMode" className="select" value={paymentForm.paymentMode} onChange={handlePaymentChange}>
                  <option>Cash</option>
                  <option>Online Transfer</option>
                  <option>Credit Card</option>
                  <option>Cheque</option>
                  <option>UPI</option>
                </select>
              </FormField>
              <FormField label="Payment Date">
                <input name="paidDate" type="date" className="input" value={paymentForm.paidDate} onChange={handlePaymentChange} />
              </FormField>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setPaymentOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleRecordPayment} disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Record Payment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
