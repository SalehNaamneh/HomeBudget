import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addWorkerPayment, addExpense } from '../db/storage';
import { Worker } from '../types';
import { todayDisplay, isValidDisplayDate, parseInputDate } from '../utils/date';
import { useLanguage } from '../contexts/LanguageContext';

export default function AddPaymentScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const worker: Worker | undefined = location.state?.worker;
  const { s, isRTL } = useLanguage();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayDisplay());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { setError(s.errInvalidAmount); return; }
    if (!isValidDisplayDate(date)) { setError(s.errInvalidDate); return; }

    const isoDate = parseInputDate(date);
    // Use the worker's actual trade name as the category — no fallback to 'Other'
    const category = worker?.trade ?? 'Other';
    const description = worker ? `Payment — ${worker.name}` : 'Worker Payment';
    const expenseId = addExpense(parseFloat(amount), description, category, isoDate, worker?.name ?? '', note.trim());
    addWorkerPayment(parseInt(id!), parseFloat(amount), isoDate, note.trim(), expenseId);
    navigate(-1);
  };

  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div className="app-shell">
      <div className="sub-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points={isRTL ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
          </svg>
        </button>
        <span className="sub-header-title">{s.addPayment}{worker ? ` — ${worker.name}` : ''}</span>
      </div>
      <div className="screen-content" style={{ paddingBottom: 20 }}>
        <div className="form-page" dir={dir}>
          {error && <div style={{ background: '#FEE2E2', color: '#E74C3C', padding: '10px 12px', borderRadius: 8, fontSize: 14 }}>{error}</div>}

          <label className="form-label">{s.labelPaymentAmount}</label>
          <input className="form-input" type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder={s.phAmount} style={{ textAlign: isRTL ? 'right' : 'left' }} autoFocus />

          <label className="form-label">{s.labelDate}</label>
          <input className="form-input" value={date} onChange={e => setDate(e.target.value)} placeholder={s.phDate} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <label className="form-label">{s.labelNote}</label>
          <textarea className="form-input multiline" value={note} onChange={e => setNote(e.target.value)} placeholder={s.phNote} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <button className="save-btn" onClick={handleSave}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            {s.savePayment}
          </button>
        </div>
      </div>
    </div>
  );
}
