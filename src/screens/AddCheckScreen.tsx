import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addCheck, updateCheck, getPayeeSuggestions } from '../db/storage';
import { Check } from '../types';
import { todayDisplay, isValidDisplayDate, parseInputDate, formatDate } from '../utils/date';
import { useLanguage } from '../contexts/LanguageContext';

export default function AddCheckScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const existing: Check | undefined = location.state?.check;
  const isEdit = !!existing;
  const { s, isRTL } = useLanguage();

  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [payee, setPayee] = useState(existing?.payee ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [date, setDate] = useState(existing ? formatDate(existing.withdrawal_date) : todayDisplay());
  const [checkNumber, setCheckNumber] = useState(existing?.check_number ?? '');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (payee.length >= 1) setSuggestions(getPayeeSuggestions(payee));
    else setSuggestions([]);
  }, [payee]);

  const handleSave = () => {
    setError('');
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { setError(s.errInvalidAmount); return; }
    if (!payee.trim()) { setError(s.errMissingPayee); return; }
    if (!isValidDisplayDate(date)) { setError(s.errInvalidDate); return; }

    const isoDate = parseInputDate(date);
    if (isEdit && existing) {
      updateCheck(existing.id, parseFloat(amount), payee.trim(), note.trim(), isoDate, checkNumber.trim());
    } else {
      addCheck(parseFloat(amount), payee.trim(), note.trim(), isoDate, checkNumber.trim());
    }
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
        <span className="sub-header-title">{isEdit ? s.editCheckTitle : s.addCheckTitle}</span>
      </div>
      <div className="screen-content" style={{ paddingBottom: 20 }}>
        <div className="form-page" dir={dir}>
          {error && <div style={{ background: '#FEE2E2', color: '#E74C3C', padding: '10px 12px', borderRadius: 8, fontSize: 14 }}>{error}</div>}

          <label className="form-label">{s.labelAmount}</label>
          <input className="form-input" type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder={s.phAmount} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <label className="form-label">{s.labelCheckFor}</label>
          <div className="payee-wrap">
            <input className="form-input" value={payee} onChange={e => setPayee(e.target.value)} placeholder={s.phCheckPayee} style={{ textAlign: isRTL ? 'right' : 'left' }} />
            {suggestions.length > 0 && (
              <div className="payee-suggestions">
                {suggestions.map(sug => (
                  <div key={sug} className="payee-sug-item" onMouseDown={() => { setPayee(sug); setSuggestions([]); }}>{sug}</div>
                ))}
              </div>
            )}
          </div>

          <label className="form-label">{s.labelWithdrawalDate}</label>
          <input className="form-input" value={date} onChange={e => setDate(e.target.value)} placeholder={s.phCheckDate} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <label className="form-label">{s.labelCheckNumber}</label>
          <input className="form-input" value={checkNumber} onChange={e => setCheckNumber(e.target.value)} placeholder={s.phCheckNumber} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <label className="form-label">{s.labelNote}</label>
          <textarea className="form-input multiline" value={note} onChange={e => setNote(e.target.value)} placeholder={s.phCheckNote} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <button className="save-btn" onClick={handleSave}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            {isEdit ? s.saveChanges : s.saveCheck}
          </button>
        </div>
      </div>
    </div>
  );
}
