export const feeStructure = {
  tuitionFee: 15000,
  transportFee: 3000,
  labFee: 1500,
  libraryFee: 500,
  sportsFee: 1000,
  total: 21000,
};

// Status: 'paid' | 'partial' | 'pending' | 'overdue'
const feeStatuses = {
  s1:  ['paid', 'paid', 'pending'],
  s2:  ['paid', 'paid', 'paid'],
  s3:  ['paid', 'paid', 'pending'],
  s4:  ['paid', 'paid', 'paid'],
  s5:  ['paid', 'paid', 'pending'],
  s6:  ['paid', 'paid', 'paid'],
  s7:  ['paid', 'partial', 'overdue'],
  s8:  ['paid', 'paid', 'pending'],
  s9:  ['paid', 'paid', 'paid'],
  s10: ['paid', 'paid', 'pending'],
  s11: ['paid', 'paid', 'paid'],
  s12: ['paid', 'paid', 'pending'],
  s13: ['paid', 'overdue', 'overdue'],
  s14: ['paid', 'paid', 'paid'],
  s15: ['paid', 'paid', 'pending'],
  s16: ['paid', 'paid', 'paid'],
  s17: ['paid', 'partial', 'pending'],
  s18: ['paid', 'paid', 'paid'],
  s19: ['paid', 'paid', 'pending'],
  s20: ['paid', 'paid', 'overdue'],
};

const termDates = [
  { term: 'Term 1', dueDate: '2025-07-15', paidDate: '2025-07-10', mode: 'Online Transfer' },
  { term: 'Term 2', dueDate: '2025-12-15', paidDate: '2025-12-12', mode: 'Credit Card' },
  { term: 'Term 3', dueDate: '2026-03-31', paidDate: null, mode: null },
];

let receiptCounter = 1;

function buildTermRecord(termIndex, status, studentId) {
  const tinfo = termDates[termIndex];
  const rnum = `RCP-2025-${String(receiptCounter++).padStart(3, '0')}`;
  const paid = status === 'paid' ? feeStructure.total
    : status === 'partial' ? Math.round(feeStructure.total * 0.5)
    : 0;
  return {
    term: tinfo.term,
    dueDate: tinfo.dueDate,
    amount: feeStructure.total,
    paid,
    balance: feeStructure.total - paid,
    status,
    paidDate: status === 'paid' ? tinfo.paidDate : status === 'partial' ? tinfo.paidDate : null,
    receiptNumber: status === 'paid' ? rnum : null,
    paymentMode: status === 'paid' ? tinfo.mode : null,
  };
}

export const feesByStudent = Object.entries(feeStatuses).reduce((acc, [sid, statuses]) => {
  acc[sid] = {
    studentId: sid,
    academicYear: '2025-26',
    terms: statuses.map((status, i) => buildTermRecord(i, status, sid)),
  };
  return acc;
}, {});

export function getFeeSummary() {
  let totalCollected = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  Object.values(feesByStudent).forEach(({ terms }) => {
    terms.forEach((t) => {
      totalCollected += t.paid;
      if (t.status === 'pending' || t.status === 'partial') totalPending += t.balance;
      if (t.status === 'overdue') totalOverdue += t.balance;
    });
  });
  const totalExpected = Object.keys(feesByStudent).length * feeStructure.total * 3;
  return {
    totalCollected,
    totalPending,
    totalOverdue,
    collectionRate: Math.round((totalCollected / totalExpected) * 1000) / 10,
  };
}
