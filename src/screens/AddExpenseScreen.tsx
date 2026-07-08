import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addExpense, updateExpense, getPayeeSuggestions } from '../db/storage';
import { CATEGORIES, CATEGORY_COLORS, Expense } from '../types';
import { todayDisplay, isValidDisplayDate, parseInputDate, formatDate } from '../utils/date';
import { useLanguage } from '../contexts/LanguageContext';

export default function AddExpenseScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const existing: Expense | undefined = location.state?.expense;
  const isEdit = !!existing;
  const { s, isRTL } = useLanguage();

  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState<string>(existing?.category ?? 'Materials');
  const [date, setDate] = useState(existing ? formatDate(existing.date) : todayDisplay());
  const [payee, setPayee] = useState(existing?.payee ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const payeeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (payee.length >= 1) {
      getPayeeSuggestions(payee).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [payee]);

  const handleSave = async () => {
    setError('');
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { setError(s.errInvalidAmount); return; }
    if (!description.trim()) { setError(s.errMissingDesc); return; }
    if (!isValidDisplayDate(date)) { setError(s.errInvalidDate); return; }

    setSaving(true);
    try {
      const isoDate = parseInputDate(date);
      if (isEdit && existing) {
        await updateExpense(existing.id, parseFloat(amount), description.trim(), category, isoDate, payee.trim(), note.trim());
      } else {
        await addExpense(parseFloat(amount), description.trim(), category, isoDate, payee.trim(), note.trim());
      }
      navigate(-1);
    } catch {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
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
        <span className="sub-header-title">{isEdit ? s.editExpenseTitle : s.addExpenseTitle}</span>
      </div>
      <div className="screen-content" style={{ paddingBottom: 20 }}>
        <div className="form-page" dir={dir}>
          {error && <div style={{ background: '#FEE2E2', color: '#E74C3C', padding: '10px 12px', borderRadius: 8, fontSize: 14 }}>{error}</div>}

          <label className="form-label">{s.labelAmount}</label>
          <input className="form-input" type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder={s.phAmount} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <label className="form-label">{s.labelDescription}</label>
          <input className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder={s.phDescription} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <label className="form-label">{s.labelCategory}</label>
          <div className="cat-grid">
            {CATEGORIES.map(cat => {
              const color = CATEGORY_COLORS[cat];
              const selected = category === cat;
              const label = (s as any)[cat] ?? cat;
              return (
                <button key={cat} className={`cat-chip${selected ? ' selected' : ''}`}
                  style={{ color: selected ? '#fff' : color, borderColor: color, background: selected ? color : '#fff' }}
                  onClick={() => setCategory(cat)}>
                  {label}
                </button>
              );
            })}
          </div>
          <input
            className="form-input"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Or type a custom category..."
            style={{ textAlign: isRTL ? 'right' : 'left', marginTop: 6 }}
          />

          <label className="form-label">{s.labelDate}</label>
          <input className="form-input" value={date} onChange={e => setDate(e.target.value)} placeholder={s.phDate} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <label className="form-label">{s.labelPaidTo}</label>
          <div className="payee-wrap">
            <input ref={payeeRef} className="form-input" value={payee} onChange={e => setPayee(e.target.value)} placeholder={s.phPayee} style={{ textAlign: isRTL ? 'right' : 'left' }} />
            {suggestions.length > 0 && (
              <div className="payee-suggestions">
                {suggestions.map(sug => (
                  <div key={sug} className="payee-sug-item" onMouseDown={() => { setPayee(sug); setSuggestions([]); }}>
                    {sug}
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="form-label">{s.labelNote}</label>
          <textarea className="form-input multiline" value={note} onChange={e => setNote(e.target.value)} placeholder={s.phNote} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <button className="save-btn" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            {saving ? 'Saving…' : isEdit ? s.saveChanges : s.saveExpense}
          </button>
        </div>
      </div>
    </div>
  );
}
