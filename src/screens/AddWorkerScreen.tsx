import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addWorker, updateWorker } from '../db/storage';
import { Worker } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const TRADES = ['Construction Worker', 'Paint Worker', 'Plumber', 'Electrician', 'Iron Worker', 'Tiling', 'Other'];

export default function AddWorkerScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const existing: Worker | undefined = location.state?.worker;
  const isEdit = !!existing;
  const { s, isRTL } = useLanguage();

  const [name, setName] = useState(existing?.name ?? '');
  const [trade, setTrade] = useState(existing?.trade ?? '');
  const [totalFee, setTotalFee] = useState(existing ? String(existing.totalFee) : '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (!name.trim()) { setError(s.errMissingName); return; }
    if (!trade.trim()) { setError(s.errMissingTrade); return; }
    if (!totalFee || isNaN(parseFloat(totalFee)) || parseFloat(totalFee) <= 0) { setError(s.errInvalidAmount); return; }

    if (isEdit && existing) {
      updateWorker(existing.id, name.trim(), trade.trim(), parseFloat(totalFee), note.trim());
    } else {
      addWorker(name.trim(), trade.trim(), parseFloat(totalFee), note.trim());
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
        <span className="sub-header-title">{isEdit ? s.editWorkerTitle : s.addWorkerTitle}</span>
      </div>
      <div className="screen-content" style={{ paddingBottom: 20 }}>
        <div className="form-page" dir={dir}>
          {error && <div style={{ background: '#FEE2E2', color: '#E74C3C', padding: '10px 12px', borderRadius: 8, fontSize: 14 }}>{error}</div>}

          <label className="form-label">{s.labelWorkerName}</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder={s.phWorkerName} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <label className="form-label">{s.labelTrade}</label>
          <div className="cat-grid">
            {TRADES.map(t => {
              const selected = trade === t;
              const label = (s as any)[t] ?? t;
              return (
                <button key={t} className={`cat-chip${selected ? ' selected' : ''}`}
                  style={{ color: selected ? '#fff' : '#9B59B6', borderColor: '#9B59B6', background: selected ? '#9B59B6' : '#fff' }}
                  onClick={() => setTrade(t)}>
                  {label}
                </button>
              );
            })}
          </div>
          <input className="form-input" value={trade} onChange={e => setTrade(e.target.value)} placeholder={s.phTrade} style={{ textAlign: isRTL ? 'right' : 'left', marginTop: 4 }} />

          <label className="form-label">{s.labelTotalFee}</label>
          <input className="form-input" type="number" inputMode="decimal" value={totalFee} onChange={e => setTotalFee(e.target.value)} placeholder={s.phAmount} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <label className="form-label">{s.labelNote}</label>
          <textarea className="form-input multiline" value={note} onChange={e => setNote(e.target.value)} placeholder={s.phNote} style={{ textAlign: isRTL ? 'right' : 'left' }} />

          <button className="save-btn" onClick={handleSave}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            {isEdit ? s.saveChanges : s.saveWorker}
          </button>
        </div>
      </div>
    </div>
  );
}
